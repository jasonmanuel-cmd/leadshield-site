'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ConversationThread from '@/components/ConversationThread'
import StatsCard from '@/components/StatsCard'
import { createClient, ConversationMessage, Lead } from '@/lib/supabase'

type ConversationGroup = {
  phone_number: string
  contact_name: string | null
  lead_id: string | null
  messages: ConversationMessage[]
  latest_at: string
}

export default function ConversationsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<ConversationGroup[]>([])

  const fetchConversations = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/signon')
      return
    }

    const userId = session.user.id

    const [{ data: leadData }, { data: messageData }] = await Promise.all([
      supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false }),
      supabase
        .from('conversation_messages')
        .select('*')
        .eq('user_id', userId)
        .order('sent_at', { ascending: true }),
    ])

    const leadLookup = new Map<string, Lead>()
    ;(leadData ?? []).forEach((lead) => {
      leadLookup.set(lead.phone_number, lead)
    })

    const groupMap = new Map<string, ConversationGroup>()

    for (const message of messageData ?? []) {
      const existing = groupMap.get(message.phone_number)
      const lead = leadLookup.get(message.phone_number) ?? null
      const latestAt = existing && existing.latest_at > message.sent_at ? existing.latest_at : message.sent_at

      if (existing) {
        existing.messages.push(message)
        existing.latest_at = latestAt
        if (!existing.contact_name && lead?.contact_name) {
          existing.contact_name = lead.contact_name
        }
        if (!existing.lead_id && message.lead_id) {
          existing.lead_id = message.lead_id
        }
        continue
      }

      groupMap.set(message.phone_number, {
        phone_number: message.phone_number,
        contact_name: lead?.contact_name ?? null,
        lead_id: message.lead_id ?? lead?.id ?? null,
        messages: [message],
        latest_at: message.sent_at,
      })
    }

    const sortedGroups = [...groupMap.values()].sort((left, right) => right.latest_at.localeCompare(left.latest_at))
    setGroups(sortedGroups)
    setLoading(false)
  }, [router, supabase])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    const channel = supabase
      .channel('conversations-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_messages' }, fetchConversations)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchConversations)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchConversations, supabase])

  const threadCount = groups.length
  const totalMessages = useMemo(() => groups.reduce((count, group) => count + group.messages.length, 0), [groups])
  const linkedLeads = useMemo(() => groups.filter((group) => group.lead_id).length, [groups])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e1a' }}>
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#00E5FF', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0e1a' }}>
      <Navbar />

      <main className="pt-16 pb-24 md:pb-8 md:pt-20 px-4 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#E8EAF0' }}>Conversations</h1>
          <p className="text-sm mt-1" style={{ color: '#8892A4' }}>
            All synced caller conversations from the phone app
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          <StatsCard label="Conversation Threads" value={threadCount} accent="cyan" />
          <StatsCard label="Messages Synced" value={totalMessages} accent="gold" />
          <StatsCard label="Linked Leads" value={linkedLeads} accent="green" />
        </div>

        {groups.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-sm" style={{ color: '#8892A4' }}>
              No conversations have synced yet. Once the LeadShield phone app sends caller messages,
              they will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {groups.map((group) => (
              <ConversationThread key={group.phone_number} group={group} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}