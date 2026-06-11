'use client'

import { useState, useEffect, useCallback } from 'react'

const COLORS = {
  bg: '#050814',
  cyan: '#00E5FF',
  gold: '#FFD700',
  green: '#00FF88',
  text: '#E2E8F0',
  muted: '#94A3B8',
  panel: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
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
      const res = await fetch('/api/admin/clients', {
        headers: { Authorization: `Bearer ${pw}` },
      })
      if (res.status === 401) { setError('Wrong password'); setLoading(false); return }
      if (!res.ok) { setError('Server error'); setLoading(false); return }
      onSuccess(pw)
    } catch { setError('Network error'); setLoading(false) }
  }

  return (
    <div style={{ ...s.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={s.glow} />
      <div style={{ ...s.panel, width: '360px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛡️</div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: COLORS.gold }}>Admin Panel</h1>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: COLORS.muted }}>Enter admin password</p>
        </div>
        <input type="password" placeholder="Admin password" value={pw}
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

// ─── Clients Tab ─────────────────────────────────────────────
function ClientsPanel({ token }: { token: string }) {
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

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
      setFormSuccess(`Client "${biz}" provisioned`)
      setBiz(''); setOwner(''); setEmail(''); setPw(''); setPhone(''); setForward(''); setTemplate('')
      setShowForm(false)
      await fetchClients()
    } catch { setFormError('Network error') }
    setSubmitting(false)
  }

  const totalLeads = clients.reduce((s, c) => s + c.lead_count, 0)
  const totalPhones = clients.filter(c => c.telephony.some(t => t.is_active)).length

  return (
    <>
      {/* Summary */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ ...s.panel, display: 'flex', flexDirection: 'column', gap: '10px', flex: '1 1 180px' }}>
          <span style={{ fontSize: '13px', color: COLORS.muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Total Clients</span>
          <span style={{ fontSize: '42px', fontWeight: 700, color: COLORS.cyan, lineHeight: 1 }}>{clients.length}</span>
        </div>
        <div style={{ ...s.panel, display: 'flex', flexDirection: 'column', gap: '10px', flex: '1 1 180px' }}>
          <span style={{ fontSize: '13px', color: COLORS.muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Total Leads</span>
          <span style={{ fontSize: '42px', fontWeight: 700, color: COLORS.gold, lineHeight: 1 }}>{totalLeads}</span>
        </div>
        <div style={{ ...s.panel, display: 'flex', flexDirection: 'column', gap: '10px', flex: '1 1 180px' }}>
          <span style={{ fontSize: '13px', color: COLORS.muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Active Numbers</span>
          <span style={{ fontSize: '42px', fontWeight: 700, color: COLORS.green, lineHeight: 1 }}>{totalPhones}</span>
        </div>
      </div>

      {/* Clients */}
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
            <input placeholder="Tracking number (Telnyx)" value={phone} onChange={e => setPhone(e.target.value)} style={s.input} />
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
          <p style={{ color: COLORS.muted, fontSize: '14px', margin: 0 }}>No clients provisioned yet.</p>
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

// ─── Main Admin Page ─────────────────────────────────────────
export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null)

  if (!token) {
    return <PasswordGate onSuccess={setToken} />
  }

  return (
    <div style={s.container}>
      <div style={s.glow} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1050px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px', fontSize: '30px', fontWeight: 800, color: COLORS.gold }}>🛡️ Admin Panel</h1>
            <p style={{ margin: 0, fontSize: '14px', color: COLORS.muted }}>Multi-tenant CRM · Client provisioning</p>
          </div>
          <a href="/crm" style={{ color: COLORS.cyan, fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
            CRM Dashboard →
          </a>
        </div>

        <ClientsPanel token={token} />
      </div>
    </div>
  )
}
