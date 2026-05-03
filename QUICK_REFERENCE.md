# LeadShield Sync - Quick Reference Guide

## 🚀 One-Page Overview

### What Gets Synced?
- **Missed Calls** → Appear in dashboard instantly
- **Lead Info** → Contact name, service, city, urgency
- **AI Conversations** → Every reply syncs to web
- **Call History** → Full audit trail with timestamps

### Who Can Sync?
- ✅ **OPERATOR tier** and above (Pro tier: NO sync, free/trial: NO sync)
- ✅ Must have valid sync token (unique per customer)
- ✅ Must be on Android app v2.0+

### What Triggers Sync?
1. **Missed call detected** → Automatic sync (top priority)
2. **Lead created** → Can manually sync
3. **AI reply sent** → Can manually sync
4. **Payment upgrade** → Token generated automatically

---

## 📱 Android App Flow

```
User gets paid Operator tier
         ↓
Token generated on backend
         ↓
Sent to phone (FCM or email)
         ↓
User enters token in app
         ↓
Stored in encrypted DataStore
         ↓
Next missed call triggers sync
         ↓
CallReceiver → LeadShieldSyncManager → POST /api/sync
         ↓
Dashboard updates in real-time
```

### Android Code Changes

| Component | Change | File |
|-----------|--------|------|
| **LeadShieldSyncManager** | NEW class to handle sync | `data/LeadShieldSyncManager.kt` |
| **CallReceiver** | Inject manager + call sync | `receiver/CallReceiver.kt` |
| **AppPreferences** | Store/retrieve token | `data/AppPreferences.kt` |
| **SupabaseApi** | Add LeadShieldApi interface | `data/network/SupabaseApi.kt` |

### Key Methods

```kotlin
// In LeadShieldSyncManager
syncMissedCall(phoneNumber, contactName)           // Sync call event
syncLead(phone, name, service, city, urgency)      // Sync lead
syncConversationMessage(phone, role, content)      // Sync message
syncBatch(leads, messages, events)                 // Batch sync

// Async versions (non-blocking)
syncMissedCallAsync(phone, name)
syncLeadAsync(phone, name, service, city, urgency, status)
syncConversationMessageAsync(phone, role, content)
```

---

## 🌐 Next.js Backend Flow

```
Phone sends HTTP POST
         ↓
/api/sync endpoint receives request
         ↓
Validate Bearer token
         ↓
Check subscription tier ≥ OPERATOR
         ↓
Upsert leads table
Upsert messages table
Upsert call_events table
         ↓
Return 200 OK + summary
         ↓
Supabase realtime
         ↓
Dashboard UI updates instantly
```

### Endpoint Specification

```
POST /api/sync
Authorization: Bearer {sync_token}
Content-Type: application/json

Request:
{
  "user_id": "uuid-here",
  "leads": [
    {
      "phone_number": "+1234567890",
      "contact_name": "John",
      "service_needed": "Plumbing",
      "city": "LA",
      "urgency_level": "urgent",
      "status": "new"
    }
  ],
  "conversation_messages": [
    {
      "phone_number": "+1234567890",
      "role": "ai",
      "content": "Hi! Available in 30min",
      "sent_at": "2026-05-02T15:30:00Z"
    }
  ],
  "call_events": [
    {
      "phone_number": "+1234567890",
      "call_type": "incoming",
      "ai_handled": true,
      "occurred_at": "2026-05-02T15:30:00Z"
    }
  ]
}

Response (200):
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

---

## 💳 Payment Integration

### Token Generation Trigger

```
Google Play Billing Payment Success
         ↓
Backend webhook: "subscription.activated"
         ↓
Generate token: crypto.randomBytes(32).toString('hex')
         ↓
Store in Supabase: customer_sync_tokens table
{
  user_id: "uuid",
  sync_token: "random_32_bytes_hex",
  tier: "operator",
  created_at: now(),
  is_active: true
}
         ↓
Send to phone (FCM or email)
         ↓
User gets notified: "Command Center Ready!"
```

### Supabase Schema

```sql
CREATE TABLE customer_sync_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  sync_token TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP
);
```

---

## 🔐 Security Model

### Token Security
- **Generation**: 32 bytes of cryptographic randomness
- **Storage (Android)**: Encrypted via DataStore (Android 9+)
- **Storage (Backend)**: In Supabase with RLS
- **Transmission**: HTTPS only
- **Lifetime**: 90 days (optional rotation)
- **Access**: One customer one token (not shared)

### Validation Steps
1. Bearer token must be present
2. Token must exist in `customer_sync_tokens` table
3. Token must be `is_active = true`
4. Customer tier must be OPERATOR or above
5. Rate limit: 1000 requests/day per token (recommended)

### Revocation
- On downgrade: Set `is_active = false`
- On logout: Set `is_active = false`
- On payment failure: Set `is_active = false`

---

## 📊 Data Flow Diagram

```
┌─────────────────────┐
│   Android Phone     │
│  - Missed call      │
│  - AI reply         │
│  - Contact sync     │
└─────────┬───────────┘
          │ HTTP POST
          │ Bearer token
          ↓
