'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { formatPhone } from '@/lib/utils'
import Navbar from '@/components/Navbar'

const COLORS = {
  bg: '#050814', cyan: '#00E5FF', gold: '#FFD700',
  green: '#00FF88', text: '#E2E8F0', muted: '#94A3B8',
  panel: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)',
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

export default function CrmSettings() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [bizName, setBizName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState<{ provisioned?: string; forwarding?: string }>({})
  const [smsBody, setSmsBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [signingOut, setSigningOut] = useState(false)

  const fetchData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/signon'); return }

    const res = await fetch('/api/client/template')
    if (!res.ok) { router.push('/crm'); return }
    const data = await res.json()

    setBizName(data.client?.business_name ?? '')
    setEmail(session.user.email ?? '')
    setPhone({
      provisioned: data.telephony?.provisioned_phone_number,
      forwarding: data.telephony?.forwarding_phone_number,
    })
    setSmsBody(data.template?.sms_body ?? '')
    setLoading(false)
  }, [router, supabase])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    const res = await fetch('/api/client/template', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sms_body: smsBody }),
    })
    if (!res.ok) { const d = await res.json(); setError(d.error) }
    else { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    setSaving(false)
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/signon')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bg }}>
        <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: COLORS.cyan, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: COLORS.bg }}>
      <Navbar />
      <main className="relative pt-22 pb-24 px-4 max-w-2xl mx-auto">
        <div style={{ marginBottom: '28px' }}>
          <a href="/crm" style={{ color: COLORS.muted, fontSize: '13px', textDecoration: 'none' }}>← CRM Dashboard</a>
          <h1 className="font-display text-3xl font-bold mt-2" style={{ color: COLORS.text }}>Settings</h1>
        </div>

        {/* Business Info */}
        <div style={{ ...PANEL, marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600, color: COLORS.cyan }}>Business Info</h2>
          <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
            <div><span style={{ color: COLORS.muted }}>Name:</span> <span style={{ color: COLORS.text }}>{bizName}</span></div>
            <div><span style={{ color: COLORS.muted }}>Email:</span> <span style={{ color: COLORS.text }}>{email}</span></div>
          </div>
        </div>

        {/* Phone Config */}
        <div style={{ ...PANEL, marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600, color: COLORS.cyan }}>Phone Configuration</h2>
          <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
            <div>
              <span style={{ color: COLORS.muted }}>Tracking Number:</span>{' '}
              <span style={{ color: COLORS.cyan, fontFamily: 'monospace' }}>{phone.provisioned ? formatPhone(phone.provisioned) : 'Not configured'}</span>
            </div>
            <div>
              <span style={{ color: COLORS.muted }}>Forwards To:</span>{' '}
              <span style={{ color: COLORS.text }}>{phone.forwarding ? formatPhone(phone.forwarding) : 'Not configured'}</span>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: COLORS.muted, margin: '12px 0 0' }}>
            Customers call your tracking number. If you miss it, they get your auto-SMS and the lead appears in your CRM.
          </p>
        </div>

        {/* SMS Template */}
        <div style={{ ...PANEL, marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600, color: COLORS.cyan }}>Auto-Reply SMS Template</h2>
          <p style={{ fontSize: '13px', color: COLORS.muted, margin: '0 0 12px' }}>
            This message is sent automatically when you miss a call.
          </p>
          <textarea value={smsBody} onChange={e => setSmsBody(e.target.value)}
            style={{ ...INPUT, minHeight: '100px', resize: 'vertical' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
            <button onClick={handleSave} disabled={saving || !smsBody.trim()}
              style={{
                padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
                border: 'none', cursor: (saving || !smsBody.trim()) ? 'not-allowed' : 'pointer',
                background: saving ? 'rgba(0,229,255,0.2)' : COLORS.cyan, color: '#050814',
              }}>
              {saving ? 'Saving…' : 'Save Template'}
            </button>
            {saved && <span style={{ color: COLORS.green, fontSize: '13px' }}>Saved ✓</span>}
            {error && <span style={{ color: '#FF6B6B', fontSize: '13px' }}>{error}</span>}
          </div>
        </div>

        {/* Sign out */}
        <button onClick={handleSignOut} disabled={signingOut}
          style={{
            padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
            border: `1px solid ${COLORS.border}`, background: 'transparent',
            color: COLORS.muted, cursor: 'pointer', marginTop: '8px',
          }}>
          {signingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </main>
    </div>
  )
}
