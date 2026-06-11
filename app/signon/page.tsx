'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/client/template')
      const data = await res.json()
      router.push(data.client ? '/crm' : '/')
    } catch {
      router.push('/')
    }
    router.refresh()
  }

  return (
    <div className="min-h-screen overflow-hidden px-4 py-8 md:px-6 md:py-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at top left, rgba(0,229,255,0.16), transparent 28%), radial-gradient(circle at 70% 20%, rgba(255,215,0,0.12), transparent 22%), radial-gradient(circle at bottom center, rgba(0,200,83,0.08), transparent 25%)',
        }}
      />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-[30px] p-7 md:p-10 glass-panel surface-glow overflow-hidden relative">
          <div className="absolute inset-0 command-accent opacity-70" />
          <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em]" style={{ color: '#8892A4' }}>
              <span className="inline-flex h-2 w-2 rounded-full bg-[#00E5FF] shadow-[0_0_18px_rgba(0,229,255,0.7)]" />
              LeadShield CRM
            </div>

            <h1 className="font-display mt-5 text-4xl md:text-6xl font-bold leading-tight" style={{ color: '#F5F7FA' }}>
              Sign in to your
              <span style={{ color: '#00E5FF' }}> CRM dashboard</span>.
            </h1>

            <p className="mt-5 max-w-xl text-sm md:text-base leading-7" style={{ color: '#A6AEC1' }}>
              View your leads, manage your pipeline, update statuses, and configure your
              missed-call auto-reply settings. All from one web dashboard.
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-[30px] p-6 md:p-8 glass-panel surface-glow">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-semibold" style={{ color: '#F5F7FA' }}>
              Sign in
            </h2>
            <p className="text-sm mt-2" style={{ color: '#8892A4' }}>
              Sign in to access your CRM and manage your leads.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field
              label="Email address"
              inputProps={{
                type: 'email',
                value: email,
                onChange: (e) => setEmail(e.target.value),
                required: true,
                autoComplete: 'email',
                placeholder: 'you@example.com',
              }}
            />

            <Field
              label="Password"
              inputProps={{
                type: 'password',
                value: password,
                onChange: (e) => setPassword(e.target.value),
                required: true,
                autoComplete: 'current-password',
                placeholder: '••••••••',
              }}
            />

            <a href="/reset-password"
              style={{ display: 'inline-block', marginTop: '6px', fontSize: '12px', color: '#94A3B8', textDecoration: 'none' }}>
              Forgot password?
            </a>

            {error && (
              <div
                className="rounded-2xl px-4 py-3 text-sm"
                style={{
                  background: 'rgba(255,68,68,0.1)',
                  border: '1px solid rgba(255,68,68,0.25)',
                  color: '#FF6666',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm mt-2 transition-all"
              style={{
                background: loading ? 'rgba(0,229,255,0.3)' : '#00E5FF',
                color: '#07111f',
                opacity: loading ? 0.8 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in...' : 'Enter Command Center'}
            </button>
          </form>

          <div className="mt-6 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs uppercase tracking-[0.22em] mb-2" style={{ color: '#8892A4' }}>
              Access note
            </p>
            <p className="text-sm" style={{ color: '#A6AEC1' }}>
              Your CRM account is managed by your admin. Sign in to view leads, manage your pipeline,
              and configure your missed-call auto-reply settings.
            </p>
          </div>

          <div className="mt-4 rounded-2xl p-4 flex items-center justify-between gap-3"
            style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.18)' }}>
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: '#00E5FF' }}>
                Not a CRM client yet?
              </p>
              <p className="text-xs" style={{ color: '#8892A4' }}>
                Contact your admin to get set up with a tracking number and CRM access.
              </p>
            </div>
            <a
              href="/"
              className="shrink-0 text-xs font-bold px-3 py-2 rounded-xl transition-all"
              style={{ background: 'rgba(0,229,255,0.15)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.3)' }}
            >
              Learn More →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  inputProps,
}: {
  label: string
  inputProps: React.InputHTMLAttributes<HTMLInputElement>
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-2" style={{ color: '#A6AEC1' }}>
        {label}
      </span>
      <input
        {...inputProps}
        className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition-all glass-panel"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#E8EAF0',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'rgba(0,229,255,0.45)'
          e.target.style.background = 'rgba(255,255,255,0.07)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(255,255,255,0.1)'
          e.target.style.background = 'rgba(255,255,255,0.05)'
        }}
      />
    </label>
  )
}

function StatChip({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: '#8892A4' }}>
        {label}
      </div>
      <div className="text-sm font-semibold" style={{ color: accent }}>
        {value}
      </div>
    </div>
  )
}
