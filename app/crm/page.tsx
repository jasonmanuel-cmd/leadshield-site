'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, LeadLog } from '@/lib/supabase'
import { formatPhone, timeAgo } from '@/lib/utils'
import Navbar from '@/components/Navbar'

const COLORS = {
  bg: '#050814', cyan: '#00E5FF', gold: '#FFD700',
  green: '#00FF88', purple: '#A855F7', text: '#E2E8F0',
  muted: '#94A3B8', panel: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
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

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div style={{ ...PANEL, display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 160px' }}>
      <span style={{ fontSize: '12px', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: '36px', fontWeight: 700, color: accent, lineHeight: 1 }}>{value}</span>
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

  const fetchData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/signon'); return }

    const res = await fetch('/api/client/leads')
    if (!res.ok) { setLoading(false); return }
    const data = await res.json()

    if (!data.leads) {
      setNotClient(true)
      setLoading(false)
      return
    }

    const settingsRes = await fetch('/api/client/template')
    const settings = await settingsRes.json()
    setBizName(settings.client?.business_name ?? 'Your Business')
    setLeads(data.leads)
    setLoading(false)
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bg }}>
        <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: COLORS.cyan, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (notClient) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bg }}>
        <div style={{ ...PANEL, maxWidth: '420px', textAlign: 'center' }}>
          <p style={{ color: COLORS.muted, fontSize: '14px', margin: 0 }}>
            This dashboard is for LeadShield CRM clients.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: COLORS.bg }}>
      <div className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(circle at top left, rgba(0,229,255,0.08), transparent 30%), radial-gradient(circle at bottom right, rgba(255,215,0,0.06), transparent 28%)' }} />
      <Navbar />
      <main className="relative pt-22 pb-24 px-4 max-w-6xl mx-auto">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
          <div>
            <h1 className="font-display text-3xl font-bold" style={{ color: COLORS.text }}>{bizName}</h1>
            <p style={{ color: COLORS.muted, fontSize: '14px', margin: '4px 0 0' }}>Cloud CRM — leads captured through your tracking number</p>
          </div>
          <a href="/crm/settings"
            style={{ color: COLORS.cyan, fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
            Settings →
          </a>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <StatCard label="Total Leads" value={leads.length} accent={COLORS.cyan} />
          <StatCard label="Today" value={todayLeads} accent={COLORS.green} />
          <StatCard label="Booked" value={statusCounts['booked'] ?? 0} accent={COLORS.gold} />
          <StatCard label="New" value={statusCounts['new'] ?? 0} accent={COLORS.cyan} />
        </div>

        <h2 style={{ fontSize: '16px', fontWeight: 600, color: COLORS.text, marginBottom: '14px' }}>Recent Leads</h2>

        {leads.length === 0 ? (
          <div style={{ ...PANEL, textAlign: 'center', padding: '48px' }}>
            <p style={{ color: COLORS.muted, fontSize: '14px', margin: 0 }}>No leads yet. When customers miss your call, they&apos;ll appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {leads.map((lead) => {
              const statusMeta = STATUS_META[lead.status ?? 'new'] ?? STATUS_META.new
              return (
                <div key={lead.id} style={{
                  ...PANEL, padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                  transition: 'background 0.15s',
                }}>
                  <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: COLORS.text }}>
                      {lead.contact_name || formatPhone(lead.customer_phone)}
                    </div>
                    <div style={{ fontSize: '12px', color: COLORS.muted, marginTop: '2px' }}>
                      {formatPhone(lead.customer_phone)} · {timeAgo(lead.timestamp)}
                      {lead.sms_sent_status !== 'dispatched' && ` · SMS: ${lead.sms_sent_status}`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {['new', 'called_back', 'quoted', 'booked', 'lost'].map((s) => {
                      const m = STATUS_META[s]
                      const active = (lead.status ?? 'new') === s
                      return (
                        <button key={s} onClick={() => updateStatus(lead.id, s)} disabled={updating === lead.id}
                          style={{
                            padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                            border: active ? 'none' : `1px solid ${COLORS.border}`,
                            background: active ? m.color : 'transparent',
                            color: active ? '#050814' : COLORS.muted,
                            cursor: updating === lead.id ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s',
                          }}>
                          {m.label}
                        </button>
                      )
                    })}
                  </div>

                  <a href={`/crm/leads/${lead.id}`}
                    style={{ color: COLORS.muted, fontSize: '12px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    Details →
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
