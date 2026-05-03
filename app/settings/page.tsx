'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail]         = useState<string | null>(null)
  const [userId, setUserId]       = useState<string | null>(null)
  const [syncUrl, setSyncUrl]     = useState<string>('https://leadshield.live/api/sync')
  const [syncToken, setSyncToken] = useState<string>('')
  const [loading, setLoading]     = useState(true)
  const [copied, setCopied]       = useState<string | null>(null)

  const fetchSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/signon'); return }
    setEmail(session.user.email ?? null)
    setUserId(session.user.id)

    // Fetch sync credentials securely — token is served server-side only
    try {
      const res = await fetch('/api/sync-credentials')
      if (res.ok) {
        const creds = await res.json()
        setSyncUrl(creds.syncUrl)
        setSyncToken(creds.syncToken)
      }
    } catch { /* use defaults */ }

    setLoading(false)
  }, [router, supabase])

  useEffect(() => { fetchSession() }, [fetchSession])

  function copy(value: string, key: string) {
    navigator.clipboard.writeText(value)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/signon')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e1a' }}>
      <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#00E5FF', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#050814' }}>
      <div className="pointer-events-none absolute inset-0" style={{
        background: 'radial-gradient(circle at top left, rgba(0,229,255,0.10), transparent 30%), radial-gradient(circle at bottom right, rgba(255,215,0,0.08), transparent 28%)'
      }} />
      <Navbar />

      <main className="relative pt-16 pb-24 md:pb-8 md:pt-20 px-4 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F7FA' }}>
            Account &amp; Settings
          </h1>
          <p className="text-sm" style={{ color: '#8892A4' }}>
            Configure your LeadShield Android app connection and manage your account.
          </p>
        </div>

        {/* Account Info */}
        <Section title="Your Account" accent="#00E5FF">
          <InfoRow label="Email address" value={email ?? '—'} />
          <InfoRow label="User ID" value={userId ?? '—'} mono />
          <InfoRow label="Plan" value="Operator" accent="#FFD700" />
        </Section>

        {/* Android App Connection */}
        <Section title="Connect the Android App" accent="#FFD700">
          <p className="text-sm mb-5 leading-relaxed" style={{ color: '#A6AEC1' }}>
            To sync missed-call data from your phone to this dashboard, open the LeadShield
            Android app, go to{' '}
            <strong className="text-white">Settings &rarr; Cloud Sync</strong> and paste these two values.
          </p>

          <div className="space-y-4">
            <CopyField
              label="CRM Sync URL"
              value={syncUrl}
              copiedKey="url"
              activeCopied={copied}
              onCopy={() => copy(syncUrl, 'url')}
              note="Paste into the Android app: Settings → Cloud Sync → Sync URL"
            />
            <CopyField
              label="Sync Token"
              value={syncToken || 'Loading...'}
              copiedKey="token"
              activeCopied={copied}
              onCopy={() => copy(syncToken, 'token')}
              note="Paste into the Android app: Settings → Cloud Sync → Sync Token"
            />
          </div>

          <div className="mt-5 rounded-2xl p-4 flex items-start gap-3"
            style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.18)' }}>
            <span className="text-lg mt-0.5">📱</span>
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#00E5FF' }}>How the sync works</p>
              <p className="text-xs leading-relaxed" style={{ color: '#8892A4' }}>
                Every time you miss a call and LeadShield sends an auto-reply, the lead is pushed
                here automatically. You&apos;ll see it appear in real time under Pipeline and
                Dashboard — no refresh needed.
              </p>
            </div>
          </div>
        </Section>

        {/* Download / Beta */}
        <Section title="Get the Android App" accent="#00C853">
          <p className="text-sm mb-5 leading-relaxed" style={{ color: '#A6AEC1' }}>
            LeadShield runs on your Android phone. Install it to start auto-replying to missed
            calls and syncing leads to this dashboard.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <a href="https://play.google.com/store/apps/details?id=com.mctb.autoreply"
              target="_blank" rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl p-4 transition-all hover:opacity-90"
              style={{ background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.25)' }}>
              <span className="text-2xl">🏪</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#00C853' }}>Google Play Store</p>
                <p className="text-xs" style={{ color: '#8892A4' }}>Free download · Android 8.0+</p>
              </div>
            </a>
            <Link href="/beta"
              className="flex items-center gap-3 rounded-2xl p-4 transition-all hover:opacity-90"
              style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.22)' }}>
              <span className="text-2xl">🧪</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#FFD700' }}>Beta Program</p>
                <p className="text-xs" style={{ color: '#8892A4' }}>Early access · 60 days Pro free</p>
              </div>
            </Link>
          </div>

          <div className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <span className="text-lg mt-0.5">⚡</span>
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#E8EAF0' }}>Setup takes 3 minutes</p>
              <ol className="text-xs space-y-1 list-decimal list-inside" style={{ color: '#8892A4' }}>
                <li>Install the app and complete onboarding</li>
                <li>Enable auto-reply and set your active hours</li>
                <li>Go to Settings &rarr; Cloud Sync</li>
                <li>Paste the Sync URL and User ID from above</li>
                <li>Leads appear here instantly when you miss a call</li>
              </ol>
            </div>
          </div>
        </Section>

        {/* Quick Nav */}
        <Section title="Quick Navigation" accent="#8892A4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/dashboard',     label: 'Dashboard',     icon: '📊' },
              { href: '/pipeline',      label: 'Pipeline',      icon: '📋' },
              { href: '/conversations', label: 'Conversations', icon: '💬' },
              { href: '/analytics',     label: 'Analytics',     icon: '📈' },
            ].map(({ href, label, icon }) => (
              <Link key={href} href={href}
                className="flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition-all hover:opacity-90 glass-panel"
                style={{ color: '#E8EAF0' }}>
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </Section>

        {/* Support */}
        <Section title="Support" accent="#8892A4">
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="mailto:support@coaibakersfield.com"
              className="flex-1 flex items-center gap-3 rounded-2xl p-4 glass-panel transition-all hover:opacity-90">
              <span className="text-xl">✉️</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#E8EAF0' }}>Email Support</p>
                <p className="text-xs" style={{ color: '#8892A4' }}>support@coaibakersfield.com</p>
              </div>
            </a>
            <a href="https://coaibakersfield.com" target="_blank" rel="noreferrer"
              className="flex-1 flex items-center gap-3 rounded-2xl p-4 glass-panel transition-all hover:opacity-90">
              <span className="text-xl">🌐</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#E8EAF0' }}>Main Website</p>
                <p className="text-xs" style={{ color: '#8892A4' }}>coaibakersfield.com</p>
              </div>
            </a>
          </div>
        </Section>

        <button onClick={handleSignOut}
          className="w-full py-3 rounded-2xl text-sm font-semibold transition-all mt-2"
          style={{ background: 'rgba(255,68,68,0.08)', color: '#FF6666', border: '1px solid rgba(255,68,68,0.2)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,68,68,0.14)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,68,68,0.08)' }}>
          Sign Out
        </button>
      </main>
    </div>
  )
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-[24px] p-5 md:p-6 glass-panel surface-glow">
      <h2 className="font-display text-base font-semibold mb-4 flex items-center gap-2" style={{ color: '#F5F7FA' }}>
        <span className="w-1 h-4 rounded-full inline-block" style={{ background: accent }} />
        {title}
      </h2>
      {children}
    </div>
  )
}

