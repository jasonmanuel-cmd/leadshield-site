# Backend Token Generation & Subscription Flow

This document explains how to integrate the sync token generation with your Next.js payment backend. When a customer upgrades to **Operator** tier or above, they receive a unique sync token for the Android app.

## Payment Flow Integration

### 1. When Customer Upgrades (Payment Provider)

**Trigger**: After successful payment (Google Play Billing, Stripe, etc.)

**What to do**:
```typescript
// Backend event handler (e.g., Google Cloud Function, Webhook)
// Triggered when: Subscription purchased, status=ACTIVE

import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

async function handleSubscriptionActivated(event: {
  userId: string
  tier: 'pro' | 'operator' | 'voice' | 'team'
  email: string
  deviceId?: string  // From Android app
}) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // 1. Generate unique sync token for this customer
  const syncToken = crypto.randomBytes(32).toString('hex')

  // 2. Store mapping: token → user_id + tier
  await supabase.from('customer_sync_tokens').upsert({
    user_id: event.userId,
    sync_token: syncToken,
    tier: event.tier,
    device_id: event.deviceId || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true
  })

  // 3. Send token to customer (see "Delivery" section below)
  await sendSyncTokenToCustomer(event.userId, event.email, syncToken)

  console.log(`✅ Generated sync token for user ${event.userId}, tier: ${event.tier}`)
}
```

### 2. Supabase Table Schema

Create this table to store customer sync tokens:

```sql
-- Create table for sync tokens
CREATE TABLE public.customer_sync_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_token TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('pro', 'operator', 'voice', 'team', 'master')),
  device_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  expires_at TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMP,
  CONSTRAINT unique_user_active_token UNIQUE (user_id, is_active) WHERE is_active = true
);

-- Enable RLS
ALTER TABLE public.customer_sync_tokens ENABLE ROW LEVEL SECURITY;

-- Customers can only see their own tokens
CREATE POLICY "Users can read their own sync tokens"
  ON public.customer_sync_tokens FOR SELECT
  USING (user_id = auth.uid());

-- Service role can read all
CREATE POLICY "Service role can manage sync tokens"
  ON public.customer_sync_tokens FOR ALL
  USING (auth.role() = 'service_role');

-- Index for fast lookups
CREATE INDEX idx_customer_sync_tokens_token ON public.customer_sync_tokens(sync_token);
CREATE INDEX idx_customer_sync_tokens_user_id ON public.customer_sync_tokens(user_id);
```

### 3. Sync Endpoint Validation

Update your `/api/sync` endpoint to validate tokens:

```typescript
// app/api/sync/route.ts

import { createClient } from '@supabase/supabase-js'

async function validateSyncToken(token: string): Promise<{
  valid: boolean
  userId?: string
  tier?: string
}> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('customer_sync_tokens')
    .select('user_id, tier, is_active')
    .eq('sync_token', token)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return { valid: false }
  }

  // Check tier
  const OPERATOR_TIER_ID = 2
  const tierIds: Record<string, number> = {
    'pro': 1,
    'operator': 2,
    'voice': 4,
    'team': 5,
    'master': 3
  }

  const tierId = tierIds[data.tier] || 0
  if (tierId < OPERATOR_TIER_ID) {
    return { valid: false }  // Tier too low
  }

  // Update last_used_at
  await supabase
    .from('customer_sync_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('sync_token', token)

  return {
    valid: true,
    userId: data.user_id,
    tier: data.tier
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ ok: false, error: 'Missing Bearer token' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  const validation = await validateSyncToken(token)

  if (!validation.valid) {
    return Response.json({ ok: false, error: 'Invalid or expired token' }, { status: 401 })
  }

  // Rest of sync logic using validation.userId...
  // (existing implementation)
}
```

### 4. Token Delivery Methods

#### Option A: Firebase Cloud Messaging (FCM) - Recommended

Send immediately after payment success:

