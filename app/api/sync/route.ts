import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import type { CallEvent, ConversationMessage, Lead } from '@/lib/supabase'

type SyncLead = Partial<Lead> & {
  phone_number: string
}

type SyncConversationMessage = Partial<ConversationMessage> & {
  phone_number: string
}

type SyncCallEvent = Partial<CallEvent> & {
  phone_number: string
}

type SyncPayload = {
  userId?: string
  user_id?: string
  syncToken?: string
  leads?: SyncLead[]
  lead?: SyncLead
  conversation_messages?: SyncConversationMessage[]
  conversationMessages?: SyncConversationMessage[]
  call_events?: SyncCallEvent[]
  callEvents?: SyncCallEvent[]
}

const LEAD_STATUSES = new Set<Lead['status']>(['new', 'called_back', 'quoted', 'booked', 'lost'])
const MESSAGE_ROLES = new Set<ConversationMessage['role']>(['assistant', 'caller'])

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const syncToken = process.env.LEADSHIELD_SYNC_TOKEN

const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

export async function POST(request: NextRequest) {
  if (!supabase || !syncToken) {
    return NextResponse.json(
      { error: 'Sync service is not configured on this server.' },
      { status: 500 }
    )
  }

  const providedToken = getSyncToken(request)
  if (!providedToken || providedToken !== syncToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: SyncPayload

  try {
    payload = (await request.json()) as SyncPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const userId = normalizeNullableString(payload.userId) ?? normalizeNullableString(payload.user_id)
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const leads = normalizePayloadList(payload.leads, payload.lead)
  const conversationMessages = normalizePayloadList(payload.conversation_messages, payload.conversationMessages)
  const callEvents = normalizePayloadList(payload.call_events, payload.callEvents)

  const summary = {
    leadsReceived: leads.length,
    leadsCreated: 0,
    leadsUpdated: 0,
    messagesReceived: conversationMessages.length,
    messagesInserted: 0,
    messagesUpdated: 0,
    callEventsReceived: callEvents.length,
    callEventsInserted: 0,
    callEventsUpdated: 0,
  }

  if (leads.length > 0) {
    for (const lead of leads) {
      const result = await syncLead(userId, lead)
      if (result === 'created') {
        summary.leadsCreated += 1
      } else if (result === 'updated') {
        summary.leadsUpdated += 1
      }
    }
  }

  if (conversationMessages.length > 0) {
    for (const message of conversationMessages) {
      const result = await syncConversationMessage(userId, message)
      if (result === 'created') {
        summary.messagesInserted += 1
      } else if (result === 'updated') {
        summary.messagesUpdated += 1
      }
    }
  }

  if (callEvents.length > 0) {
    for (const event of callEvents) {
      const result = await syncCallEvent(userId, event)
      if (result === 'created') {
        summary.callEventsInserted += 1
      } else if (result === 'updated') {
        summary.callEventsUpdated += 1
      }
    }
  }

  return NextResponse.json({ ok: true, summary })
}

function getSyncToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization')
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim()
  }

  const headerToken = request.headers.get('x-leadshield-sync-token')
  return headerToken?.trim() || null
}

async function syncLead(userId: string, lead: SyncLead): Promise<'created' | 'updated' | 'skipped'> {
  const client = getSupabaseClient()
  const phoneNumber = normalizePhone(lead.phone_number)
  if (!phoneNumber) {
    return 'skipped'
  }

  const now = new Date().toISOString()
  const existingLead = await client
    .from('leads')
    .select('id')
    .eq('user_id', userId)
    .eq('phone_number', phoneNumber)
    .maybeSingle()

  const nextLead = {
    user_id: userId,
    phone_number: phoneNumber,
    contact_name: normalizeNullableString(lead.contact_name),
    service_needed: normalizeNullableString(lead.service_needed),
    city: normalizeNullableString(lead.city),
    urgency_level: lead.urgency_level && lead.urgency_level === 'urgent' ? 'urgent' : 'normal',
    status: lead.status && LEAD_STATUSES.has(lead.status) ? lead.status : 'new',
    notes: normalizeNullableString(lead.notes),
    source: normalizeNullableString(lead.source) ?? 'leadshield-phone',
    created_at: normalizeNullableString(lead.created_at) ?? now,
    updated_at: normalizeNullableString(lead.updated_at) ?? now,
    called_back_at: normalizeNullableString(lead.called_back_at),
  }

  if (existingLead.data?.id) {
    const { error } = await client
      .from('leads')
      .update(nextLead)
      .eq('id', existingLead.data.id)

    if (error) {
      throw error
    }

    return 'updated'
  }

  const { error } = await client.from('leads').insert(nextLead)
  if (error) {
    throw error
  }

  return 'created'
}

