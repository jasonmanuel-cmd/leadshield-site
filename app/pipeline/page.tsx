'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, Lead } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import LeadCard from '@/components/LeadCard'
import { getStatusLabel } from '@/lib/utils'

const STATUSES = ['new', 'called_back', 'quoted', 'booked', 'lost'] as const
type Status = typeof STATUSES[number]

const STATUS_COLORS: Record<Status, string> = {
  new: '#00E5FF',
  called_back: '#3B82F6',
  quoted: '#FFD700',
  booked: '#00C853',
  lost: '#8892A4',
}

export default function PipelinePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState<Lead[]>([])
  const [activeTab, setActiveTab] = useState<Status>('new')

  const fetchLeads = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/signon')
      return
    }

    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    setLeads(data ?? [])
    setLoading(false)
  }, [router, supabase])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  useEffect(() => {
    const channel = supabase
      .channel('pipeline-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchLeads)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchLeads, supabase])

  const getLeadsByStatus = (status: Status) =>
    leads.filter((l) => l.status === status)

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
    <div className="min-h-screen" style={{ background: '#0a0e1a' }}>
      <Navbar />

      <main className="pt-16 pb-24 md:pb-8 md:pt-20 px-4 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#E8EAF0' }}>Pipeline</h1>
          <p className="text-sm mt-1" style={{ color: '#8892A4' }}>
            {leads.length} total lead{leads.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden">
          <div className="flex gap-1 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
            {STATUSES.map((status) => {
              const count = getLeadsByStatus(status).length
              const color = STATUS_COLORS[status]
              const active = activeTab === status
              return (
                <button
                  key={status}
                  onClick={() => setActiveTab(status)}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: active ? `${color}18` : 'rgba(255,255,255,0.04)',
                    border: active ? `1px solid ${color}50` : '1px solid rgba(255,255,255,0.08)',
                    color: active ? color : '#8892A4',
                  }}
                >
                  {getStatusLabel(status)}
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                    style={{
                      background: active ? `${color}25` : 'rgba(255,255,255,0.08)',
                      color: active ? color : '#8892A4',
                    }}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-3">
            {getLeadsByStatus(activeTab).length === 0 ? (
              <EmptyColumn status={activeTab} />
            ) : (
              getLeadsByStatus(activeTab).map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))
            )}
          </div>
        </div>

        {/* Desktop kanban */}
        <div className="hidden md:flex gap-4 overflow-x-auto pb-4 kanban-scroll">
          {STATUSES.map((status) => {
            const statusLeads = getLeadsByStatus(status)
            const color = STATUS_COLORS[status]
            return (
              <div key={status} className="flex-shrink-0 w-72">
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-sm font-semibold" style={{ color: '#E8EAF0' }}>
                    {getStatusLabel(status)}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold ml-auto"
                    style={{ background: `${color}18`, color }}
                  >
                    {statusLeads.length}
                  </span>
                </div>

                {/* Column body */}
                <div
                  className="rounded-xl p-3 min-h-32"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {statusLeads.length === 0 ? (
                    <EmptyColumn status={status} />
                  ) : (
                    <div className="flex flex-col gap-3">
                      {statusLeads.map((lead) => (
                        <LeadCard key={lead.id} lead={lead} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

function EmptyColumn({ status }: { status: Status }) {
  const messages: Record<Status, string> = {
    new: 'New leads from missed calls appear here',
    called_back: 'Leads you\'ve called back',
    quoted: 'Leads you\'ve sent a quote to',
    booked: 'Jobs you\'ve booked',
    lost: 'Leads that didn\'t convert',
  }

  return (
    <div className="text-center py-8 px-4">
      <p className="text-sm" style={{ color: '#8892A4' }}>
        {messages[status]}
      </p>
    </div>
  )
}
