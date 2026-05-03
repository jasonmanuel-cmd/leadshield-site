'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient, Lead, ConversationMessage } from '@/lib/supabase'
import { formatPhone, timeAgo, formatDate, getStatusLabel } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import UrgencyBadge from '@/components/UrgencyBadge'
import StatusBadge from '@/components/StatusBadge'
import ChatBubble from '@/components/ChatBubble'
import Link from 'next/link'

const STATUSES = ['new', 'called_back', 'quoted', 'booked', 'lost'] as const

export default function LeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [lead, setLead] = useState<Lead | null>(null)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveFeedback, setSaveFeedback] = useState<'saved' | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const fetchLead = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/signon')
      return
    }

    const [{ data: leadData }, { data: msgData }] = await Promise.all([
      supabase.from('leads').select('*').eq('id', leadId).eq('user_id', session.user.id).single(),
      supabase
        .from('conversation_messages')
        .select('*')
        .eq('lead_id', leadId)
        .order('sent_at', { ascending: true }),
    ])

    if (!leadData) {
      router.push('/pipeline')
      return
    }

    setLead(leadData)
    setNotes(leadData.notes ?? '')
    setMessages(msgData ?? [])
    setLoading(false)
  }, [leadId, router, supabase])

  useEffect(() => {
    fetchLead()
  }, [fetchLead])

  async function handleStatusChange(newStatus: string) {
    if (!lead) return
    setStatusUpdating(true)
    const { data } = await supabase
      .from('leads')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', lead.id)
      .select()
      .single()
    if (data) setLead(data)
    setStatusUpdating(false)
  }

  async function handleMarkCalledBack() {
    if (!lead) return
    setStatusUpdating(true)
    const now = new Date().toISOString()
    const { data } = await supabase
      .from('leads')
      .update({ status: 'called_back', called_back_at: now, updated_at: now })
      .eq('id', lead.id)
      .select()
      .single()
    if (data) setLead(data)
    setStatusUpdating(false)
  }

  function handleNotesChange(value: string) {
    setNotes(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSaving(true)
      await supabase
        .from('leads')
        .update({ notes: value, updated_at: new Date().toISOString() })
        .eq('id', lead!.id)
      setSaving(false)
      setSaveFeedback('saved')
      setTimeout(() => setSaveFeedback(null), 2000)
    }, 800)
  }

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

  if (!lead) return null

  const displayName = lead.contact_name || formatPhone(lead.phone_number)

  return (
    <div className="min-h-screen" style={{ background: '#0a0e1a' }}>
      <Navbar />

      <main className="pt-16 pb-24 md:pb-8 md:pt-20 px-4 max-w-3xl mx-auto">
        {/* Back */}
        <Link
          href="/pipeline"
          className="inline-flex items-center gap-2 text-sm mb-6"
          style={{ color: '#8892A4' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Pipeline
        </Link>

        {/* Header */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold mb-1 truncate" style={{ color: '#E8EAF0' }}>
                {displayName}
              </h1>
              {lead.contact_name && (
                <p className="text-sm" style={{ color: '#8892A4' }}>
                  {formatPhone(lead.phone_number)}
                </p>
              )}
              <p className="text-xs mt-1" style={{ color: '#8892A4' }}>
                Lead created {timeAgo(lead.created_at)}
              </p>
            </div>
            <UrgencyBadge urgency={lead.urgency_level} />
          </div>

          {/* Source badge */}
          {lead.source && (
            <span
              className="inline-block text-xs px-3 py-1 rounded-full font-medium mb-4"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#8892A4',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              Source: {lead.source}
            </span>
          )}

          {/* Status selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium" style={{ color: '#8892A4' }}>Status:</span>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={statusUpdating}
                  className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                  style={
                    lead.status === s
                      ? {
                          background: getStatusBgColor(s),
                          color: getStatusTextColor(s),
                          border: `1px solid ${getStatusTextColor(s)}50`,
                          opacity: statusUpdating ? 0.7 : 1,
                        }
                      : {
                          background: 'rgba(255,255,255,0.05)',
                          color: '#8892A4',
                          border: '1px solid rgba(255,255,255,0.1)',
                          opacity: statusUpdating ? 0.5 : 1,
                        }
                  }
                >
                  {getStatusLabel(s)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div
          className="rounded-2xl p-5 mb-4 grid grid-cols-2 md:grid-cols-3 gap-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <InfoField label="Service Needed" value={lead.service_needed || '—'} />
          <InfoField label="City" value={lead.city || '—'} />
          <InfoField
            label="Called Back At"
            value={lead.called_back_at ? formatDate(lead.called_back_at) : '—'}
          />
          <InfoField label="Created" value={formatDate(lead.created_at)} />
          <InfoField label="Last Updated" value={formatDate(lead.updated_at)} />
          <InfoField
            label="Urgency"
            value={lead.urgency_level === 'urgent' ? '🔴 Urgent' : '⚪ Normal'}
          />
        </div>

        {/* Mark Called Back button */}
        {lead.status === 'new' && (
          <button
            onClick={handleMarkCalledBack}
            disabled={statusUpdating}
            className="w-full rounded-xl py-3 font-semibold text-sm mb-4 transition-all"
            style={{
              background: statusUpdating ? 'rgba(0,229,255,0.3)' : 'rgba(0,229,255,0.15)',
              color: '#00E5FF',
              border: '1px solid rgba(0,229,255,0.4)',
            }}
          >
            {statusUpdating ? 'Updating...' : '📞 Mark as Called Back'}
          </button>
        )}

        {/* Notes */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold" style={{ color: '#E8EAF0' }}>Notes</h2>
            {saving && (
              <span className="text-xs" style={{ color: '#8892A4' }}>Saving...</span>
            )}
            {saveFeedback === 'saved' && !saving && (
              <span className="text-xs" style={{ color: '#00C853' }}>Saved ✓</span>
            )}
          </div>
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add notes about this lead..."
            rows={4}
            className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#E8EAF0',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(0,229,255,0.4)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.1)'
            }}
          />
        </div>

        {/* AI Conversation */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h2 className="text-base font-semibold mb-4" style={{ color: '#E8EAF0' }}>
            AI Conversation
            {messages.length > 0 && (
              <span className="ml-2 text-xs font-normal" style={{ color: '#8892A4' }}>
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </span>
            )}
          </h2>

          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: '#8892A4' }} className="text-sm">
                No AI conversation yet for this lead.
              </p>
            </div>
          ) : (
            <div>
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs mb-1" style={{ color: '#8892A4' }}>{label}</p>
      <p className="text-sm font-medium" style={{ color: '#E8EAF0' }}>{value}</p>
    </div>
  )
}

function getStatusTextColor(status: string): string {
  switch (status) {
    case 'new': return '#00E5FF'
    case 'called_back': return '#3B82F6'
    case 'quoted': return '#FFD700'
    case 'booked': return '#00C853'
    case 'lost': return '#8892A4'
    default: return '#8892A4'
  }
}

function getStatusBgColor(status: string): string {
  switch (status) {
    case 'new': return 'rgba(0,229,255,0.15)'
    case 'called_back': return 'rgba(59,130,246,0.15)'
    case 'quoted': return 'rgba(255,215,0,0.15)'
    case 'booked': return 'rgba(0,200,83,0.15)'
    case 'lost': return 'rgba(136,146,164,0.15)'
    default: return 'rgba(136,146,164,0.15)'
  }
}
