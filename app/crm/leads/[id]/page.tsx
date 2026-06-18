'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient, LeadLog } from '@/lib/supabase'
import { formatPhone, timeAgo } from '@/lib/utils'
import { callbackAgeMinutes, getScoreMeta, isCallbackOverdue, scoreLead } from '@/lib/lead-insights'
import Navbar from '@/components/Navbar'

const COLORS = {
  bg: '#050814', cyan: '#00E5FF', gold: '#FFD700',
  green: '#00FF88', text: '#E2E8F0', muted: '#94A3B8',
  panel: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)',
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: COLORS.cyan },
  called_back: { label: 'Called Back', color: '#3B82F6' },
  quoted: { label: 'Quoted', color: COLORS.gold },
  booked: { label: 'Booked', color: COLORS.green },
  lost: { label: 'Lost', color: COLORS.muted },
}

const PANEL: React.CSSProperties = {
  background: COLORS.panel, border: `1px solid ${COLORS.border}`,
  borderRadius: '20px', padding: '24px',
}
const INPUT: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)', border: `1px solid ${COLORS.border}`,
  borderRadius: '10px', padding: '12px 16px', color: COLORS.text,
  fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit',
}

export default function LeadDetailPage() {
  const router = useRouter()
  const supabase = createClient()
  const params = useParams<{ id: string }>()

  const [loading, setLoading] = useState(true)
  const [lead, setLead] = useState<LeadLog | null>(null)
  const [contactName, setContactName] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [saved, setSaved] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)

  const fetchLead = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/signon'); return }

    const res = await fetch(`/api/client/leads/${params.id}`)
    if (!res.ok) { router.push('/crm'); return }
    const data = await res.json()
    setLead(data.lead)
    setContactName(data.lead.contact_name ?? '')
    setNotes(data.lead.notes ?? '')
    setLoading(false)
  }, [router, supabase, params.id])

  useEffect(() => { fetchLead() }, [fetchLead])

  const updateStatus = async (status: string) => {
    if (!lead) return
    await fetch('/api/client/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: lead.id, status }),
    })
    await fetchLead()
  }

  const updateContactName = async () => {
    if (!lead) return
    setSaving(true)
    await fetch('/api/client/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: lead.id, contact_name: contactName }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    setSaving(false)
  }

  const updateNotes = async () => {
    if (!lead) return
    setSavingNotes(true)
    await fetch('/api/client/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: lead.id, notes }),
    })
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2500)
    setSavingNotes(false)
    await fetchLead()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bg }}>
        <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: COLORS.cyan, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!lead) return null

  const statusMeta = STATUS_META[lead.status ?? 'new'] ?? STATUS_META.new
  const scoreMeta = getScoreMeta(scoreLead(lead))
  const overdue = isCallbackOverdue(lead)

  return (
    <div className="min-h-screen" style={{ background: COLORS.bg }}>
      <Navbar />
      <main className="relative pt-22 pb-24 px-4 max-w-2xl mx-auto">
        <a href="/crm" style={{ color: COLORS.muted, fontSize: '13px', textDecoration: 'none' }}>← CRM Dashboard</a>

        <div style={{ marginTop: '16px', marginBottom: '24px' }}>
          <h1 className="font-display text-3xl font-bold" style={{ color: COLORS.text }}>
            {lead.contact_name || formatPhone(lead.customer_phone)}
          </h1>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
            <span style={{
              display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
              fontSize: '12px', fontWeight: 600, background: statusMeta.color,
              color: '#050814',
            }}>{statusMeta.label}</span>
            <span style={{ color: COLORS.muted, fontSize: '13px' }}>
              {formatPhone(lead.customer_phone)} · {timeAgo(lead.timestamp)}
            </span>
            <span style={{
              display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
              fontSize: '12px', fontWeight: 700, background: `${scoreMeta.color}20`,
              color: scoreMeta.color, border: `1px solid ${scoreMeta.color}40`,
            }}>{scoreMeta.label}</span>
          </div>
        </div>

        {overdue && (
          <div style={{ ...PANEL, marginBottom: '16px', borderColor: 'rgba(255,107,107,0.35)', background: 'rgba(255,107,107,0.06)' }}>
            <h2 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#FF6B6B' }}>Callback overdue</h2>
            <p style={{ margin: 0, color: COLORS.text, fontSize: '13px' }}>
              This lead has been waiting about {callbackAgeMinutes(lead)} minutes. Move it to Called Back when you reach them.
            </p>
          </div>
        )}

        <div style={{ ...PANEL, marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: COLORS.cyan }}>Status</h2>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['new', 'called_back', 'quoted', 'booked', 'lost'].map((s) => {
              const m = STATUS_META[s]
              const active = (lead.status ?? 'new') === s
              return (
                <button key={s} onClick={() => updateStatus(s)}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                    border: active ? 'none' : `1px solid ${COLORS.border}`,
                    background: active ? m.color : 'transparent',
                    color: active ? '#050814' : COLORS.muted,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                  {m.label}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ ...PANEL, marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: COLORS.cyan }}>Call Info</h2>
          <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
            <div><span style={{ color: COLORS.muted }}>Call Status:</span> <span style={{ color: COLORS.text, textTransform: 'capitalize' }}>{lead.call_status}</span></div>
            <div><span style={{ color: COLORS.muted }}>SMS Status:</span> <span style={{ color: COLORS.text, textTransform: 'capitalize' }}>{lead.sms_sent_status}</span></div>
            <div><span style={{ color: COLORS.muted }}>Received:</span> <span style={{ color: COLORS.text }}>{new Date(lead.timestamp).toLocaleString()}</span></div>
            {lead.called_back_at && <div><span style={{ color: COLORS.muted }}>Called Back:</span> <span style={{ color: COLORS.green }}>{new Date(lead.called_back_at).toLocaleString()}</span></div>}
          </div>
        </div>

        <div style={{ ...PANEL, marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: COLORS.cyan }}>Contact Name</h2>
          <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Add customer name…" style={INPUT} />
          <button onClick={updateContactName} disabled={saving || !contactName.trim()}
            style={{
              marginTop: '8px', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              border: 'none', cursor: 'pointer',
              background: saving ? 'rgba(0,229,255,0.2)' : COLORS.cyan, color: '#050814',
            }}>
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Name'}
          </button>
        </div>

        <div style={{ ...PANEL }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: COLORS.cyan }}>Notes</h2>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes…" style={{ ...INPUT, minHeight: '80px', resize: 'vertical' }} />
          <button onClick={updateNotes} disabled={savingNotes}
            style={{
              marginTop: '8px', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              border: 'none', cursor: savingNotes ? 'not-allowed' : 'pointer',
              background: savingNotes ? 'rgba(0,229,255,0.2)' : COLORS.cyan, color: '#050814',
            }}>
            {savingNotes ? 'Saving…' : notesSaved ? 'Saved ✓' : 'Save Notes'}
          </button>
        </div>
      </main>
    </div>
  )
}
