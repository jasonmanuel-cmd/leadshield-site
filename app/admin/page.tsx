'use client'

import { useState, useEffect, useCallback } from 'react'

const C = {
  bg: '#050814', cyan: '#00E5FF', gold: '#FFD700',
  green: '#00FF88', purple: '#A855F7', red: '#FF6B6B',
  text: '#E2E8F0', muted: '#94A3B8',
  panel: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)',
}

const s: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh', backgroundColor: C.bg,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: C.text, position: 'relative', overflow: 'auto',
  },
  glow: {
    position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)',
    width: '800px', height: '500px',
    background: 'radial-gradient(ellipse, rgba(0,229,255,0.06) 0%, rgba(5,8,20,0) 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  panel: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '28px' },
  input: {
    background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`,
    borderRadius: '10px', padding: '12px 16px', color: C.text,
    fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  btn: {
    borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: 700,
    cursor: 'pointer', border: 'none', transition: 'background 0.2s',
  },
  tab: {
    padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
    borderRadius: '10px 10px 0 0', border: 'none', background: 'transparent', color: C.muted,
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'rgba(0,229,255,0.08)', color: C.cyan, borderBottom: `2px solid ${C.cyan}`,
  },
  select: {
    background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`,
    borderRadius: '10px', padding: '10px 14px', color: C.text, fontSize: '13px', outline: 'none',
  },
}

const TABS = ['Clients', 'Payments', 'Analytics', 'System'] as const
type Tab = typeof TABS[number]

// ─── Types ─────────────────────────────────────────────────
interface ClientTelephony {
  id: string; provisioned_phone_number: string
  forwarding_phone_number: string; is_active: boolean
}
interface ClientRecord {
  id: string; business_name: string; owner_name: string | null
  email: string; status: string; created_at: string
  lead_count: number; telephony: ClientTelephony[]
  role: string; plan_tier: string; monthly_fee: number; payment_status: string
}
interface PaymentRecord {
  id: string; client_id: string; amount: number; status: string
  due_date: string; paid_at: string | null; payment_method: string | null
  notes: string | null; period_start: string; period_end: string; created_at: string
  clients: { business_name: string; email: string } | null
}
interface AnalyticsData {
  totalClients: number; activeClients: number
  totalLeads: number; leads30d: number; leadsToday: number
  activeNumbers: number; smsSent: number; smsFailed: number
  revenueThisMonth: number; revenueAllTime: number
  leadsByDay: Record<string, number>
  topClients: Array<{ business_name: string; lead_count: number }>
  statusDistribution: Record<string, number>
}
interface SystemStatus {
  github: { connected: boolean; repo: string }
  supabase: { configured: boolean; healthy: boolean }
  telnyx: { configured: boolean }
  square: { configured: boolean; environment: string | null; missing: string[] }
  admin: { usernameConfigured: boolean; passwordConfigured: boolean; tokenConfigured: boolean }
}