async function syncConversationMessage(
  userId: string,
  message: SyncConversationMessage
): Promise<'created' | 'updated' | 'skipped'> {
  const client = getSupabaseClient()
  const phoneNumber = normalizePhone(message.phone_number)
  const content = normalizeNullableString(message.content)
  if (!phoneNumber || !content) {
    return 'skipped'
  }

  const sentAt = normalizeNullableString(message.sent_at) ?? new Date().toISOString()
  const role = message.role && MESSAGE_ROLES.has(message.role) ? message.role : 'caller'

  const existingMessage = await client
    .from('conversation_messages')
    .select('id')
    .eq('user_id', userId)
    .eq('phone_number', phoneNumber)
    .eq('sent_at', sentAt)
    .eq('role', role)
    .eq('content', content)
    .maybeSingle()

  const nextMessage = {
    user_id: userId,
    lead_id: normalizeNullableString(message.lead_id),
    phone_number: phoneNumber,
    role,
    content,
    sent_at: sentAt,
  }

  if (existingMessage.data?.id) {
    const { error } = await client
      .from('conversation_messages')
      .update(nextMessage)
      .eq('id', existingMessage.data.id)

    if (error) {
      throw error
    }

    return 'updated'
  }

  const { error } = await client.from('conversation_messages').insert(nextMessage)
  if (error) {
    throw error
  }

  return 'created'
}

async function syncCallEvent(userId: string, event: SyncCallEvent): Promise<'created' | 'updated' | 'skipped'> {
  const client = getSupabaseClient()
  const phoneNumber = normalizePhone(event.phone_number)
  if (!phoneNumber) {
    return 'skipped'
  }

  const occurredAt = normalizeNullableString(event.occurred_at) ?? new Date().toISOString()
  const callType = normalizeNullableString(event.call_type)

  const existingEvent = await client
    .from('call_events')
    .select('id')
    .eq('user_id', userId)
    .eq('phone_number', phoneNumber)
    .eq('occurred_at', occurredAt)
    .eq('call_type', callType)
    .maybeSingle()

  const nextEvent = {
    user_id: userId,
    phone_number: phoneNumber,
    contact_name: normalizeNullableString(event.contact_name),
    call_type: callType,
    reply_sent: normalizeBoolean(event.reply_sent),
    ai_handled: normalizeBoolean(event.ai_handled),
    occurred_at: occurredAt,
  }

  if (existingEvent.data?.id) {
    const { error } = await client
      .from('call_events')
      .update(nextEvent)
      .eq('id', existingEvent.data.id)

    if (error) {
      throw error
    }

    return 'updated'
  }

  const { error } = await client.from('call_events').insert(nextEvent)
  if (error) {
    throw error
  }

  return 'created'
}

function normalizePhone(phone: string | null | undefined): string {
  if (!phone) {
    return ''
  }

  const digits = phone.replace(/\D/g, '')
  return digits.length > 0 ? digits : phone.trim()
}

function normalizeNullableString(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeBoolean(value: boolean | null | undefined): boolean | null {
  if (typeof value === 'boolean') {
    return value
  }

  return null
}

function normalizePayloadList<T>(...lists: Array<T[] | T | undefined>): T[] {
  return lists.flatMap((list) => {
    if (!list) {
      return []
    }

    return Array.isArray(list) ? list : [list]
  })
}

function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase client is not configured')
  }

  return supabase
}