# LeadShield Android-to-Web Sync Integration Guide

This document explains how to wire the Android app for seamless real-time syncing to the LeadShield command center web dashboard. When customers download and pay for the **Operator** tier or above, they automatically get access to live sync.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Android App (Jetpack Compose + Kotlin)                     │
│                                                              │
│  ┌─────────────────┐         ┌────────────────────────────┐ │
│  │  CallReceiver   │────────▶│ LeadShieldSyncManager      │ │
│  │  (Missed Calls) │         │ (Syncs to /api/sync)       │ │
│  └─────────────────┘         └────────────────────────────┘ │
│                                         │                    │
└─────────────────────────────────────────┼────────────────────┘
                                          │
                                    HTTP POST
                                  (Bearer Token)
                                          │
        ┌─────────────────────────────────▼──────────────────┐
        │  Next.js Backend                                   │
        │                                                     │
        │  POST /api/sync                                    │
        │  ├─ Validate Bearer token                         │
        │  ├─ Check subscription tier (OPERATOR+)           │
        │  ├─ Upsert leads, messages, call events           │
        │  └─ Return sync summary                           │
        │                                                     │
        └──────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  Supabase (PostgreSQL)       │
        │  Tables:                     │
        │  - leads                     │
        │  - conversation_messages     │
        │  - call_events               │
        └──────────────────────────────┘
        
        ┌──────────────────────────────────────────────────────┐
        │  Next.js Dashboard (Real-time)                       │
        │  - Live lead activity                               │
        │  - Conversation threads                             │
        │  - Call analytics                                   │
        │  - Priority queue                                   │
        └──────────────────────────────────────────────────────┘
```

## Step-by-Step Integration

### 1. Generate LEADSHIELD_SYNC_TOKEN for a Customer

When a customer upgrades to **Operator** tier (via Google Play Billing), generate a unique sync token:

```typescript
// On your backend (Next.js API route or Firebase function)
// Called when customer successfully completes payment

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

async function generateSyncTokenForCustomer(userId: string) {
  // Generate a unique, cryptographically secure token for this customer
  const token = crypto.randomBytes(32).toString('hex')
  
  // Store mapping: token → user_id in Supabase
  // This could be a new table or stored in user metadata
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  
  await supabase
    .from('customer_sync_tokens')
    .upsert({
      user_id: userId,
      sync_token: token,
      tier: 'operator',
      created_at: new Date().toISOString()
    })
  
  return token
}
```

### 2. Deliver Token to Android App

After payment succeeds, send the token to the customer's phone. Two options:

**Option A: In-app download link**
```kotlin
// On Android: After successful payment/upgrade confirmation
// Store token securely using DataStore (already encrypted on modern Android)

val prefs = AppPreferences(context)
prefs.saveLeadShieldSyncCredentials(
  token = "sync_token_from_backend",
  url = "https://crm.leadshield.io"  // Your Next.js domain
)
```

**Option B: Via Firebase Cloud Messaging (FCM)**
```json
{
  "notification": {
    "title": "Your Command Center is Ready!",
    "body": "Real-time sync enabled for Operator tier"
  },
  "data": {
    "action": "sync_token_update",
    "sync_token": "sync_token_from_backend",
    "sync_url": "https://crm.leadshield.io"
  }
}
```

Then handle in Firebase Messaging Service:
```kotlin
override fun onMessageReceived(remoteMessage: RemoteMessage) {
  val syncToken = remoteMessage.data["sync_token"]
  val syncUrl = remoteMessage.data["sync_url"]
  
  if (syncToken != null && syncUrl != null) {
    lifecycleScope.launch {
      prefs.saveLeadShieldSyncCredentials(syncToken, syncUrl)
    }
  }
}
```

### 3. Android App Automatically Syncs on Missed Calls

Once the token is stored, the sync happens automatically:

```kotlin
// In CallReceiver.kt (already implemented)

@Inject
lateinit var leadShieldSync: LeadShieldSyncManager

