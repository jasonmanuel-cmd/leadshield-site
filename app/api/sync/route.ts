import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/supabase-admin'

type SyncItem = Record<string, unknown>

type SyncPayload = {
  user_id?: string
  userId?: string
  leads?: SyncItem[] | SyncItem | null
  conversation_messages?: SyncItem[] | SyncItem | null
  conversationMessages?: SyncItem[] | SyncItem | null
  call_events?: SyncItem[] | SyncItem | null
  callEvents?: SyncItem[] | SyncItem | null
}

type Summary = {
  leadsReceived: number
  leadsCreated: number
  leadsUpdated: number
  messagesReceived: number
  messagesInserted: number
  messagesUpdated: number
  callEventsReceived: number
  callEventsInserted: number
  callEventsUpdated: number
}

function emptySummary(): Summary {
  return {
    leadsReceived: 0,
    leadsCreated: 0,
    leadsUpdated: 0,
    messagesReceived: 0,
    messagesInserted: 0,
    messagesUpdated: 0,
    callEventsReceived: 0,
    callEventsInserted: 0,
    callEventsUpdated: 0,
  }
}

function normalizeItems(value: SyncItem[] | SyncItem | null | undefined): SyncItem[] {
  if (!value) return []
  return Array.isArray(value) ? value.filter(isObject) : isObject(value) ? [value] : []
}

function isObject(value: unknown): value is SyncItem {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function asString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? trimmed : null
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}

function pickString(item: SyncItem, keys: string[]): string | null {
  for (const key of keys) {
    const value = asString(item[key])
    if (value) return value
  }
  return null
}

function pickTimestamp(item: SyncItem, keys: string[]): string {
  for (const key of keys) {
    const value = item[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      const millis = value < 10_000_000_000 ? value * 1000 : value
      return new Date(millis).toISOString()
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = new Date(value)
      if (!Number.isNaN(parsed.valueOf())) return parsed.toISOString()
    }
  }
  return new Date().toISOString()
}

function compactNotes(parts: Array<string | null | undefined>): string | null {
  const notes = parts
    .map((part) => part?.trim())
    .filter((part): part is string => !!part)
  return notes.length ? notes.join('\n') : null
}

function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7).trim() || null
  return req.headers.get('x-leadshield-sync-token')?.trim() || null
}

async function findExistingLead(
  supabase: NonNullable<ReturnType<typeof getAdmin>>,
  clientId: string,
  phone: string
) {
  const { data, error } = await supabase
    .from('lead_logs')
    .select('id, notes')
    .eq('client_id', clientId)
    .eq('customer_phone', phone)
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as { id: string; notes: string | null } | null
}

