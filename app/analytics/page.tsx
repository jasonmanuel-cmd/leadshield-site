'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import StatsCard from '@/components/StatsCard'
import { createClient, CallEvent, Lead } from '@/lib/supabase'
import { getStatusLabel } from '@/lib/utils'

type SourceBreakdown = {
  label: string
  count: number
}

export default function AnalyticsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState<Lead[]>([])
  const [callEvents, setCallEvents] = useState<CallEvent[]>([])

  const fetchAnalytics = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/signon')
      return
    }

    const userId = session.user.id

    const [{ data: leadData }, { data: eventData }] = await Promise.all([
      supabase.from('leads').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('call_events').select('*').eq('user_id', userId).order('occurred_at', { ascending: false }),
    ])

    setLeads(leadData ?? [])
    setCallEvents(eventData ?? [])
    setLoading(false)
  }, [router, supabase])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  useEffect(() => {
    const channel = supabase
      .channel('analytics-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchAnalytics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'call_events' }, fetchAnalytics)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAnalytics, supabase])

  const sourceBreakdown = useMemo(() => buildSourceBreakdown(leads), [leads])
  const statusBreakdown = useMemo(() => buildStatusBreakdown(leads), [leads])
  const syncRate = useMemo(() => {
    if (leads.length === 0) {
      return '0%'
    }

    const syncedCount = leads.filter((lead) => lead.source === 'leadshield-phone' || lead.source === 'phone').length
    return `${Math.round((syncedCount / leads.length) * 100)}%`
  }, [leads])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e1a' }}>
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#00E5FF', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: '#050814' }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 15% 10%, rgba(0,229,255,0.16), transparent 28%), radial-gradient(circle at 80% 0%, rgba(255,215,0,0.10), transparent 22%), radial-gradient(circle at 50% 100%, rgba(0,200,83,0.08), transparent 24%)',
        }}
      />
      <Navbar />

      <main className="relative pt-16 pb-24 md:pb-8 md:pt-20 px-4 max-w-7xl mx-auto">
        <section className="rounded-[28px] p-6 md:p-8 glass-panel surface-glow mb-6 overflow-hidden relative">
          <div className="absolute inset-0 command-accent opacity-70" />
          <div className="absolute -right-12 top-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="text-[11px] uppercase tracking-[0.28em] mb-3" style={{ color: '#FFD700' }}>
                Command Intelligence
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight" style={{ color: '#F5F7FA' }}>
                Analytics built for
                <span style={{ color: '#00E5FF' }}> live phone ops</span>.
              </h1>
              <p className="mt-4 text-sm md:text-base leading-7 max-w-xl" style={{ color: '#A6AEC1' }}>
                See customer-phone sync volume, lead status mix, and call flow at a glance. The cards below are tuned
                for quick decision making when calls are coming in fast.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-[280px]">
              <MetricPill label="Total" value={leads.length} accent="#00E5FF" />
              <MetricPill label="Booked" value={leads.filter((lead) => lead.status === 'booked').length} accent="#00C853" />
              <MetricPill label="Open" value={leads.filter((lead) => lead.status === 'new').length} accent="#FFD700" />
              <MetricPill label="Events" value={callEvents.length} accent="#FF6666" />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatsCard label="Total Leads" value={leads.length} accent="cyan" />
          <StatsCard label="Open Leads" value={leads.filter((lead) => lead.status === 'new').length} accent="gold" />
          <StatsCard label="Booked" value={leads.filter((lead) => lead.status === 'booked').length} accent="green" />
          <StatsCard label="Sync Rate" value={syncRate} accent="red" />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <section
            className="rounded-[28px] p-5 glass-panel"
          >
            <h2 className="font-display text-base font-semibold mb-4" style={{ color: '#F5F7FA' }}>
              Lead Status Breakdown
            </h2>

            {statusBreakdown.length === 0 ? (
              <p className="text-sm" style={{ color: '#8892A4' }}>No leads synced yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {statusBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span style={{ color: '#E8EAF0' }}>{getStatusLabel(item.label as Lead['status'])}</span>
                    <span
                      className="px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(0,229,255,0.12)', color: '#00E5FF' }}
                    >
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section
            className="rounded-[28px] p-5 glass-panel"
          >
            <h2 className="font-display text-base font-semibold mb-4" style={{ color: '#F5F7FA' }}>
              Data Sources
            </h2>

            {sourceBreakdown.length === 0 ? (
              <p className="text-sm" style={{ color: '#8892A4' }}>No source data is available yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {sourceBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span style={{ color: '#E8EAF0' }}>{item.label}</span>
                    <span
                      className="px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(255,215,0,0.12)', color: '#FFD700' }}
                    >
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section
          className="rounded-[28px] p-5 mt-4 glass-panel"
        >
          <h2 className="font-display text-base font-semibold mb-4" style={{ color: '#F5F7FA' }}>
            Recent Phone Activity
          </h2>

          {callEvents.length === 0 ? (
            <p className="text-sm" style={{ color: '#8892A4' }}>No call activity has synced yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {callEvents.slice(0, 8).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div>
                    <div className="text-sm font-medium" style={{ color: '#E8EAF0' }}>
                      {event.contact_name || event.phone_number}
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#8892A4' }}>
                      {event.call_type || 'call'} · {event.occurred_at}
                    </div>
                  </div>

                  <div className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,229,255,0.12)', color: '#00E5FF' }}>
                    {event.ai_handled ? 'AI Handled' : event.reply_sent ? 'Replied' : 'Missed'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function MetricPill({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: '#8892A4' }}>
        {label}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="text-2xl font-bold font-mono-ui" style={{ color: accent }}>
          {value}
        </div>
        <div className="h-2.5 w-2.5 rounded-full" style={{ background: accent, boxShadow: `0 0 18px ${accent}` }} />
      </div>
    </div>
  )
}

function buildStatusBreakdown(leads: Lead[]): SourceBreakdown[] {
  const counts = new Map<string, number>()

  for (const lead of leads) {
    counts.set(lead.status, (counts.get(lead.status) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count)
}

function buildSourceBreakdown(leads: Lead[]): SourceBreakdown[] {
  const counts = new Map<string, number>()

  for (const lead of leads) {
    const label = lead.source?.trim() || 'Unknown'
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count)
}