'use client'

import { useState } from 'react'

const TRADES = [
  'Plumber', 'HVAC Technician', 'Electrician', 'Roofer',
  'General Contractor', 'Painter', 'Landscaper', 'Handyman',
  'Carpenter', 'Mason / Concrete', 'Pool & Spa', 'Pest Control', 'Other Trade',
]

export default function LandingSignupForm() {
  const [form, setForm] = useState({ name: '', email: '', trade: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrMsg('')
    try {
      const res = await fetch('/api/beta-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setErrMsg(data.error || 'Something went wrong.'); setStatus('error') }
      else setStatus('success')
    } catch {
      setErrMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') return (
    <div className="text-center py-12 px-6">
      <div className="text-6xl mb-5">🛡️</div>
      <h3 className="text-2xl font-bold mb-3" style={{ color: '#F5F7FA', fontFamily: 'Space Grotesk, sans-serif' }}>
        You&apos;re on the list!
      </h3>
      <p className="text-base leading-relaxed mb-6" style={{ color: '#A6AEC1' }}>
        Confirmation sent to{' '}
        <strong style={{ color: '#00E5FF' }}>{form.email}</strong>.
        You&apos;ll be first to know when LeadShield goes live — with 60 days Pro free.
      </p>
      <div
        className="inline-block px-5 py-2 rounded-full text-sm font-bold"
        style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)' }}
      >
        60 Days Pro &nbsp;·&nbsp; No Credit Card &nbsp;·&nbsp; Beta Access
      </div>
    </div>
  )

  const baseInput = 'w-full rounded-xl px-4 py-3 text-sm outline-none transition-all'
  const baseStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#E8EAF0' }
  const focusStyle = { borderColor: 'rgba(0,229,255,0.5)', background: 'rgba(255,255,255,0.07)' }
  const blurStyle  = { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: '#8892A4' }}>
            Full Name *
          </label>
          <input
            type="text" required placeholder="Mike Johnson"
            value={form.name} onChange={set('name')}
            className={baseInput} style={baseStyle}
            onFocus={e => Object.assign(e.target.style, focusStyle)}
            onBlur={e => Object.assign(e.target.style, blurStyle)}
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: '#8892A4' }}>
            Email Address *
          </label>
          <input
            type="email" required placeholder="mike@mikesplumbing.com"
            value={form.email} onChange={set('email')}
            className={baseInput} style={baseStyle}
            onFocus={e => Object.assign(e.target.style, focusStyle)}
            onBlur={e => Object.assign(e.target.style, blurStyle)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: '#8892A4' }}>
            Your Trade
          </label>
          <select
            value={form.trade} onChange={set('trade')}
            className={baseInput} style={baseStyle}
            onFocus={e => Object.assign(e.target.style, focusStyle)}
            onBlur={e => Object.assign(e.target.style, blurStyle)}
          >
            <option value="">Select your trade...</option>
            {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: '#8892A4' }}>
            Phone (optional)
          </label>
          <input
            type="tel" placeholder="(661) 555-0100"
            value={form.phone} onChange={set('phone')}
            className={baseInput} style={baseStyle}
            onFocus={e => Object.assign(e.target.style, focusStyle)}
            onBlur={e => Object.assign(e.target.style, blurStyle)}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: '#8892A4' }}>
          Questions or comments?
        </label>
        <textarea
          rows={3}
          placeholder="How many calls do you miss a week? What would help most?"
          value={form.message} onChange={set('message')}
          className={`${baseInput} resize-none`} style={baseStyle}
          onFocus={e => Object.assign(e.target.style, focusStyle)}
          onBlur={e => Object.assign(e.target.style, blurStyle)}
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-center" style={{ color: '#FF6666' }}>{errMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-4 rounded-xl font-bold text-lg text-white transition-all hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: status === 'loading'
            ? 'rgba(255,255,255,0.1)'
            : 'linear-gradient(135deg, #00E5FF 0%, #0070FF 100%)',
          boxShadow: status === 'loading' ? 'none' : '0 0 32px rgba(0,229,255,0.3)',
          fontFamily: 'Space Grotesk, sans-serif',
        }}
      >
        {status === 'loading' ? 'Securing your spot...' : 'Get Early Access — Free →'}
      </button>

      <p className="text-center text-xs" style={{ color: '#8892A4' }}>
        No credit card. No spam. 60 days Pro free for beta testers.
      </p>
    </form>
  )
}
