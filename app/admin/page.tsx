'use client'

import { useState, useEffect, useCallback } from 'react'

const COLORS = {
  bg: '#050814',
  cyan: '#00E5FF',
  gold: '#FFD700',
  green: '#00FF88',
  purple: '#A855F7',
  text: '#E2E8F0',
  muted: '#94A3B8',
  panel: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
}

const STATUS_COLORS: Record<string, string> = {
  new: COLORS.cyan,
  contacted: COLORS.gold,
  qualified: COLORS.green,
  closed: '#FF6B6B',
  lost: COLORS.muted,
}

const s: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: COLORS.bg,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: COLORS.text,
    position: 'relative',
    overflow: 'auto',
  },
  glow: {
    position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)',
    width: '800px', height: '500px',
    background: 'radial-gradient(ellipse, rgba(0,229,255,0.06) 0%, rgba(5,8,20,0) 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  glow2: {
    position: 'fixed', bottom: '-10%', right: '-10%',
    width: '600px', height: '400px',
    background: 'radial-gradient(ellipse, rgba(255,215,0,0.04) 0%, rgba(5,8,20,0) 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  panel: {
    background: COLORS.panel,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '20px',
    padding: '28px',
  },
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    padding: '12px 16px',
    color: COLORS.text,
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  btn: {
    borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: 700,
    cursor: 'pointer', border: 'none', transition: 'background 0.2s',
  },
}

interface StatsData {
  betaSignups: number
  leads: number
  callEvents: number
  messages: number
  byTrade: { trade: string; count: number }[]
  last14Days: { date: string; count: number }[]
  leadsByStatus: { status: string; count: number }[]
}

interface ClientTelephony {
  id: string
  provisioned_phone_number: string
  forwarding_phone_number: string
  is_active: boolean
}

interface ClientRecord {
  id: string
  business_name: string
  owner_name: string | null
  email: string
  status: string
  created_at: string
  lead_count: number
  telephony: ClientTelephony[]
}

interface ClientsResponse {
  clients: ClientRecord[]
}

