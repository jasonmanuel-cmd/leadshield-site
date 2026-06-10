import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}

export type Lead = {
  id: string
  user_id: string
  phone_number: string
  contact_name: string | null
  service_needed: string | null
  city: string | null
  urgency_level: 'normal' | 'urgent'
  status: 'new' | 'called_back' | 'quoted' | 'booked' | 'lost'
  notes: string | null
  source: string | null
  created_at: string
  updated_at: string
  called_back_at: string | null
}

export type ConversationMessage = {
  id: string
  user_id: string
  lead_id: string | null
  phone_number: string
  role: 'assistant' | 'caller'
  content: string
  sent_at: string
}

export type CallEvent = {
  id: string
  user_id: string
  phone_number: string
  contact_name: string | null
  call_type: string | null
  reply_sent: boolean | null
  ai_handled: boolean | null
  occurred_at: string
}

// ---- Multi-Tenant CRM Types ----

export type Client = {
  id: string
  business_name: string
  owner_name: string | null
  email: string
  created_at: string
  status: 'active' | 'suspended' | 'trialing'
}

export type TelephonyConfig = {
  id: string
  client_id: string
  provisioned_phone_number: string
  forwarding_phone_number: string
  carrier_sid: string | null
  is_active: boolean
  updated_at: string
}

export type TextTemplate = {
  id: string
  client_id: string
  trigger_event: 'no-answer' | 'busy' | 'failed'
  sms_body: string
  updated_at: string
}

export type LeadLog = {
  id: string
  client_id: string
  customer_phone: string
  call_status: 'no-answer' | 'busy'
  sms_sent_status: 'pending' | 'sent' | 'failed' | 'dispatched'
  status: 'new' | 'called_back' | 'quoted' | 'booked' | 'lost'
  contact_name: string | null
  notes: string | null
  called_back_at: string | null
  timestamp: string
  updated_at: string | null
}
