'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const COLORS = {
  bg: '#050814', cyan: '#00E5FF', gold: '#FFD700',
  green: '#00FF88', text: '#E2E8F0', muted: '#94A3B8',
  panel: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)',
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  // If user arrived via reset link from email, show new password form
  const [newPassword, setNewPassword] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updated, setUpdated] = useState(false)
  const [hash, setHash] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const h = window.location.hash
      if (h && (h.includes('type=recovery') || h.includes('access_token'))) {
        setHash(h)
      }
    }
  }, [])

  const handleSendReset = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (err) setError(err.message)
    else setSent(true)
    setLoading(false)
  }

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    setUpdating(true)
    setError('')
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    if (err) setError(err.message)
    else { setUpdated(true); setTimeout(() => router.push('/crm'), 2500) }
    setUpdating(false)
  }

  const panelStyle: React.CSSProperties = {
    background: COLORS.panel, border: `1px solid ${COLORS.border}`,
    borderRadius: '20px', padding: '28px', width: '360px',
  }
  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: `1px solid ${error ? '#FF6B6B' : COLORS.border}`,
    borderRadius: '10px', padding: '12px 16px', color: COLORS.text,
    fontSize: '15px', outline: 'none', width: '100%', boxSizing: 'border-box',
  }

  if (hash) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bg }}>
        <div style={panelStyle}>
          <h1 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 700, color: COLORS.cyan }}>Set New Password</h1>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: COLORS.muted }}>Choose a new password for your account.</p>
          {updated ? (
            <p style={{ color: COLORS.green, fontSize: '14px' }}>Password updated! Redirecting…</p>
          ) : (
            <>
              <input type="password" placeholder="New password (min 6 chars)" value={newPassword}
                onChange={e => setNewPassword(e.target.value)} style={inputStyle} />
              {error && <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#FF6B6B' }}>{error}</p>}
              <button onClick={handleUpdatePassword} disabled={updating}
                style={{
                  marginTop: '16px', width: '100%', padding: '12px', borderRadius: '10px',
                  fontSize: '15px', fontWeight: 700, border: 'none', cursor: updating ? 'not-allowed' : 'pointer',
                  background: updating ? 'rgba(0,229,255,0.2)' : COLORS.cyan, color: '#050814',
                }}>
                {updating ? 'Updating…' : 'Update Password'}
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bg }}>
      <div style={panelStyle}>
        <h1 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 700, color: COLORS.cyan }}>Reset Password</h1>
        <p style={{ margin: '0 0 20px', fontSize: '13px', color: COLORS.muted }}>
          Enter your email and we&apos;ll send you a reset link.
        </p>
        {sent ? (
          <p style={{ color: COLORS.green, fontSize: '14px' }}>
            Check your email for the password reset link. It may take a minute.
          </p>
        ) : (
          <>
            <input type="email" placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendReset()}
              style={inputStyle} />
            {error && <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#FF6B6B' }}>{error}</p>}
            <button onClick={handleSendReset} disabled={loading || !email.trim()}
              style={{
                marginTop: '16px', width: '100%', padding: '12px', borderRadius: '10px',
                fontSize: '15px', fontWeight: 700, border: 'none', cursor: (loading || !email.trim()) ? 'not-allowed' : 'pointer',
                background: loading ? 'rgba(0,229,255,0.2)' : COLORS.cyan, color: '#050814',
              }}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
            <a href="/signon" style={{ display: 'block', marginTop: '16px', textAlign: 'center', color: COLORS.muted, fontSize: '13px' }}>
              Back to sign in
            </a>
          </>
        )}
      </div>
    </div>
  )
}