// ─── Password Gate ───────────────────────────────────────────
function PasswordGate({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!pw.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin-stats', {
        headers: { Authorization: `Bearer ${pw}` },
      })
      if (res.status === 401) { setError('Wrong password'); setLoading(false); return }
      if (!res.ok) { setError('Server error'); setLoading(false); return }
      await res.json()
      onSuccess(pw)
    } catch { setError('Network error'); setLoading(false) }
  }

  return (
    <div style={{ ...s.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={s.glow} />
      <div style={{ ...s.panel, width: '360px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>👑</div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: COLORS.gold }}>Master Dashboard</h1>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: COLORS.muted }}>Admin access required</p>
        </div>
        <input type="password" placeholder="Enter admin password" value={pw}
          onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          style={{ ...s.input, borderColor: error ? '#FF6B6B' : COLORS.border }} />
        {error && <p style={{ margin: '-8px 0 0', fontSize: '13px', color: '#FF6B6B', textAlign: 'center' }}>{error}</p>}
        <button onClick={handleSubmit} disabled={loading}
          style={{ ...s.btn, background: loading ? 'rgba(0,229,255,0.2)' : COLORS.cyan, color: loading ? COLORS.muted : '#050814' }}>
          {loading ? 'Checking…' : 'Enter'}
        </button>
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────
function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div style={{ ...s.panel, display: 'flex', flexDirection: 'column', gap: '10px', flex: '1 1 180px' }}>
      <span style={{ fontSize: '13px', color: COLORS.muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: '42px', fontWeight: 700, color: accent, lineHeight: 1 }}>{value.toLocaleString()}</span>
    </div>
  )
}

function TradeChart({ data }: { data: { trade: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <div style={{ ...s.panel, marginTop: '24px' }}>
      <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600, color: COLORS.text }}>Beta Signups by Trade</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {data.map(({ trade, count }) => (
          <div key={trade} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '120px', minWidth: '120px', fontSize: '13px', color: COLORS.muted, textAlign: 'right', textTransform: 'capitalize' }}>{trade}</span>
            <div style={{ flex: 1, height: '22px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${(count / max) * 100}%`, height: '100%', background: COLORS.gold, borderRadius: '4px' }} />
            </div>
            <span style={{ fontSize: '13px', color: COLORS.gold, minWidth: '28px', textAlign: 'right' }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DailyChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <div style={{ ...s.panel, marginTop: '24px' }}>
      <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600, color: COLORS.text }}>Signups Last 14 Days</h2>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px', paddingBottom: '24px' }}>
        {data.map(({ date, count }) => (
          <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', height: '100%' }}>
            <div style={{ width: '100%', height: `${Math.max((count / max) * 80, count > 0 ? 4 : 0)}px`, background: COLORS.cyan, borderRadius: '3px 3px 0 0', opacity: 0.85 }} />
            <span style={{ fontSize: '9px', color: COLORS.muted, transform: 'rotate(-45deg)', whiteSpace: 'nowrap', transformOrigin: 'center' }}>{date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusPanel({ data }: { data: { status: string; count: number }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1
  return (
    <div style={{ ...s.panel, marginTop: '24px' }}>
      <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600, color: COLORS.text }}>Lead Pipeline Status</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.map(({ status, count }) => {
          const color = STATUS_COLORS[status.toLowerCase()] ?? COLORS.muted
          return (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: '14px', textTransform: 'capitalize', color: COLORS.text }}>{status}</span>
              <span style={{ fontSize: '14px', color, fontWeight: 600 }}>{count}</span>
              <span style={{ fontSize: '12px', color: COLORS.muted, minWidth: '38px', textAlign: 'right' }}>{Math.round((count / total) * 100)}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Overview Tab ────────────────────────────────────────────
function OverviewTab({ data }: { data: StatsData }) {
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        <StatCard label="Beta Signups" value={data.betaSignups} accent={COLORS.cyan} />
        <StatCard label="Total Leads" value={data.leads} accent={COLORS.gold} />
        <StatCard label="AI Conversations" value={data.callEvents} accent={COLORS.green} />
        <StatCard label="SMS Messages" value={data.messages} accent={COLORS.purple} />
      </div>
      {data.byTrade.length > 0 && <TradeChart data={data.byTrade} />}
      {data.last14Days.length > 0 && <DailyChart data={data.last14Days} />}
      {data.leadsByStatus.length > 0 && <StatusPanel data={data.leadsByStatus} />}
      <div style={{ ...s.panel, marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: COLORS.muted }}>
          Full page-view analytics at{' '}
          <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.cyan, textDecoration: 'none' }}>vercel.com/dashboard</a>
        </span>
        <a href="/dashboard" style={{ color: COLORS.gold, textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Open CRM Dashboard →</a>
      </div>
    </>
  )
}

// ─── Clients Tab ─────────────────────────────────────────────
function ClientsTab({ token }: { token: string }) {
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // form fields
  const [biz, setBiz] = useState('')
  const [owner, setOwner] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [phone, setPhone] = useState('')
  const [forward, setForward] = useState('')
  const [template, setTemplate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/clients', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data: ClientsResponse = await res.json()
        setClients(data.clients)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [token])

  useEffect(() => { fetchClients() }, [fetchClients])

  const handleProvision = async () => {
    if (!biz || !email || !pw) { setFormError('Business name, email, and password required'); return }
    setSubmitting(true)
    setFormError('')
    setFormSuccess('')
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          business_name: biz,
          owner_name: owner || null,
          email,
          password: pw,
          provisioned_phone_number: phone || null,
          forwarding_phone_number: forward || null,
          sms_template: template || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error); setSubmitting(false); return }
      setFormSuccess(`Client "${biz}" provisioned — they can sign in at /signon`)
      setBiz(''); setOwner(''); setEmail(''); setPw(''); setPhone(''); setForward(''); setTemplate('')
      setShowForm(false)
      await fetchClients()
    } catch { setFormError('Network error') }
    setSubmitting(false)
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: COLORS.text }}>
          Clients <span style={{ color: COLORS.muted, fontSize: '16px', fontWeight: 400 }}>({clients.length})</span>
        </h2>
        <button onClick={() => { setShowForm(!showForm); setFormError(''); setFormSuccess('') }}
          style={{ ...s.btn, background: showForm ? 'rgba(255,255,255,0.06)' : COLORS.cyan, color: showForm ? COLORS.muted : '#050814' }}>
          {showForm ? 'Cancel' : '+ New Client'}
        </button>
      </div>

      {formSuccess && (
        <div style={{ ...s.panel, marginBottom: '16px', borderColor: 'rgba(0,255,136,0.3)', background: 'rgba(0,255,136,0.05)' }}>
          <span style={{ color: COLORS.green, fontSize: '14px' }}>{formSuccess}</span>
        </div>
      )}

      {showForm && (
        <div style={{ ...s.panel, marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: COLORS.cyan }}>Provision New Client</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input placeholder="Business name *" value={biz} onChange={e => setBiz(e.target.value)} style={s.input} />
            <input placeholder="Owner name" value={owner} onChange={e => setOwner(e.target.value)} style={s.input} />
            <input placeholder="Email *" type="email" value={email} onChange={e => setEmail(e.target.value)} style={s.input} />
            <input placeholder="Password *" type="password" value={pw} onChange={e => setPw(e.target.value)} style={s.input} />
            <input placeholder="Tracking number (Twilio/Telnyx)" value={phone} onChange={e => setPhone(e.target.value)} style={s.input} />
            <input placeholder="Forwarding number (their cell)" value={forward} onChange={e => setForward(e.target.value)} style={s.input} />
          </div>
          <textarea placeholder="Default SMS template (leave blank to skip)"
            value={template} onChange={e => setTemplate(e.target.value)}
            style={{ ...s.input, minHeight: '70px', resize: 'vertical', fontFamily: 'inherit' }} />
          {formError && <p style={{ margin: 0, fontSize: '13px', color: '#FF6B6B' }}>{formError}</p>}
          <button onClick={handleProvision} disabled={submitting}
            style={{ ...s.btn, background: submitting ? 'rgba(0,229,255,0.2)' : COLORS.green, color: '#050814', alignSelf: 'flex-start' }}>
            {submitting ? 'Provisioning…' : 'Provision Client'}
          </button>
        </div>
      )}

      {loading ? (
        <p style={{ color: COLORS.muted, fontSize: '14px' }}>Loading clients…</p>
      ) : clients.length === 0 ? (
        <div style={{ ...s.panel, textAlign: 'center', padding: '48px' }}>
          <p style={{ color: COLORS.muted, fontSize: '14px', margin: 0 }}>No clients provisioned yet. Create your first one above.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.border}`, color: COLORS.muted, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Business</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Email</th>
                <th style={{ textAlign: 'center', padding: '12px 16px' }}>Tracking #</th>
                <th style={{ textAlign: 'center', padding: '12px 16px' }}>Forwards To</th>
                <th style={{ textAlign: 'center', padding: '12px 16px' }}>Leads</th>
                <th style={{ textAlign: 'center', padding: '12px 16px' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '12px 16px' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const tel = c.telephony[0]
                return (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${COLORS.border}`, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: COLORS.text }}>{c.business_name}</div>
                      {c.owner_name && <div style={{ fontSize: '11px', color: COLORS.muted }}>{c.owner_name}</div>}
                    </td>
                    <td style={{ padding: '14px 16px', color: COLORS.muted }}>{c.email}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: COLORS.cyan, fontFamily: 'monospace' }}>
                      {tel?.provisioned_phone_number || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: COLORS.muted }}>
                      {tel?.forwarding_phone_number || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{ color: COLORS.gold, fontWeight: 700, fontSize: '16px' }}>{c.lead_count}</span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                        background: c.status === 'active' ? 'rgba(0,255,136,0.1)' : 'rgba(255,107,107,0.1)',
                        color: c.status === 'active' ? COLORS.green : '#FF6B6B',
                      }}>{c.status}</span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', color: COLORS.muted, fontSize: '12px' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────
function Dashboard({ stats, token }: { stats: StatsData; token: string }) {
  const [tab, setTab] = useState<'overview' | 'clients'>('overview')

  return (
    <div style={s.container}>
      <div style={s.glow} />
      <div style={s.glow2} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1050px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ marginBottom: '36px' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '30px', fontWeight: 800, color: COLORS.gold }}>👑 Master Dashboard</h1>
          <p style={{ margin: 0, fontSize: '14px', color: COLORS.muted }}>Site analytics · Multi-tenant CRM · Client provisioning</p>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '28px' }}>
          {(['overview', 'clients'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                ...s.btn, borderRadius: '10px 10px 0 0', textTransform: 'capitalize',
                background: tab === t ? 'rgba(255,255,255,0.05)' : 'transparent',
                color: tab === t ? COLORS.text : COLORS.muted,
                borderBottom: tab === t ? `2px solid ${COLORS.cyan}` : '2px solid transparent',
              }}>
              {t === 'overview' ? '📊 Overview' : '🏢 Clients'}
            </button>
          ))}
        </div>

        {tab === 'overview' && <OverviewTab data={stats} />}
        {tab === 'clients' && <ClientsTab token={token} />}
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [state, setState] = useState<{ stats: StatsData; token: string } | null>(null)

  if (!state) {
    return <PasswordGate onSuccess={(token) => {
      fetch('/api/admin-stats', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((stats) => setState({ stats, token }))
    }} />
  }

  return <Dashboard stats={state.stats} token={state.token} />
}
