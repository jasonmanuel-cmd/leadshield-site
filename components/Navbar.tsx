'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/signon')
    router.refresh()
  }

  const navItems = [
    { href: '/crm',  label: 'CRM',    icon: DashboardIcon },
    { href: '/crm/settings', label: 'Settings', icon: SettingsIcon },
  ]

  return (
    <>
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-6 py-3"
        style={{ background: 'rgba(7,10,18,0.78)' }}>
        <Link href="/crm" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight font-display" style={{ color: '#00E5FF' }}>
            LeadShield
          </span>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.18em]"
            style={{ background: 'rgba(0,229,255,0.14)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.28)' }}>
            CRM
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                color: pathname.startsWith(item.href) ? '#00E5FF' : '#8892A4',
                background: pathname.startsWith(item.href) ? 'rgba(0,229,255,0.1)' : 'transparent',
              }}
            >
              <item.icon active={pathname.startsWith(item.href)} />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/" className="text-sm px-3 py-2 rounded-lg transition-colors" style={{ color: '#8892A4' }}>
            Home
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm px-4 py-2 rounded-lg transition-all"
            style={{ color: '#8892A4', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#E8EAF0'
              e.currentTarget.style.borderColor = 'rgba(0,229,255,0.22)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#8892A4'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(7,10,18,0.82)' }}>
        <Link href="/crm" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight font-display" style={{ color: '#00E5FF' }}>
            LeadShield
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-[0.18em]"
            style={{ background: 'rgba(0,229,255,0.14)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.28)' }}>
            CRM
          </span>
        </Link>
        <button
          onClick={handleSignOut}
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{ color: '#8892A4', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Sign Out
        </button>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
        style={{ background: 'rgba(7,10,18,0.82)' }}>
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all min-w-0"
              style={{
                color: active ? '#00E5FF' : '#8892A4',
                background: active ? 'rgba(0,229,255,0.08)' : 'transparent',
              }}
            >
              <item.icon active={active} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#00E5FF' : 'currentColor'}
      strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#00E5FF' : 'currentColor'}
      strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
