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
