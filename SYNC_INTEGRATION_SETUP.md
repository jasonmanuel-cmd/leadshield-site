# Complete Sync Integration Setup Guide

## Overview

Your Android app and Next.js backend now work together with per-user sync tokens. Here's everything you need to do to get it working end-to-end.

---

## **Step 1: Deploy Database Migration** ✅

The `customer_sync_tokens` table has been created in:
```
supabase/migrations/20260507_create_customer_sync_tokens.sql
```

**To deploy this to your Supabase database:**

```bash
cd c:\Users\blunt\Desktop\programs\leadshield-crm

# Push migrations to your Supabase project
npx supabase db push
# or manually run the SQL in your Supabase dashboard
```

---

## **Step 2: Update Environment Variables** 

You can now **REMOVE** the global `LEADSHIELD_SYNC_TOKEN` from your environment since we're using per-user tokens:

```bash
# .env.local (Next.js)
# REMOVE or COMMENT OUT:
# LEADSHIELD_SYNC_TOKEN=xxxx

# These should already exist:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## **Step 3: Generate Tokens on Subscription Upgrade**

When a customer upgrades to OPERATOR tier or above, you need to generate a sync token. Here's where to add this:

### **If using Google Play Billing (Android):**

```typescript
// In your webhook handler for Google Play subscriptions
// Example: app/api/webhooks/google-play.ts

import { generateSyncTokenForCustomer, shouldGenerateSyncToken } from '@/lib/sync-token-manager'

export async function POST(request: Request) {
  const event = await request.json()
  
  // When subscription is activated
  if (event.type === 'SUBSCRIPTION_ACTIVATED' || event.subscriptionStatus === 'ACTIVE') {
    const userId = event.userId // from your auth system
    const tier = event.tier // 'operator', 'voice', 'team', etc.
    const deviceId = event.deviceId // optional

    if (shouldGenerateSyncToken(tier)) {
      try {
        const syncToken = await generateSyncTokenForCustomer(userId, tier, deviceId)
        // Optionally send token back to Android app or user
        return Response.json({ syncToken, syncUrl: '/api/sync' })
      } catch (error) {
        console.error('Failed to generate sync token:', error)
        return Response.json({ error: 'Failed to setup sync' }, { status: 500 })
      }
    }
  }

  return Response.json({ ok: true })
}
```

### **If using Stripe:**

```typescript
// In your webhook handler: app/api/webhooks/stripe.ts

import Stripe from 'stripe'
import { generateSyncTokenForCustomer, shouldGenerateSyncToken } from '@/lib/sync-token-manager'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature')!
  const body = await request.text()
  
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return Response.json({ error: 'Webhook error' }, { status: 400 })
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)

    // Map Stripe price to your tier
    const tier = getPriceIdToTierMap()[subscription.items.data[0].price.id] // 'operator', 'voice', etc.
    const userId = subscription.metadata?.userId // Store user ID in subscription metadata

    if (userId && shouldGenerateSyncToken(tier)) {
      try {
        await generateSyncTokenForCustomer(userId, tier as any)
      } catch (error) {
        console.error('Failed to generate sync token:', error)
      }
    }
  }

  return Response.json({ ok: true })
}

function getPriceIdToTierMap() {
  return {
    [process.env.STRIPE_PRICE_OPERATOR!]: 'operator',
    [process.env.STRIPE_PRICE_VOICE!]: 'voice',
    [process.env.STRIPE_PRICE_TEAM!]: 'team',
  }
}
```

---

## **Step 4: Handle Subscription Cancellation**

When a subscription is cancelled/downgraded below OPERATOR tier, revoke the sync token:

```typescript
import { revokeSyncTokenForCustomer } from '@/lib/sync-token-manager'