// ─── Password Gate ──────────────────────────────────────────
function PasswordGate({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [username, setUsername] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!pw.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pw }),
      })
      if (res.status === 401) { setError('Wrong password'); setLoading(false); return }
      if (!res.ok) { setError('Server error'); setLoading(false); return }
      const data = await res.json()
      onSuccess(data.token)
    } catch { setError('Network error'); setLoading(false) }
  }

  return (
    <div style={{ ...s.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={s.glow} />
      <div style={{ ...s.panel, width: '360px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛡️</div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: C.gold }}>Admin Panel</h1>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: C.muted }}>Enter master username and password</p>
        </div>
        <input type="text" placeholder="Master username" value={username}
          onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          style={{ ...s.input, borderColor: error ? C.red : C.border }} />
        <input type="password" placeholder="Admin password" value={pw}
          onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          style={{ ...s.input, borderColor: error ? C.red : C.border }} />
        {error && <p style={{ margin: '-8px 0 0', fontSize: '13px', color: C.red, textAlign: 'center' }}>{error}</p>}
        <button onClick={handleSubmit} disabled={loading}
          style={{ ...s.btn, background: loading ? 'rgba(0,229,255,0.2)' : C.cyan, color: loading ? C.muted : '#050814' }}>
          {loading ? 'Checking…' : 'Enter'}
        </button>
      </div>
    </div>
  )
}

function ConnectionRow({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      gap: '16px', padding: '14px 0', borderBottom: `1px solid ${C.border}`,
    }}>
      <div>
        <div style={{ color: C.text, fontWeight: 700, fontSize: '14px' }}>{label}</div>
        <div style={{ color: C.muted, fontSize: '12px', marginTop: '3px' }}>{detail}</div>
      </div>
      <span style={{
        color: ok ? C.green : C.red,
        background: ok ? 'rgba(0,255,136,0.1)' : 'rgba(255,107,107,0.1)',
        border: `1px solid ${ok ? C.green : C.red}`,
        borderRadius: '999px',
        padding: '4px 10px',
        fontSize: '11px',
        fontWeight: 800,
        textTransform: 'uppercase',
      }}>
        {ok ? 'Connected' : 'Needs setup'}
      </span>
    </div>
  )
}

// ─── Stat Card ──────────────────────────────────────────────
function StatCard({ label, value, accent, subtitle }: { label: string; value: string | number; accent: string; subtitle?: string }) {
  return (
    <div style={{ ...s.panel, display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 160px', padding: '20px 24px' }}>
      <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontSize: '34px', fontWeight: 700, color: accent, lineHeight: 1 }}>{value}</span>
      {subtitle && <span style={{ fontSize: '12px', color: C.muted }}>{subtitle}</span>}
    </div>
  )
}

// ─── Clients Tab ────────────────────────────────────────────
function ClientsPanel({ token }: { token: string }) {
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [biz, setBiz] = useState(''); const [owner, setOwner] = useState('')
  const [email, setEmail] = useState(''); const [cpw, setPw] = useState('')
  const [phone, setPhone] = useState(''); const [forward, setForward] = useState('')
  const [template, setTemplate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(''); const [formSuccess, setFormSuccess] = useState('')

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/clients', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [token])

  useEffect(() => { fetchClients() }, [fetchClients])

  const handleProvision = async () => {
    if (!biz || !email || !cpw) { setFormError('Business name, email, and password required'); return }
    setSubmitting(true); setFormError(''); setFormSuccess('')
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          business_name: biz, owner_name: owner || null, email,
          password: cpw, provisioned_phone_number: phone || null,
          forwarding_phone_number: forward || null, sms_template: template || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error); setSubmitting(false); return }
      setFormSuccess(`Client "${biz}" provisioned`)
      setBiz(''); setOwner(''); setEmail(''); setPw(''); setPhone(''); setForward(''); setTemplate('')
      setShowForm(false)
      await fetchClients()
    } catch { setFormError('Network error') }
    setSubmitting(false)
  }

  const handleUpdate = async (id: string, updates: Record<string, string>) => {
    await fetch('/api/admin/clients', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, ...updates }),
    })
    await fetchClients()
  }

  const handleDelete = async (client: ClientRecord) => {
    if (!confirm(`Delete ${client.business_name} and all their data? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/clients/${client.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) await fetchClients()
  }

  const totalLeads = clients.reduce((s, c) => s + c.lead_count, 0)
  const totalPhones = clients.filter(c => c.telephony.some(t => t.is_active)).length
  const unpaidClients = clients.filter(c => c.payment_status === 'unpaid').length
  const monthlyRevenue = clients.reduce((s, c) => s + (c.status === 'active' ? Number(c.monthly_fee) : 0), 0)

  return (
    <>
      {/* Summary */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <StatCard label="Total Clients" value={clients.length} accent={C.cyan} subtitle={`${clients.filter(c => c.status === 'active').length} active`} />
        <StatCard label="Total Leads" value={totalLeads} accent={C.gold} />
        <StatCard label="Active Numbers" value={totalPhones} accent={C.green} />
        <StatCard label="Unpaid" value={unpaidClients} accent={C.red} />
        <StatCard label="Monthly Rev" value={`$${monthlyRevenue}`} accent={C.purple} />
      </div>

      {/* Clients */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
          Clients <span style={{ color: C.muted, fontSize: '16px', fontWeight: 400 }}>({clients.length})</span>
        </h2>
        <button onClick={() => { setShowForm(!showForm); setFormError(''); setFormSuccess('') }}
          style={{ ...s.btn, background: showForm ? 'rgba(255,255,255,0.06)' : C.cyan, color: showForm ? C.muted : '#050814' }}>
          {showForm ? 'Cancel' : '+ New Client'}
        </button>
      </div>

      {formSuccess && (
        <div style={{ ...s.panel, marginBottom: '16px', borderColor: 'rgba(0,255,136,0.3)', background: 'rgba(0,255,136,0.05)' }}>
          <span style={{ color: C.green, fontSize: '14px' }}>{formSuccess}</span>
        </div>
      )}

      {showForm && (
        <div style={{ ...s.panel, marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: C.cyan }}>Provision New Client</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input placeholder="Business name *" value={biz} onChange={e => setBiz(e.target.value)} style={s.input} />
            <input placeholder="Owner name" value={owner} onChange={e => setOwner(e.target.value)} style={s.input} />
            <input placeholder="Email *" type="email" value={email} onChange={e => setEmail(e.target.value)} style={s.input} />
            <input placeholder="Password *" type="password" value={cpw} onChange={e => setPw(e.target.value)} style={s.input} />
            <input placeholder="Tracking number (Telnyx)" value={phone} onChange={e => setPhone(e.target.value)} style={s.input} />
            <input placeholder="Forwarding number (their cell)" value={forward} onChange={e => setForward(e.target.value)} style={s.input} />
          </div>
          <textarea placeholder="Default SMS template (leave blank to skip)"
            value={template} onChange={e => setTemplate(e.target.value)}
            style={{ ...s.input, minHeight: '70px', resize: 'vertical', fontFamily: 'inherit' }} />
          {formError && <p style={{ margin: 0, fontSize: '13px', color: C.red }}>{formError}</p>}
          <button onClick={handleProvision} disabled={submitting}
            style={{ ...s.btn, background: submitting ? 'rgba(0,229,255,0.2)' : C.green, color: '#050814', alignSelf: 'flex-start' }}>
            {submitting ? 'Provisioning…' : 'Provision Client'}
          </button>
        </div>
      )}

      {loading ? (
        <p style={{ color: C.muted, fontSize: '14px' }}>Loading clients…</p>
      ) : clients.length === 0 ? (
        <div style={{ ...s.panel, textAlign: 'center', padding: '48px' }}>
          <p style={{ color: C.muted, fontSize: '14px', margin: 0 }}>No clients provisioned yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
                <th style={{ textAlign: 'left', padding: '12px 12px' }}>Business</th>
                <th style={{ textAlign: 'left', padding: '12px 12px' }}>Contact</th>
                <th style={{ textAlign: 'center', padding: '12px 12px' }}>Plan</th>
                <th style={{ textAlign: 'center', padding: '12px 12px' }}>Fee</th>
                <th style={{ textAlign: 'center', padding: '12px 12px' }}>Payment</th>
                <th style={{ textAlign: 'center', padding: '12px 12px' }}>Leads</th>
                <th style={{ textAlign: 'center', padding: '12px 12px' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '12px 12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ fontWeight: 600, color: C.text }}>{c.business_name}</div>
                    {c.owner_name && <div style={{ fontSize: '11px', color: C.muted }}>{c.owner_name}</div>}
                  </td>
                  <td style={{ padding: '14px 12px', color: C.muted, fontSize: '12px' }}>{c.email}</td>
                  <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                    <select value={c.plan_tier} onChange={e => handleUpdate(c.id, { plan_tier: e.target.value })}
                      style={s.select}>
                      <option value="single">Single</option>
                      <option value="pro">Pro</option>
                      <option value="agency">Agency</option>
                    </select>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', color: C.gold, fontWeight: 700 }}>
                    ${Number(c.monthly_fee).toFixed(0)}
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                      background: c.payment_status === 'paid' ? 'rgba(0,255,136,0.1)' :
                                  c.payment_status === 'overdue' ? 'rgba(255,107,107,0.1)' : 'rgba(255,215,0,0.1)',
                      color: c.payment_status === 'paid' ? C.green :
                             c.payment_status === 'overdue' ? C.red : C.gold,
                    }}>
                      {c.payment_status === 'paid' ? 'Paid' : c.payment_status === 'overdue' ? 'Overdue' : 'Unpaid'}
                    </span>
                    <button onClick={() => handleUpdate(c.id, { payment_status: 'paid' })}
                      style={{ marginLeft: '6px', padding: '2px 6px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer', background: 'rgba(0,255,136,0.1)', border: `1px solid ${C.green}`, color: C.green }}>
                      ✓
                    </button>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                    <span style={{ color: C.gold, fontWeight: 700, fontSize: '16px' }}>{c.lead_count}</span>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                    <select value={c.status} onChange={e => handleUpdate(c.id, { status: e.target.value })}
                      style={{
                        ...s.select, padding: '4px 8px', fontSize: '11px', fontWeight: 600,
                        color: c.status === 'active' ? C.green : c.status === 'suspended' ? C.red : C.gold,
                      }}>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="trialing">Trialing</option>
                    </select>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(c)}
                      style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', background: 'rgba(255,107,107,0.1)', border: `1px solid ${C.red}`, color: C.red }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ─── Payments Tab ───────────────────────────────────────────
function PaymentsPanel({ token }: { token: string }) {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [clients, setClients] = useState<ClientRecord[]>([])

  const [selClient, setSelClient] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [squareLoading, setSquareLoading] = useState<string | null>(null)

  const fetchPayments = useCallback(async () => {
    const res = await fetch('/api/admin/payments', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) setPayments((await res.json()).payments)
    setLoading(false)
  }, [token])

  const fetchClients = useCallback(async () => {
    const res = await fetch('/api/admin/clients', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) setClients((await res.json()).clients)
  }, [token])

  useEffect(() => { fetchPayments(); fetchClients() }, [fetchPayments, fetchClients])

  const handleCreatePayment = async () => {
    if (!selClient || !amount) return
    setSubmitting(true)
    const periodStart = new Date().toISOString().split('T')[0]
    const periodEnd = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    await fetch('/api/admin/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        client_id: selClient, amount, due_date: dueDate || periodEnd,
        period_start: periodStart, period_end: periodEnd, notes: notes || null,
      }),
    })
    setSelClient(''); setAmount(''); setDueDate(''); setNotes('')
    setShowForm(false); setSubmitting(false)
    await fetchPayments()
  }

  const markPaid = async (id: string) => {
    await fetch('/api/admin/payments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status: 'paid' }),
    })
    await fetchPayments()
  }

  const getSquareUrl = (payment: PaymentRecord) => {
    const match = payment.notes?.match(/Square checkout:\s*(https?:\/\/\S+)/i)
    return match?.[1] ?? null
  }

  const createSquareLink = async (payment: PaymentRecord) => {
    setSquareLoading(payment.id)
    const res = await fetch('/api/admin/square/payment-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ payment_id: payment.id }),
    })
    const data = await res.json()
    setSquareLoading(null)
    if (!res.ok) {
      alert(data.error || 'Square payment link failed')
      return
    }
    await fetchPayments()
    if (data.payment_link?.url) window.open(data.payment_link.url, '_blank', 'noopener,noreferrer')
  }

  const totalOutstanding = payments.filter(p => p.status === 'unpaid').reduce((s, p) => s + Number(p.amount), 0)
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0)

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <StatCard label="Outstanding" value={`$${totalOutstanding.toFixed(0)}`} accent={C.red} />
        <StatCard label="Collected" value={`$${totalPaid.toFixed(0)}`} accent={C.green} />
        <StatCard label="Total Transactions" value={payments.length} accent={C.cyan} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
          Payment History <span style={{ color: C.muted, fontSize: '16px', fontWeight: 400 }}>({payments.length})</span>
        </h2>
        <button onClick={() => setShowForm(!showForm)}
          style={{ ...s.btn, background: showForm ? 'rgba(255,255,255,0.06)' : C.cyan, color: showForm ? C.muted : '#050814' }}>
          {showForm ? 'Cancel' : '+ Record Payment'}
        </button>
      </div>

      {showForm && (
        <div style={{ ...s.panel, marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: C.cyan }}>New Payment Record</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <select value={selClient} onChange={e => setSelClient(e.target.value)} style={s.select}>
              <option value="">Select client…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.business_name}</option>)}
            </select>
            <input placeholder="Amount ($)" type="number" value={amount} onChange={e => setAmount(e.target.value)} style={s.input} />
            <input placeholder="Due date (YYYY-MM-DD)" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={s.input} />
          </div>
          <input placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} style={s.input} />
          <button onClick={handleCreatePayment} disabled={submitting}
            style={{ ...s.btn, background: submitting ? 'rgba(0,229,255,0.2)' : C.green, color: '#050814', alignSelf: 'flex-start' }}>
            {submitting ? 'Saving…' : 'Create Payment Record'}
          </button>
        </div>
      )}

      {loading ? (
        <p style={{ color: C.muted }}>Loading payments…</p>
      ) : payments.length === 0 ? (
        <div style={{ ...s.panel, textAlign: 'center', padding: '48px' }}>
          <p style={{ color: C.muted, margin: 0 }}>No payment records yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
                <th style={{ textAlign: 'left', padding: '12px 12px' }}>Client</th>
                <th style={{ textAlign: 'right', padding: '12px 12px' }}>Amount</th>
                <th style={{ textAlign: 'center', padding: '12px 12px' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '12px 12px' }}>Due</th>
                <th style={{ textAlign: 'center', padding: '12px 12px' }}>Period</th>
                <th style={{ textAlign: 'center', padding: '12px 12px' }}>Paid At</th>
                <th style={{ textAlign: 'right', padding: '12px 12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                (() => {
                  const squareUrl = getSquareUrl(p)
                  return (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}`, opacity: p.status === 'paid' ? 0.6 : 1 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 12px', fontWeight: 600 }}>{p.clients?.business_name || '—'}</td>
                      <td style={{ padding: '14px 12px', textAlign: 'right', color: C.gold, fontWeight: 700 }}>${Number(p.amount).toFixed(2)}</td>
                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                          background: p.status === 'paid' ? 'rgba(0,255,136,0.1)' :
                                      p.status === 'overdue' ? 'rgba(255,107,107,0.1)' : 'rgba(255,215,0,0.1)',
                          color: p.status === 'paid' ? C.green : p.status === 'overdue' ? C.red : C.gold,
                        }}>{p.status}</span>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'center', color: C.muted, fontSize: '12px' }}>
                        {new Date(p.due_date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'center', color: C.muted, fontSize: '12px' }}>
                        {new Date(p.period_start).toLocaleDateString()} – {new Date(p.period_end).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'center', color: C.muted, fontSize: '12px' }}>
                        {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {squareUrl ? (
                            <a href={squareUrl} target="_blank" rel="noreferrer"
                              style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', background: 'rgba(0,229,255,0.1)', border: `1px solid ${C.cyan}`, color: C.cyan, textDecoration: 'none' }}>
                              Open Square
                            </a>
                          ) : p.status !== 'paid' && (
                            <button onClick={() => createSquareLink(p)} disabled={squareLoading === p.id}
                              style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', cursor: squareLoading === p.id ? 'not-allowed' : 'pointer', background: 'rgba(0,229,255,0.1)', border: `1px solid ${C.cyan}`, color: C.cyan }}>
                              {squareLoading === p.id ? 'Creating…' : 'Square Link'}
                            </button>
                          )}
                          {p.status !== 'paid' && (
                            <button onClick={() => markPaid(p.id)}
                              style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', background: 'rgba(0,255,136,0.1)', border: `1px solid ${C.green}`, color: C.green }}>
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })()
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ─── Analytics Tab ──────────────────────────────────────────
function AnalyticsPanel({ token }: { token: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) setData(await res.json())
      } catch { /* ignore */ }
      setLoading(false)
    })()
  }, [token])

  if (loading) return <p style={{ color: C.muted }}>Loading analytics…</p>
  if (!data) return <p style={{ color: C.red }}>Failed to load analytics.</p>

  const days = Object.keys(data.leadsByDay)
  const values = Object.values(data.leadsByDay)
  const maxVal = Math.max(...values, 1)

  const totalStatuses = Object.values(data.statusDistribution).reduce((s, v) => s + v, 0)

  return (
    <>
      {/* Summary Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <StatCard label="Total Clients" value={data.totalClients} accent={C.cyan} subtitle={`${data.activeClients} active`} />
        <StatCard label="Total Leads" value={data.totalLeads} accent={C.gold} />
        <StatCard label="Leads (30d)" value={data.leads30d} accent={C.green} />
        <StatCard label="Active Numbers" value={data.activeNumbers} accent={C.cyan} />
        <StatCard label="SMS Sent (30d)" value={data.smsSent} accent={C.green} subtitle={data.smsFailed > 0 ? `${data.smsFailed} failed` : undefined} />
        <StatCard label="Revenue (MTD)" value={`$${data.revenueThisMonth.toLocaleString()}`} accent={C.purple} subtitle={`$${data.revenueAllTime.toLocaleString()} all time`} />
      </div>

      {/* Lead Volume Chart */}
      <div style={{ ...s.panel, marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600, color: C.text }}>Lead Volume (Last 7 Days)</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
          {days.map((day, i) => (
            <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: C.gold }}>{values[i]}</span>
              <div style={{
                width: '100%', borderRadius: '6px 6px 0 0', transition: 'height 0.3s',
                height: `${Math.max((values[i] / maxVal) * 100, 4)}px`,
                background: 'linear-gradient(to top, rgba(0,229,255,0.3), rgba(0,229,255,0.6))',
              }} />
              <span style={{ fontSize: '10px', color: C.muted }}>{new Date(day + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' })}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Top Clients */}
        <div style={s.panel}>
          <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 600, color: C.text }}>Top Clients by Lead Count</h3>
          {data.topClients.length === 0 ? (
            <p style={{ color: C.muted, fontSize: '13px' }}>No data yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.topClients.slice(0, 5).map((c, i) => {
                const maxLead = data.topClients[0]?.lead_count || 1
                return (
                  <div key={c.business_name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ color: C.text }}>{i + 1}. {c.business_name}</span>
                      <span style={{ color: C.gold, fontWeight: 700 }}>{c.lead_count}</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(c.lead_count / maxLead) * 100}%`, background: 'linear-gradient(to right, rgba(0,229,255,0.3), rgba(0,229,255,0.7))', borderRadius: '3px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div style={s.panel}>
          <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 600, color: C.text }}>Lead Status Distribution</h3>
          {totalStatuses === 0 ? (
            <p style={{ color: C.muted, fontSize: '13px' }}>No data yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(data.statusDistribution).map(([status, count]) => {
                const pct = ((count / totalStatuses) * 100).toFixed(0)
                const colors: Record<string, string> = {
                  new: C.cyan, called_back: '#3B82F6', quoted: C.gold,
                  booked: C.green, lost: C.muted,
                }
                const labels: Record<string, string> = {
                  new: 'New', called_back: 'Called Back', quoted: 'Quoted',
                  booked: 'Booked', lost: 'Lost',
                }
                return (
                  <div key={status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ color: C.text }}>{labels[status] || status}</span>
                      <span style={{ color: colors[status] || C.text, fontWeight: 700 }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: colors[status] || C.text, borderRadius: '3px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function SystemPanel({ token }: { token: string }) {
  const [data, setData] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/system', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) setData(await res.json())
      } catch { /* ignore */ }
      setLoading(false)
    })()
  }, [token])

  if (loading) return <p style={{ color: C.muted }}>Checking system connections…</p>
  if (!data) return <p style={{ color: C.red }}>Failed to load system status.</p>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
      <div style={s.panel}>
        <h2 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 800, color: C.text }}>System Connections</h2>
        <p style={{ margin: '0 0 8px', color: C.muted, fontSize: '13px' }}>
          This shows what the live LeadShield app can currently reach from production.
        </p>
        <ConnectionRow
          label="GitHub"
          ok={data.github.connected}
          detail={data.github.repo}
        />
        <ConnectionRow
          label="Supabase"
          ok={data.supabase.configured && data.supabase.healthy}
          detail={data.supabase.healthy ? 'Database credentials are configured and the clients table is reachable.' : 'Supabase env vars or database access need attention.'}
        />
        <ConnectionRow
          label="Telnyx"
          ok={data.telnyx.configured}
          detail={data.telnyx.configured ? 'Missed-call SMS provider key is configured.' : 'TELNYX_API_KEY is missing.'}
        />
        <ConnectionRow
          label="Square"
          ok={data.square.configured}
          detail={data.square.configured ? `Square ${data.square.environment || 'environment'} credentials are configured.` : `Missing ${data.square.missing.join(', ') || 'Square credentials'}.`}
        />
      </div>

      <div style={s.panel}>
        <h2 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 800, color: C.text }}>Master Access</h2>
        <ConnectionRow
          label="Username"
          ok={data.admin.usernameConfigured}
          detail={data.admin.usernameConfigured ? 'MASTER_ADMIN_USERNAME is set.' : 'MASTER_ADMIN_USERNAME is missing.'}
        />
        <ConnectionRow
          label="Password"
          ok={data.admin.passwordConfigured}
          detail={data.admin.passwordConfigured ? 'MASTER_ADMIN_PASSWORD is set.' : 'MASTER_ADMIN_PASSWORD is missing.'}
        />
        <ConnectionRow
          label="API Token"
          ok={data.admin.tokenConfigured}
          detail={data.admin.tokenConfigured ? 'MASTER_ADMIN_TOKEN is set for protected admin API calls.' : 'MASTER_ADMIN_TOKEN is missing.'}
        />
      </div>
    </div>
  )
}

// ─── Main Admin Page ────────────────────────────────────────
export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('Clients')

  if (!token) {
    return <PasswordGate onSuccess={setToken} />
  }

  return (
    <div style={s.container}>
      <div style={s.glow} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: 800, color: C.gold }}>🛡️ Admin Panel</h1>
            <p style={{ margin: 0, fontSize: '13px', color: C.muted }}>Multi-tenant CRM · Clients, Payments & Analytics</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <a href="/crm" style={{ color: C.cyan, fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>CRM Dashboard →</a>
            <a href="/" style={{ color: C.muted, fontSize: '13px', textDecoration: 'none' }}>Site →</a>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ ...s.tab, ...(activeTab === t ? s.tabActive : {}) }}>
              {t}
            </button>
          ))}
        </div>

        {activeTab === 'Clients' && <ClientsPanel token={token} />}
        {activeTab === 'Payments' && <PaymentsPanel token={token} />}
        {activeTab === 'Analytics' && <AnalyticsPanel token={token} />}
        {activeTab === 'System' && <SystemPanel token={token} />}

      </div>
    </div>
  )
}