```typescript
import admin from 'firebase-admin'

async function sendSyncTokenToCustomer(
  userId: string,
  email: string,
  syncToken: string
) {
  // Get FCM token from your Supabase user metadata
  // (saved when user installs Android app)
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: user } = await supabase.auth.admin.getUserById(userId)
  const fcmToken = user?.user_metadata?.fcm_token

  if (!fcmToken) {
    console.warn(`No FCM token for user ${userId}, token will be available on next login`)
    return
  }

  const message = {
    token: fcmToken,
    notification: {
      title: '✨ Command Center Ready',
      body: 'Real-time sync enabled for Operator tier'
    },
    data: {
      action: 'sync_token_update',
      sync_token: syncToken,
      sync_url: 'https://crm.leadshield.io'
    }
  }

  try {
    await admin.messaging().send(message)
    console.log(`✅ FCM notification sent to ${email}`)
  } catch (error) {
    console.error(`Failed to send FCM to ${email}:`, error)
  }
}
```

#### Option B: Email with Download Link

Send token via email (simpler, but requires customer to manually enter):

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendSyncTokenToCustomer(
  userId: string,
  email: string,
  syncToken: string
) {
  const syncUrl = `https://crm.leadshield.io/setup/sync?token=${encodeURIComponent(syncToken)}`

  await resend.emails.send({
    from: 'noreply@leadshield.io',
    to: email,
    subject: '✨ Your LeadShield Command Center is Ready',
    html: `
      <h2>Welcome to Operator Tier!</h2>
      <p>Real-time sync is now enabled. Your Android app will automatically sync missed calls and leads to your command center.</p>
      
      <h3>Setup Your Sync Token</h3>
      <p>Your sync token:</p>
      <code style="background: #f0f0f0; padding: 10px; display: block; margin: 10px 0;">
        ${syncToken}
      </code>
      
      <p>Or use the automatic setup link:</p>
      <a href="${syncUrl}" style="background: #00d4ff; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Setup Sync Automatically
      </a>
      
      <h3>How it works</h3>
      <ul>
        <li>Missed calls appear on your dashboard in real-time</li>
        <li>Conversations sync automatically</li>
        <li>See all activity from your desktop</li>
      </ul>
    `
  })

  console.log(`✅ Sync token email sent to ${email}`)
}
```

### 5. Setup Page (Next.js)

Create a page to allow manual token entry or automatic setup:

```typescript
// app/setup/sync/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function SyncSetupPage() {
  const searchParams = useSearchParams()
  const [token, setToken] = useState('')
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    // If token in URL, auto-copy to clipboard
    const urlToken = searchParams.get('token')
    if (urlToken) {
      setToken(urlToken)
      copyToClipboard(urlToken)
    }
  }, [searchParams])

  const copyToClipboard = async (text: string) => {
    try {
      // Also generate QR code for easy Android scanning
      const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`
      setQrUrl(qrApi)

      // Copy to clipboard
      await navigator.clipboard.writeText(text)
      setStatus('copied')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Setup Command Center Sync</h1>

      {token && (
        <div className="space-y-4">
          <p className="text-gray-600">
            Your sync token is ready. Enter it in your Android app to start real-time syncing.
          </p>

          {qrUrl && (
            <div className="border-2 border-dashed p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-2">Scan with your Android app:</p>
              <img src={qrUrl} alt="Sync token QR code" className="mx-auto" />
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm break-all">{token}</div>

          <button
            onClick={() => copyToClipboard(token)}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded"
          >
            {status === 'copied' ? '✅ Copied!' : 'Copy Token'}
          </button>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold mb-2">Next Steps:</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Open your LeadShield app on your phone</li>
              <li>Go to Settings → Command Center</li>
              <li>Paste the token above</li>
              <li>Sync starts automatically on next missed call!</li>
            </ol>
          </div>
        </div>
      )}

      {!token && (
        <div className="space-y-4">
          <p className="text-gray-600">
            Didn't receive your sync token? Enter it here:
          </p>
          <input
            type="password"
            placeholder="Paste your sync token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
          <button
            onClick={() => copyToClipboard(token)}
            disabled={!token}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
          >
            Activate
          </button>
        </div>
      )}
    </div>
  )
}
```

### 6. Token Lifecycle Management

Tokens should be:
- **Generated**: When customer upgrades to Operator tier
- **Stored**: In `customer_sync_tokens` table
- **Validated**: On every sync request
- **Rotated**: Annually or on request (for security)
- **Revoked**: When customer downgrades or cancels

Implement token rotation:

```typescript
export async function POST(request: Request) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Check if token expired (90+ days old)
  const { data: tokenRecord } = await supabase
    .from('customer_sync_tokens')
    .select('created_at')
    .eq('sync_token', token)
    .single()

  if (tokenRecord) {
    const ageMs = Date.now() - new Date(tokenRecord.created_at).getTime()
    const ageDays = ageMs / (1000 * 60 * 60 * 24)

    if (ageDays > 90) {
      // Token is old - request rotation
      return Response.json(
        { ok: false, error: 'Token expired, please request new token' },
        { status: 401 }
      )
    }
  }

  // Continue with sync...
}
```

## Database Queries

### View all sync tokens for a user:
```sql
SELECT * FROM customer_sync_tokens WHERE user_id = 'USER_ID_HERE';
```

### Revoke a sync token (customer downgrade):
```sql
UPDATE customer_sync_tokens 
SET is_active = false 
WHERE user_id = 'USER_ID_HERE' AND is_active = true;
```

### Get sync statistics:
```sql
SELECT 
  tier,
  COUNT(*) as token_count,
  COUNT(CASE WHEN last_used_at IS NOT NULL THEN 1 END) as active_syncs,
  MAX(last_used_at) as latest_sync
FROM customer_sync_tokens
WHERE is_active = true
GROUP BY tier;
```

## Testing

### Manual Test (Postman/Curl)

1. Generate a token manually in database
2. Send POST to `/api/sync` with token:

```bash
curl -X POST https://crm.leadshield.io/api/sync \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid",
    "call_events": [{
      "phone_number": "+1234567890",
      "call_type": "incoming",
      "ai_handled": true,
      "occurred_at": "2026-05-02T15:30:00Z"
    }]
  }'
```

Expected response (200):
```json
{
  "ok": true,
  "summary": {
    "callEventsReceived": 1,
    "callEventsInserted": 1,
    "callEventsUpdated": 0,
    "leadsReceived": 0,
    "leadsCreated": 0,
    "leadsUpdated": 0,
    "messagesReceived": 0,
    "messagesInserted": 0,
    "messagesUpdated": 0
  }
}
```

### End-to-End Test

1. Create test user account
2. Simulate payment (upgrade to Operator)
3. Token should be generated → Check `customer_sync_tokens` table
4. Receive token (FCM or email)
5. Store in Android app settings
6. Simulate missed call
7. Verify sync appears in real-time dashboard

## Monitoring & Alerts

Set up alerts for:
- **Token validation failures**: More than 10 401 errors/hour
- **Inactive tokens**: No sync activity in 30 days
- **Overused tokens**: More than 1000 requests/day per token
- **Token generation failures**: Payment webhook but no token created

```sql
-- Create monitoring view
CREATE VIEW sync_token_health AS
SELECT 
  user_id,
  is_active,
  COUNT(*) as token_count,
  MAX(last_used_at) as last_used,
  EXTRACT(DAY FROM NOW() - MAX(last_used_at)) as days_since_use
FROM customer_sync_tokens
GROUP BY user_id, is_active
HAVING EXTRACT(DAY FROM NOW() - MAX(last_used_at)) > 30
  OR COUNT(*) > 1;  -- User has multiple tokens (unexpected)
```

## Security Checklist

- [ ] Tokens are cryptographically random (32+ bytes)
- [ ] Tokens are NOT logged in plain text
- [ ] Tokens are transmitted only over HTTPS
- [ ] Tokens are validated on every sync request
- [ ] Token → user_id mapping is audited
- [ ] Tokens are revoked on subscription downgrade
- [ ] Tokens expire after 90 days
- [ ] Rate limiting on sync endpoint (1000/day per token)