override fun handleMissedCall(phoneNumber: String) {
  receiverScope.launch {
    // 1. Send auto-reply SMS (existing)
    smsHandler.processMissedCall(phoneNumber)
    
    // 2. Sync to web dashboard (new)
    leadShieldSync.syncMissedCallAsync(phoneNumber, null)
  }
}
```

The sync manager checks:
- ✅ Customer has OPERATOR tier or above
- ✅ Sync token is configured
- ✅ User is authenticated
- ✅ Network is available

If any check fails, it silently returns (doesn't break the app).

### 4. What Gets Synced

#### On Each Missed Call
```json
{
  "user_id": "uuid-from-supabase-auth",
  "call_events": [
    {
      "phone_number": "+1 (555) 123-4567",
      "call_type": "incoming",
      "ai_handled": true,
      "occurred_at": "2026-05-02T15:30:00Z"
    }
  ]
}
```

#### When Customer Creates a Lead (optional integration)
```kotlin
// In LeadCreationFlow or AiConversationManager
leadShieldSync.syncLeadAsync(
  phoneNumber = contact.phoneNumber,
  contactName = contact.name,
  serviceNeeded = contact.serviceNeeded,
  city = contact.city,
  urgencyLevel = "urgent",  // or "normal", "low"
  status = "new"
)
```

Payload:
```json
{
  "user_id": "uuid-from-supabase-auth",
  "leads": [
    {
      "phone_number": "+1 (555) 123-4567",
      "contact_name": "John Doe",
      "service_needed": "Emergency plumbing",
      "city": "Los Angeles, CA",
      "urgency_level": "urgent",
      "status": "new"
    }
  ]
}
```

#### When AI Sends a Reply (optional integration)
```kotlin
// In AiConversationManager or SmsHandler
leadShieldSync.syncConversationMessageAsync(
  phoneNumber = contact.phoneNumber,
  role = "ai",
  content = "Hi John! I'm on a job but available in 30min. What's the emergency?"
)
```

Payload:
```json
{
  "user_id": "uuid-from-supabase-auth",
  "conversation_messages": [
    {
      "phone_number": "+1 (555) 123-4567",
      "role": "ai",
      "content": "Hi John! I'm on a job but available in 30min. What's the emergency?",
      "sent_at": "2026-05-02T15:35:00Z"
    }
  ]
}
```

### 5. Sync Endpoint Response

The `/api/sync` endpoint returns:

```json
{
  "ok": true,
  "summary": {
    "leadsReceived": 1,
    "leadsCreated": 1,
    "leadsUpdated": 0,
    "messagesReceived": 1,
    "messagesInserted": 0,
    "messagesUpdated": 1,
    "callEventsReceived": 1,
    "callEventsInserted": 1,
    "callEventsUpdated": 0
  }
}
```

### 6. Error Handling in Android

The sync manager gracefully handles errors:

```kotlin
// No changes needed - already handled in LeadShieldSyncManager

// Examples of graceful failures:
// - 401 Unauthorized → Token expired/invalid (log warning, continue)
// - 400 Bad Request → Invalid payload (log error, continue)
// - 500 Server Error → Backend down (log error, continue)
// - Network timeout → No connectivity (log debug, continue)

// The app ALWAYS continues operating, sync failures don't block UX
```

Logs appear in Android Studio:
```
D/LeadShieldSyncManager: Syncing missed call from +1234567890 to LeadShield
I/LeadShieldSyncManager: Sync successful for call from +1234567890
```

## Configuration Checklist

### Backend (Next.js)

- [ ] Ensure `/api/sync` endpoint is deployed and returns 200 on successful sync
- [ ] Endpoint validates `Authorization: Bearer {token}` header
- [ ] Endpoint checks user's subscription tier is OPERATOR or above
- [ ] Endpoint stores token → user_id mapping for validation
- [ ] Environment variable `LEADSHIELD_SYNC_TOKEN` is NOT used (each customer gets unique token)

### Android App

- [ ] `LeadShieldSyncManager.kt` is created and injected with Hilt
- [ ] `LeadShieldApi` interface is added to network module
- [ ] `AppPreferences` has `saveLeadShieldSyncCredentials()` method
- [ ] `CallReceiver` injects `LeadShieldSyncManager` and calls sync on missed call
- [ ] Retrofit client is configured to point to your Next.js domain
- [ ] Customer subscription tier is tracked (via Google Play Billing)

### Payment Flow

- [ ] When customer upgrades to Operator tier → Generate sync token
- [ ] Send token to Android app (via FCM or download link)
- [ ] Android app stores token in encrypted DataStore
- [ ] Sync starts automatically on next missed call

## Testing the Integration

### Test Payload (Curl)

```bash
# Test against your production sync endpoint
curl -X POST https://crm.leadshield.io/api/sync \
  -H "Authorization: Bearer sync_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid-here",
    "call_events": [
      {
        "phone_number": "+1234567890",
        "call_type": "incoming",
        "ai_handled": true,
        "occurred_at": "2026-05-02T15:30:00Z"
      }
    ]
  }'
