'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, Lead, CallEvent } from '@/lib/supabase'
import { formatPhone, timeAgo, startOfDay, startOfWeek } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import StatsCard from '@/components/StatsCard'
import UrgencyBadge from '@/components/UrgencyBadge'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [todayLeads, setTodayLeads] = useState(0)
  const [openLeads, setOpenLeads] = useState(0)
  const [aiConversationsToday, setAiConversationsToday] = useState(0)
  const [bookedThisWeek, setBookedThisWeek] = useState(0)
  const [recentActivity, setRecentActivity] = useState<CallEvent[]>([])
  const [urgentLeads, setUrgentLeads] = useState<Lead[]>([])
  const priorityLeads = urgentLeads.slice(0, 3)
  const coverageRate = todayLeads === 0 ? 0 : Math.min(100, Math.round((aiConversationsToday / todayLeads) * 100))
  const leadVelocity = openLeads + urgentLeads.length

  const fetchData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/signon')
      return
    }

    const userId = session.user.id
    const todayStart = startOfDay()
    const weekStart = startOfWeek()

    const [
      { count: todayCount },
      { count: openCount },
      { count: aiCount },
      { count: bookedCount },
      { data: activityData },
      { data: urgentData },
    ] = await Promise.all([
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', todayStart),
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'new'),
      supabase
        .from('call_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('ai_handled', true)
        .gte('occurred_at', todayStart),
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'booked')
        .gte('updated_at', weekStart),
      supabase
        .from('call_events')
        .select('*')
        .eq('user_id', userId)
        .order('occurred_at', { ascending: false })
        .limit(10),
      supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId)
        .eq('urgency_level', 'urgent')
        .eq('status', 'new')
        .order('created_at', { ascending: false }),
    ])

    setTodayLeads(todayCount ?? 0)
    setOpenLeads(openCount ?? 0)
    setAiConversationsToday(aiCount ?? 0)
    setBookedThisWeek(bookedCount ?? 0)
    setRecentActivity(activityData ?? [])
    setUrgentLeads(urgentData ?? [])
    setLoading(false)
  }, [router, supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'call_events' }, fetchData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchData, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e1a' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#00E5FF', borderTopColor: 'transparent' }}
          />
          <span style={{ color: '#8892A4' }}>Loading your dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: '#050814' }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at top left, rgba(0,229,255,0.14), transparent 30%), radial-gradient(circle at top right, rgba(255,215,0,0.12), transparent 26%), radial-gradient(circle at bottom center, rgba(0,200,83,0.08), transparent 28%)',
        }}
      />
      <Navbar />

      <main className="relative pt-18 pb-24 md:pb-10 md:pt-22 px-4 max-w-7xl mx-auto">
        <section className="grid lg:grid-cols-12 gap-4 mb-6">
          <div className="lg:col-span-8 rounded-[28px] p-6 md:p-8 glass-panel surface-glow overflow-hidden relative">
            <div className="absolute inset-0 command-accent opacity-80" />
            <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative flex flex-col gap-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em]" style={{ color: '#8892A4' }}>
                <span className="inline-flex h-2 w-2 rounded-full bg-[#00E5FF] shadow-[0_0_18px_rgba(0,229,255,0.7)]" />
                Live Sync Online
              </div>

              <div className="max-w-2xl">
                <div className="text-[11px] uppercase tracking-[0.3em] mb-3" style={{ color: '#FFD700' }}>
                  LeadShield Command Center
                </div>
                <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight" style={{ color: '#F5F7FA' }}>
                  Every missed call,
                  <span style={{ color: '#00E5FF' }}> tracked in real time</span>.
                </h1>
                <p className="mt-4 max-w-xl text-sm md:text-base leading-7" style={{ color: '#A6AEC1' }}>
                  Customer-phone data lands here automatically. The dashboard surfaces urgent leads, AI replies,
                  and booked jobs so you can move from call to close without losing context.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/pipeline"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-3 font-semibold text-sm"
                  style={{ background: '#00E5FF', color: '#07111f' }}
                >
                  Open Pipeline
                  <span>→</span>
                </Link>
                <Link
                  href="/conversations"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-3 font-semibold text-sm glass-panel"
                  style={{ color: '#E8EAF0' }}
                >
                  View Conversations
                </Link>
                <Link
                  href="/analytics"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-3 font-semibold text-sm glass-panel"
                  style={{ color: '#E8EAF0' }}
                >
                  Open Analytics
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 rounded-[28px] p-5 md:p-6 glass-panel surface-glow flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] mb-1" style={{ color: '#8892A4' }}>
                  System Status
                </div>
                <div className="text-lg font-semibold font-display" style={{ color: '#E8EAF0' }}>
                  Command Feed
                </div>
              </div>
              <div
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: 'rgba(0,200,83,0.12)', color: '#00C853', border: '1px solid rgba(0,200,83,0.22)' }}
              >
                Stable
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniPulse label="Today" value={todayLeads} accent="#00E5FF" />
              <MiniPulse label="Open" value={openLeads} accent="#FFD700" />
              <MiniPulse label="AI Rate" value={`${coverageRate}%`} accent="#00C853" />
              <MiniPulse label="Urgent" value={urgentLeads.length} accent="#FF4444" />
            </div>

            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] mb-2" style={{ color: '#8892A4' }}>
                <span>Lead Velocity</span>
                <span className="font-mono-ui" style={{ color: '#E8EAF0' }}>{leadVelocity}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(100, leadVelocity * 12)}%`, background: 'linear-gradient(90deg, #00E5FF, #00C853)' }}
                />
              </div>
              <p className="mt-3 text-sm" style={{ color: '#A6AEC1' }}>
                Higher velocity means more conversations are moving toward booked jobs.
              </p>
            </div>
          </div>
        </section>

        {/* Urgent Banner */}
        {urgentLeads.length > 0 && (
          <div
            className="mb-6 rounded-[24px] px-5 py-4 flex items-center justify-between gap-4 glass-panel"
            style={{
              background: 'rgba(255,68,68,0.12)',
              borderColor: 'rgba(255,68,68,0.28)',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl">🚨</span>
              <div className="min-w-0">
                <span className="font-semibold block" style={{ color: '#FF6666' }}>
                  {urgentLeads.length} urgent lead{urgentLeads.length !== 1 ? 's' : ''} need attention
                </span>
                <p className="text-sm mt-0.5" style={{ color: '#A6AEC1' }}>
                  These callers marked the job as urgent. Move them to the front of the queue.
                </p>
              </div>
            </div>
            <Link
              href="/pipeline"
              className="shrink-0 text-sm font-semibold px-4 py-2 rounded-xl"
              style={{
                background: 'rgba(255,68,68,0.2)',
                color: '#FF6666',
                border: '1px solid rgba(255,68,68,0.35)',
              }}
            >
              Inspect
            </Link>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
          <StatsCard
            label="Today's Leads"
            value={todayLeads}
            accent="cyan"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <StatsCard
            label="Open Leads"
            value={openLeads}
            accent="gold"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />
          <StatsCard
            label="AI Convos Today"
            value={aiConversationsToday}
            accent="cyan"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            }
          />
          <StatsCard
            label="Booked This Week"
            value={bookedThisWeek}
            accent="green"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            }
          />
        </div>

        {/* Recent Activity */}
        <section className="grid lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 rounded-[28px] p-5 md:p-6 glass-panel surface-glow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-xl font-semibold" style={{ color: '#F5F7FA' }}>Recent Activity</h2>
                <p className="text-sm mt-1" style={{ color: '#8892A4' }}>
                  Latest customer-phone events flowing into LeadShield.
                </p>
              </div>
              <Link href="/conversations" className="text-sm font-semibold" style={{ color: '#00E5FF' }}>
                View all →
              </Link>
            </div>

            {recentActivity.length === 0 ? (
              <div
                className="rounded-2xl p-8 text-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p style={{ color: '#8892A4' }}>No activity yet. Calls will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {recentActivity.map((event) => (
                  <ActivityRow key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 rounded-[28px] p-5 md:p-6 glass-panel surface-glow flex flex-col gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold" style={{ color: '#F5F7FA' }}>Priority Queue</h2>
              <p className="text-sm mt-1" style={{ color: '#8892A4' }}>
                The hottest leads pulled from the live pipeline.
              </p>
            </div>

            {priorityLeads.length === 0 ? (
              <div className="rounded-2xl p-5 text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#8892A4' }}>
                No urgent leads right now.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {priorityLeads.map((lead) => (
                  <div key={lead.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold truncate" style={{ color: '#E8EAF0' }}>
                          {lead.contact_name || formatPhone(lead.phone_number)}
                        </div>
                        <div className="text-xs mt-1" style={{ color: '#8892A4' }}>
                          {lead.service_needed || 'Unknown service'}
                        </div>
                      </div>
                      <UrgencyBadge urgency={lead.urgency_level} />
                    </div>
                    <Link
                      href={`/leads/${lead.id}`}
                      className="inline-flex mt-4 text-sm font-semibold"
                      style={{ color: '#00E5FF' }}
                    >
                      Open lead →
                    </Link>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link href="/pipeline" className="rounded-xl px-4 py-3 text-sm font-semibold text-center glass-panel" style={{ color: '#E8EAF0' }}>
                Pipeline
              </Link>
              <Link href="/analytics" className="rounded-xl px-4 py-3 text-sm font-semibold text-center glass-panel" style={{ color: '#E8EAF0' }}>
                Analytics
              </Link>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}

function MiniPulse({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: '#8892A4' }}>
        {label}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="text-2xl font-bold font-mono-ui" style={{ color: accent }}>
          {value}
        </div>
        <div className="h-2 w-2 rounded-full" style={{ background: accent, boxShadow: `0 0 18px ${accent}` }} />
      </div>
    </div>
  )
}

function ActivityRow({ event }: { event: CallEvent }) {
  const displayName = event.contact_name || formatPhone(event.phone_number)

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
      style={{
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(0,229,255,0.12)', color: '#00E5FF' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.4a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 16l.42.92z" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="font-medium text-sm truncate" style={{ color: '#F5F7FA' }}>
            {displayName}
          </div>
          <div className="text-xs" style={{ color: '#8892A4' }}>
            {timeAgo(event.occurred_at)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {event.ai_handled ? (
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              background: 'rgba(0,229,255,0.12)',
              color: '#00E5FF',
              border: '1px solid rgba(0,229,255,0.25)',
            }}
          >
            AI Handled
          </span>
        ) : event.reply_sent ? (
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              background: 'rgba(0,200,83,0.12)',
              color: '#00C853',
              border: '1px solid rgba(0,200,83,0.25)',
            }}
          >
            Replied
          </span>
        ) : (
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: '#8892A4',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            Missed
          </span>
        )}
      </div>
    </div>
  )
}