function InfoRow({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <span className="text-sm" style={{ color: '#8892A4' }}>{label}</span>
      <span className={`text-sm font-medium ${mono ? 'font-mono text-xs truncate max-w-[200px]' : ''}`}
        style={{ color: accent ?? '#E8EAF0' }}>
        {value}
      </span>
    </div>
  )
}

function CopyField({ label, value, copiedKey, activeCopied, onCopy, note }: {
  label: string
  value: string
  copiedKey: string
  activeCopied: string | null
  onCopy: () => void
  note?: string
}) {
  const isCopied = activeCopied === copiedKey
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: '#8892A4' }}>
        {label}
      </label>
      <div className="flex gap-2">
        <div className="flex-1 rounded-xl px-4 py-3 text-xs font-mono truncate"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#E8EAF0' }}>
          {value || '—'}
        </div>
        <button onClick={onCopy}
          className="flex-shrink-0 px-4 py-3 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: isCopied ? 'rgba(0,200,83,0.2)' : 'rgba(0,229,255,0.12)',
            color: isCopied ? '#00C853' : '#00E5FF',
            border: isCopied ? '1px solid rgba(0,200,83,0.3)' : '1px solid rgba(0,229,255,0.25)',
          }}>
          {isCopied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      {note && <p className="mt-1.5 text-xs" style={{ color: '#8892A4' }}>{note}</p>}
    </div>
  )
}