if (event.type === 'customer.subscription.deleted' || event.downgraded) {
  const userId = event.userId
  try {
    await revokeSyncTokenForCustomer(userId)
  } catch (error) {
    console.error('Failed to revoke sync token:', error)
  }
}
```

---

## **Step 5: Android App Gets Credentials**

When the Android app calls `/api/sync-credentials`, it will now:

1. ✅ Check if user is authenticated
2. ✅ Look up their active sync token from `customer_sync_tokens`
3. ✅ Verify they have OPERATOR tier or above
4. ✅ Return the token + sync URL

The Android app will store this token in preferences and use it for all subsequent syncs.

---

## **Testing the Integration**

### **Manual Token Generation (for testing):**

```bash
# From Next.js app (e.g., in an admin API route)
cd c:\Users\blunt\Desktop\programs\leadshield-crm
```

Create a test endpoint to manually generate tokens:

```typescript
// app/api/admin/generate-test-token.ts

import { generateSyncTokenForCustomer } from '@/lib/sync-token-manager'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Add your own admin auth check here
  const { userId, tier } = await request.json()

  try {
    const token = await generateSyncTokenForCustomer(userId, tier)
    return NextResponse.json({ token })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

Then test with curl:

```bash
curl -X POST http://localhost:3000/api/admin/generate-test-token \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id", "tier": "operator"}'
```

### **Test the Android app:**

1. Sign in on Android app with an OPERATOR tier account
2. Open the app and trigger a missed call
3. Check the `/api/sync` endpoint logs to see if the sync was successful

---

## **What's Changed**

| Component | Before | After |
|-----------|--------|-------|
| Token Storage | Global env var | Per-user database table |
| Token Validation | Single global token | Per-user token lookup with tier check |
| Tier Enforcement | Only in documentation | Enforced in `/api/sync-credentials` |
| Token Generation | Manual/undocumented | Automated via `sync-token-manager.ts` |
| Credential Endpoint | Global token served | Per-user token fetched from DB |

---

## **Architecture Diagram**

```
┌─────────────────────────────────────────────────┐
│  Customer Upgrades to OPERATOR Tier             │
│  (Payment: Google Play, Stripe, etc)            │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
         ┌───────────────────┐
         │ Your Webhook      │
         │ Handler           │
         └────────┬──────────┘
                  │ calls
                  ▼
      ┌─────────────────────────────┐
      │ generateSyncTokenForCustomer │
      │ (lib/sync-token-manager.ts) │
      └────────────┬────────────────┘
                   │ stores
                   ▼
      ┌──────────────────────┐
      │ customer_sync_tokens │
      │ Supabase Table       │
      └─────────┬────────────┘
                │
                ▼
    ┌────────────────────────────┐
    │ Android App fetches token  │
    │ GET /api/sync-credentials  │
    └────────┬───────────────────┘
             │ returns per-user
             │ sync token
             ▼
    ┌─────────────────────────────┐
    │ On Missed Call Event        │
    │ POST /api/sync              │
    │ Bearer {user_sync_token}    │
    └────────┬────────────────────┘
             │ validates token
             │ checks tier
             ▼
    ┌──────────────────────┐
    │ Sync Success! 🎉     │
    │ Dashboard updates    │
    │ in real-time         │
    └──────────────────────┘
```

---

## **Troubleshooting**

| Issue | Cause | Fix |
|-------|-------|-----|
| `Invalid or expired sync token` | No token in DB | Check subscription webhook is firing |
| `Sync not available for your tier` | Token exists but tier < OPERATOR | Verify tier in `customer_sync_tokens` |
| `Missing Bearer token` | Android not storing token | Check `getLeadShieldSyncTokenSync()` in Android app |
| Tokens not syncing to DB | Webhook not implemented | Add webhook handler in your payment provider |

---

## **Next Steps**

1. ✅ Deploy the database migration to Supabase
2. ✅ Update `/api/sync` endpoint (DONE - uses per-user token validation)
3. ✅ Update `/api/sync-credentials` endpoint (DONE - fetches per-user token)
4. ✅ Create `sync-token-manager.ts` utility (DONE - ready to use)
5. ⏳ Add token generation to your payment webhook handler
6. ⏳ Test end-to-end with Android app
7. ⏳ Monitor `/api/sync` logs to verify syncs are working

---

## **Files Changed**

- ✅ `supabase/migrations/20260507_create_customer_sync_tokens.sql` - New table
- ✅ `app/api/sync/route.ts` - Updated validation logic
- ✅ `app/api/sync-credentials/route.ts` - Updated to fetch per-user token
- ✅ `lib/sync-token-manager.ts` - New utility for token lifecycle management