```

Expected response:
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

### Test in Android App

1. **Manually set token** (for testing before payment integration)
   ```kotlin
   val prefs = AppPreferences(context)
   prefs.saveLeadShieldSyncCredentials(
     token = "sync_token_here",
     url = "https://crm.leadshield.io"
   )
   ```

2. **Simulate missed call** (or trigger real missed call)
   - Watch Android Studio logcat for sync logs
   - Check web dashboard to see new call event appear
   - Should appear in real-time (Supabase realtime subscriptions)

3. **Verify dashboard updates**
   - Go to `https://crm.leadshield.io/dashboard`
   - Should see new call event in Recent Activity
   - Should see updated metrics (call count, etc.)

## Migration: Existing Customers

For customers already on Operator tier (before this feature was built):

1. Generate sync tokens for all existing Operator+ customers
2. Store tokens in `customer_sync_tokens` table
3. Send via FCM or next login
4. Sync becomes active once token is saved on phone

```sql
-- Generate tokens for existing operators
UPDATE users 
SET sync_token = encode(gen_random_bytes(32), 'hex')
WHERE subscription_tier = 'operator' 
  AND sync_token IS NULL;
```

## Troubleshooting

### Sync is not working

1. **Check Android logs**
   ```
   D/LeadShieldSyncManager: Skipping sync: Subscription tier below OPERATOR
   ```
   → Customer needs to upgrade to Operator tier

2. **Check token is stored**
   ```kotlin
   val token = prefs.getLeadShieldSyncTokenSync()
   Log.d("DEBUG", "Token: $token")  // Should not be empty
   ```

3. **Check network connectivity**
   - Turn on airplane mode to verify timeout handling
   - App should continue working (sync silently fails)

4. **Check Next.js logs**
   ```bash
   # If using Vercel
   vercel logs  
   # Should see POST /api/sync requests
   ```

5. **Verify token is valid**
   - Token might have expired
   - Regenerate in payment backend when customer re-subscribes

### Dashboard not updating in real-time

1. Check Supabase realtime settings
   ```sql
   -- Ensure realtime is enabled for these tables
   SELECT * FROM _realtime.subscriptions;
   ```

2. Check browser console for WebSocket errors
3. Verify user_id matches in all tables

## Performance & Quotas

- **Sync timeout**: 5 seconds per request
- **Batch size**: No limit (but recommend < 100 events per request)
- **Frequency**: Real-time (as soon as missed call detected)
- **Data usage**: ~1-5 KB per sync (minimal)
- **Server quotas**: 
  - Supabase (free tier): 50K RLS row limit
  - Each sync increments row count slightly
  - Recommend: Monitor row count if expecting 1000+ events/day

## Security

- ✅ Bearer token is cryptographically random (32 bytes = 256 bits)
- ✅ Token stored in encrypted DataStore (Android 9+)
- ✅ Token validated on every sync request
- ✅ Tier checked before accepting sync payload
- ✅ Token specific to customer (not shared)
- ✅ Network request uses HTTPS only

**Next steps to harden**:
- [ ] Add token rotation (e.g., expire after 90 days)
- [ ] Add rate limiting (e.g., max 1000 syncs/day per customer)
- [ ] Add audit logging (who synced what, when)
- [ ] Add token revocation when customer downgrades

## Next Phase: Web Integration

Once Android sync is working, enable reverse sync (web → Android):

```
Next.js Dashboard 
  │
  ├─▶ Customer replies to call in web UI
  └─▶ Send push notification to Android app
  │
  ├─▶ Android app updates local call status
  └─▶ Show sync badge: "Updated from web"
```

This requires:
- FCM integration in Android app (receive notifications)
- Dashboard action buttons to push updates
- Conflict resolution (if web and phone edit simultaneously)

