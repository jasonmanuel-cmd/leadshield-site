'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, LeadLog } from '@/lib/supabase'
import { formatPhone, timeAgo, getStatusColor, getStatusLabel } from '@/lib/utils'
import Navbar from '@/components/Navbar'

const C = {
  bg: '#050814', cyan: '#00E5FF', gold: '#FFD700',
  green: '#00FF88', purple: '#A855F7', text: '#E2E8F0',
  muted: '#94A3B8', panel: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
}

const PANEL: React.CSSProperties = {
  background: C.panel, border: `1px solid ${C.border}`,
  borderRadius: '20px', padding: '24px',
}

const STATUSES = ['new', 'called_back', 'quoted', 'booked', 'lost'] as const
const STATUS_META: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: C.cyan },
  called_back: { label: 'Called Back', color: '#3B82F6' },
  quoted: { label: 'Quoted', color: C.gold },
  booked: { label: 'Booked', color: C.green },
  lost: { label: 'Lost', color: C.muted },
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div style={{ ...PANEL, display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 140px', padding: '20px' }}>
      <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: '32px', fontWeight: 700, color: accent, lineHeight: 1 }}>{value}</span>
    </div>
  )
}

export default function CrmDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [notClient, setNotClient] = useState(false)
  const [leads, setLeads] = useState<LeadLog[]>([])
  const [bizName, setBizName] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [dismissWelcome, setDismissWelcome] = useState(true)
  const [showGuide, setShowGuide] = useState(false)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [nameInput, setNameInput] = useState('')

  const fetchData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/signon'); return }

    const res = await fetch('/api/client/leads')
    if (!res.ok) { setLoading(false); return }
    const data = await res.json()
    if (!data.leads) { setNotClient(true); setLoading(false); return }

    const settingsRes = await fetch('/api/client/template')
    const settings = await settingsRes.json()
    setBizName(settings.client?.business_name ?? 'Your Business')
    setLeads(data.leads)
    setLoading(false)

    // Check if first visit
    const visited = localStorage.getItem('ls_welcome_dismissed')
    if (!visited) setDismissWelcome(false)
  }, [router, supabase])

  useEffect(() => { fetchData() }, [fetchData])

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    await fetch('/api/client/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    await fetchData()
    setUpdating(null)
  }

  const updateName = async (id: string, contact_name: string) => {
    await fetch('/api/client/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, contact_name }),
    })
    setEditingName(null)
    await fetchData()
  }

  const handleDismissWelcome = () => {
    localStorage.setItem('ls_welcome_dismissed', 'true')
    setDismissWelcome(true)
  }

  const todayLeads = leads.filter(l =>
    new Date(l.timestamp).toDateString() === new Date().toDateString()
  ).length

  const statusCounts: Record<string, number> = {}
  for (const l of leads) {
    const s = l.status ?? 'new'
    statusCounts[s] = (statusCounts[s] ?? 0) + 1
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: C.cyan, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (notClient) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.bg }}>
        <div style={{ ...PANEL, maxWidth: '420px', textAlign: 'center' }}>
          <p style={{ color: C.muted, fontSize: '14px', margin: 0 }}>
            This dashboard is for LeadShield CRM clients.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      <div className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(circle at top left, rgba(0,229,255,0.08), transparent 30%), radial-gradient(circle at bottom right, rgba(255,215,0,0.06), transparent 28%)' }} />
      <Navbar />
      <main className="relative pt-22 pb-24 px-4 max-w-6xl mx-auto">

        {/* ─── Header ─── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '12px', marginBottom: '20px',
        }}>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: C.text }}>{bizName}</h1>
            <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0' }}>
              {leads.length > 0 ? `${leads.length} total leads` : 'No leads yet'}
              {' · '}
              <button onClick={() => setShowGuide(!showGuide)}
                style={{ background: 'none', border: 'none', color: C.cyan, cursor: 'pointer', fontSize: '13px', padding: 0, textDecoration: 'underline' }}>
                {showGuide ? 'Hide guide' : 'Getting started?'}
              </button>
            </p>
          </div>
          <a href="/crm/settings"
            style={{ color: C.cyan, fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            SMS Settings →
          </a>
        </div>

        {/* ─── Welcome Card ─── */}
        {!dismissWelcome && (
          <div style={{
            ...PANEL, marginBottom: '20px', borderColor: 'rgba(0,229,255,0.25)',
            background: 'rgba(0,229,255,0.05)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: C.cyan }}>
                  👋 Welcome to LeadShield!
                </h2>
                <p style={{ margin: '0 0 4px', fontSize: '14px', color: C.text, lineHeight: 1.5 }}>
                  Your CRM is ready. Leads from your tracking number will appear here automatically.
                  You can update their status, add contact names, and manage your pipeline.
                </p>
                <button onClick={handleDismissWelcome}
                  style={{ ...PANEL, padding: '6px 16px', fontSize: '12px', color: C.muted, cursor: 'pointer', marginTop: '8px', display: 'inline-block' }}>
                  Got it — let&apos;s go →
                </button>
              </div>
              <div style={{ fontSize: '40px', flexShrink: 0 }}>🛡️</div>
            </div>
          </div>
        )}

        {/* ─── Getting Started Guide ─── */}
        {showGuide && (
          <div style={{ ...PANEL, marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: C.text }}>📋 Getting Started</h3>
              <button onClick={() => setShowGuide(false)}
                style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '18px' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { step: '1', title: 'Set your SMS auto-reply', desc: 'Go to SMS Settings and write the message customers get when they miss your call.', done: true },
                { step: '2', title: 'Get your tracking number', desc: 'Contact your admin for your dedicated tracking number that forwards to your cell.', done: false },
                { step: '3', title: 'Share your number', desc: 'Put your tracking number on Google, flyers, and business cards. Every missed call becomes a lead.', done: false },
                { step: '4', title: 'Watch leads roll in', desc: 'When a lead comes in, update its status as you follow up. New → Called Back → Quoted → Booked → Lost.', done: false },
              ].map((g, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  padding: '12px 16px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  opacity: g.done ? 0.6 : 1,
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0,
                    background: g.done ? 'rgba(0,255,136,0.15)' : 'rgba(0,229,255,0.1)',
                    color: g.done ? C.green : C.cyan,
                  }}>{g.done ? '✓' : g.step}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: C.text }}>{g.title}</div>
                    <div style={{ fontSize: '13px', color: C.muted, marginTop: '2px' }}>{g.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Stats ─── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          <StatCard label="Total Leads" value={leads.length} accent={C.cyan} />
          <StatCard label="Today" value={todayLeads} accent={C.green} />
          <StatCard label="Booked" value={statusCounts['booked'] ?? 0} accent={C.gold} />
          <StatCard label="New" value={statusCounts['new'] ?? 0} accent={C.cyan} />
          <StatCard label="Called Back" value={statusCounts['called_back'] ?? 0} accent="#3B82F6" />
          <StatCard label="Quoted" value={statusCounts['quoted'] ?? 0} accent={C.gold} />
        </div>

        {/* ─── Leads ─── */}
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: C.text, marginBottom: '12px' }}>Leads</h2>

        {leads.length === 0 ? (
          <div style={{ ...PANEL, textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📞</div>
            <p style={{ color: C.muted, fontSize: '14px', margin: '0 0 4px' }}>No leads yet.</p>
            <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>
              When customers miss your call, they&apos;ll appear here automatically.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {leads.map((lead) => {
              const statusMeta = STATUS_META[lead.status ?? 'new'] ?? STATUS_META.new
              return (
                <div key={lead.id} style={{
                  ...PANEL, padding: '14px 18px',
                  display: 'flex', flexDirection: 'column', gap: '10px',
                  transition: 'background 0.15s',
                }}>
                  {/* Top row: contact, phone, time */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                      {editingName === lead.id ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input value={nameInput} onChange={e => setNameInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') updateName(lead.id, nameInput); if (e.key === 'Escape') setEditingName(null) }}
                            style={{
                              background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`,
                              borderRadius: '8px', padding: '6px 10px', color: C.text, fontSize: '13px', outline: 'none',
                            }}
                            autoFocus />
                          <button onClick={() => updateName(lead.id, nameInput)}
                            style={{ background: C.cyan, border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', color: '#050814', fontWeight: 600 }}>
                            Save
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontWeight: 600, color: C.text, cursor: 'pointer' }}
                          onClick={() => { setEditingName(lead.id); setNameInput(lead.contact_name || '') }}>
                          {lead.contact_name || (
                            <span style={{ color: C.muted, fontStyle: 'italic' }}>
                              {formatPhone(lead.customer_phone)}
                            </span>
                          )}
                        </div>
                      )}
                      <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span>{formatPhone(lead.customer_phone)}</span>
                        <span>·</span>
                        <span>{timeAgo(lead.timestamp)}</span>
                        {lead.sms_sent_status !== 'dispatched' && (
                          <>
                            <span>·</span>
                            <span style={{ color: lead.sms_sent_status === 'failed' ? '#FF6B6B' : C.cyan }}>
                              SMS: {lead.sms_sent_status}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status badge */}
                    <div style={{
                      display: 'inline-flex', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                      background: `${statusMeta.color}15`, color: statusMeta.color,
                      border: `1px solid ${statusMeta.color}30`,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {statusMeta.label}
                    </div>
                  </div>

                  {/* Status buttons */}
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {STATUSES.map((s) => {
                      const m = STATUS_META[s]
                      const active = (lead.status ?? 'new') === s
                      return (
                        <button key={s} onClick={() => updateStatus(lead.id, s)} disabled={updating === lead.id}
                          style={{
                            padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                            border: active ? 'none' : `1px solid ${C.border}`,
                            background: active ? `${m.color}dd` : 'transparent',
                            color: active ? '#050814' : C.muted,
                            cursor: updating === lead.id ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s', opacity: updating === lead.id ? 0.5 : 1,
                          }}>
                          {m.label}
                        </button>
                      )
                    })}
                    <a href={`/crm/leads/${lead.id}`}
                      style={{ color: C.muted, fontSize: '11px', textDecoration: 'none', padding: '5px 8px', alignSelf: 'center' }}>
                      Details →
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ─── Pipeline Summary ─── */}
        {leads.length > 0 && (
          <div style={PANEL}>
            <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: C.text }}>Pipeline Overview</h3>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '32px' }}>
              {STATUSES.map((s) => {
                const count = statusCounts[s] ?? 0
                const total = leads.length || 1
                const pct = (count / total) * 100
                const m = STATUS_META[s]
                return (
                  <div key={s}
                    title={`${m.label}: ${count} (${Math.round(pct)}%)`}
                    style={{
                      height: '100%', width: `${pct}%`, minWidth: count > 0 ? '8px' : '0',
                      background: m.color, borderRadius: '6px', opacity: 0.7, transition: 'width 0.5s',
                    }} />
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
              {STATUSES.map((s) => {
                const m = STATUS_META[s]
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: C.muted }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: m.color }} />
                    {m.label}: {statusCounts[s] ?? 0}
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