export async function POST(req: NextRequest) {
  const supabase = getAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Sync service not configured' }, { status: 500 })
  }

  const token = getBearerToken(req)
  if (!token) {
    return NextResponse.json({ error: 'Missing sync token' }, { status: 401 })
  }

  const { data: tokenRow, error: tokenError } = await supabase
    .from('customer_sync_tokens')
    .select('user_id, tier, expires_at')
    .eq('sync_token', token)
    .eq('is_active', true)
    .maybeSingle()

  if (tokenError) {
    return NextResponse.json({ error: tokenError.message }, { status: 500 })
  }

  if (!tokenRow) {
    return NextResponse.json({ error: 'Invalid sync token' }, { status: 401 })
  }

  if (tokenRow.expires_at && new Date(tokenRow.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: 'Sync token expired' }, { status: 401 })
  }

  let payload: SyncPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const clientId = tokenRow.user_id as string
  const payloadUserId = asString(payload.user_id ?? payload.userId)
  if (payloadUserId && payloadUserId !== clientId) {
    return NextResponse.json({ error: 'Sync token does not match payload user' }, { status: 403 })
  }

  const leads = normalizeItems(payload.leads)
  const messages = normalizeItems(payload.conversation_messages ?? payload.conversationMessages)
  const callEvents = normalizeItems(payload.call_events ?? payload.callEvents)

  if (leads.length + messages.length + callEvents.length === 0) {
    return NextResponse.json({ error: 'No sync records provided' }, { status: 400 })
  }

  const summary = emptySummary()
  summary.leadsReceived = leads.length
  summary.messagesReceived = messages.length
  summary.callEventsReceived = callEvents.length

  try {
    await supabase
      .from('customer_sync_tokens')
      .update({ last_used_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('sync_token', token)

    for (const event of callEvents) {
      const phone = pickString(event, ['phone_number', 'phoneNumber', 'customer_phone', 'from'])
      if (!phone) continue

      const contactName = pickString(event, ['contact_name', 'contactName', 'name'])
      const callStatus = pickString(event, ['call_status', 'callStatus', 'call_type', 'callType']) ?? 'incoming'
      const occurredAt = pickTimestamp(event, ['occurred_at', 'occurredAt', 'timestamp', 'created_at'])
      const aiHandled = event.ai_handled ?? event.aiHandled
      const notes = compactNotes([
        contactName ? `Contact: ${contactName}` : null,
        typeof aiHandled === 'boolean' ? `AI handled: ${aiHandled ? 'yes' : 'no'}` : null,
      ])

      const { error } = await supabase.from('lead_logs').insert({
        client_id: clientId,
        customer_phone: phone,
        contact_name: contactName,
        call_status: callStatus,
        sms_sent_status: 'synced',
        status: 'new',
        notes,
        timestamp: occurredAt,
      })
      if (error) throw new Error(error.message)
      summary.callEventsInserted += 1
    }

    for (const lead of leads) {
      const phone = pickString(lead, ['phone_number', 'phoneNumber', 'customer_phone'])
      if (!phone) continue

      const contactName = pickString(lead, ['contact_name', 'contactName', 'name'])
      const status = pickString(lead, ['status']) ?? 'new'
      const notes = compactNotes([
        pickString(lead, ['notes']),
        pickString(lead, ['service_needed', 'serviceNeeded']) ? `Service: ${pickString(lead, ['service_needed', 'serviceNeeded'])}` : null,
        pickString(lead, ['city']) ? `City: ${pickString(lead, ['city'])}` : null,
        pickString(lead, ['urgency_level', 'urgencyLevel']) ? `Urgency: ${pickString(lead, ['urgency_level', 'urgencyLevel'])}` : null,
      ])
      const timestamp = pickTimestamp(lead, ['updated_at', 'updatedAt', 'created_at', 'createdAt', 'timestamp'])
      const existing = await findExistingLead(supabase, clientId, phone)

      if (existing) {
        const existingNotes = existing.notes?.trim()
        const mergedNotes = compactNotes([existingNotes, notes])
        const { error } = await supabase
          .from('lead_logs')
          .update({
            contact_name: contactName,
            status,
            notes: mergedNotes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .eq('client_id', clientId)
        if (error) throw new Error(error.message)
        summary.leadsUpdated += 1
      } else {
        const { error } = await supabase.from('lead_logs').insert({
          client_id: clientId,
          customer_phone: phone,
          contact_name: contactName,
          call_status: 'lead',
          sms_sent_status: 'synced',
          status,
          notes,
          timestamp,
        })
        if (error) throw new Error(error.message)
        summary.leadsCreated += 1
      }
    }

    for (const message of messages) {
      const phone = pickString(message, ['phone_number', 'phoneNumber', 'customer_phone'])
      if (!phone) continue

      const role = pickString(message, ['role', 'sender']) ?? 'message'
      const content = pickString(message, ['content', 'body', 'message', 'text'])
      const sentAt = pickTimestamp(message, ['sent_at', 'sentAt', 'timestamp', 'created_at'])
      const messageNote = compactNotes([content ? `[${role} ${sentAt}] ${content}` : null])
      const existing = await findExistingLead(supabase, clientId, phone)

      if (existing) {
        const mergedNotes = compactNotes([existing.notes?.trim(), messageNote])
        const { error } = await supabase
          .from('lead_logs')
          .update({ notes: mergedNotes, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .eq('client_id', clientId)
        if (error) throw new Error(error.message)
        summary.messagesUpdated += 1
      } else {
        const { error } = await supabase.from('lead_logs').insert({
          client_id: clientId,
          customer_phone: phone,
          call_status: 'message',
          sms_sent_status: 'synced',
          status: 'new',
          notes: messageNote,
          timestamp: sentAt,
        })
        if (error) throw new Error(error.message)
        summary.messagesInserted += 1
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, summary })
}