┌─────────────────────┐
│  Next.js Backend    │
│  /api/sync          │
│  - Validate token   │
│  - Check tier       │
│  - Upsert data      │
└─────────┬───────────┘
          │ SQL INSERT/UPDATE
          ↓
┌─────────────────────┐
│  Supabase Postgres  │
│  - leads            │
│  - messages         │
│  - call_events      │
└─────────┬───────────┘
          │ Realtime
          │ Subscriptions
          ↓
┌─────────────────────┐
│  Next.js Dashboard  │
│  - Real-time UI     │
│  - WebSocket        │
│  - Instant updates  │
└─────────────────────┘
```

---

## ⚡ Performance Expectations

| Metric | Expected Value |
|--------|-----------------|
| **Sync latency** | 200-500ms (p95) |
| **Payload size** | 1-5 KB per sync |
| **Network data per sync** | ~2 KB |
| **Battery impact** | ~1-2% per 100 syncs |
| **Failure rate** | <0.1% (with proper infrastructure) |
| **Rate limit** | 1000 syncs/day per customer |

---

## 🧪 Testing Checklist

### Manual Testing

```bash
# 1. Generate test token
TEST_TOKEN="abcd1234efgh5678ijkl9012mnop3456"

# 2. Test endpoint
curl -X POST https://crm.leadshield.io/api/sync \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-id",
    "call_events": [{
      "phone_number": "+15551234567",
      "call_type": "incoming",
      "ai_handled": true,
      "occurred_at": "2026-05-02T15:30:00Z"
    }]
  }'

# Expected: 200 OK with summary

# 3. Check Supabase
# SELECT * FROM call_events WHERE phone_number = '+15551234567'
# Should see 1 new row with recent timestamp
```

### End-to-End Testing

1. **Create test account** → Upgrade to Operator tier
2. **Receive sync token** → Check email or FCM
3. **Enter token in Android app** → Settings → Command Center
4. **Simulate missed call** → Make test call and hang up
5. **Check dashboard** → New call should appear within 5 seconds
6. **Verify metadata** → Phone number, timestamp, AI handled flag

### Monitoring

```sql
-- Check sync health
SELECT 
  COUNT(*) as total_syncs,
  COUNT(DISTINCT user_id) as active_customers,
  MAX(created_at) as latest_sync
FROM call_events 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Check token usage
SELECT 
  tier,
  COUNT(*) as active_tokens,
  COUNT(CASE WHEN last_used_at IS NOT NULL THEN 1 END) as used,
  MAX(last_used_at) as latest_use
FROM customer_sync_tokens
WHERE is_active = true
GROUP BY tier;
```

---

## 🚨 Common Issues & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| "Sync not working" | Tier below OPERATOR | Check `SubscriptionManager.subscriptionStatus` |
| "401 Unauthorized" | Invalid/expired token | Regenerate token, resend to phone |
| "Silent sync (no error)" | Network issue | Check WiFi/mobile connectivity |
| "Duplicate leads" | Phone-side bug | Check `normalizePayloadList()` function |
| "Dashboard lag" | Realtime subscription issue | Refresh browser, check WebSocket |
| "Token missing from DataStore" | Payment not wired | Check FCM receiver or email link |

---

## 📅 Rollout Timeline

**Week 1**: Deploy Android code + Next.js updates
**Week 2**: Activate payment backend token generation
**Week 3**: Enable for pilot customers (5-10 Operator tier)
**Week 4**: Monitor + fix issues
**Week 5**: Open to all Operator+ customers
**Week 6+**: Monitor metrics + iterate

---

## 🎯 Success Metrics

Track these after launch:

- **Sync success rate** - Target: >99%
- **Sync latency (p95)** - Target: <500ms
- **Token generation time** - Target: <1 second
- **Dashboard update time** - Target: <2 seconds
- **Customer adoption** - Target: 80%+ of Operator tier

---

## 📞 Quick Links

- **Android Code**: `app/src/main/java/com/mctb/autoreply/data/LeadShieldSyncManager.kt`
- **Next.js Endpoint**: `app/api/sync/route.ts`
- **Docs**: See `ANDROID_SYNC_INTEGRATION.md` and `PAYMENT_FLOW_INTEGRATION.md`
- **Dashboard**: `app/dashboard/page.tsx` (already updates in real-time)

---

**Status**: ✅ Ready for integration testing  
**Last Updated**: May 2, 2026

