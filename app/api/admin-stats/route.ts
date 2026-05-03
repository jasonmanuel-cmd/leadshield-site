import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token || token !== process.env.MASTER_ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [
    betaSignupsResult,
    leadsResult,
    callEventsResult,
    messagesResult,
    byTradeResult,
    last14DaysResult,
    leadsByStatusResult,
  ] = await Promise.all([
    supabase.from('beta_signups').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('call_events').select('*', { count: 'exact', head: true }),
    supabase.from('conversation_messages').select('*', { count: 'exact', head: true }),
    supabase
      .from('beta_signups')
      .select('trade')
      .not('trade', 'is', null),
    supabase
      .from('beta_signups')
      .select('signed_up_at')
      .gte(
        'signed_up_at',
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order('signed_up_at', { ascending: true }),
    supabase.from('leads').select('status').not('status', 'is', null),
  ])

  // Aggregate byTrade client-side (GROUP BY trade)
  const tradeCounts: Record<string, number> = {}
  for (const row of byTradeResult.data ?? []) {
    const t = row.trade as string
    tradeCounts[t] = (tradeCounts[t] ?? 0) + 1
  }
  const byTrade = Object.entries(tradeCounts)
    .map(([trade, count]) => ({ trade, count }))
    .sort((a, b) => b.count - a.count)

  // Aggregate last14Days by date
  const dateCounts: Record<string, number> = {}
  for (const row of last14DaysResult.data ?? []) {
    const date = (row.signed_up_at as string).slice(0, 10)
    dateCounts[date] = (dateCounts[date] ?? 0) + 1
  }
  const last14Days = Object.entries(dateCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Aggregate leadsByStatus
  const statusCounts: Record<string, number> = {}
  for (const row of leadsByStatusResult.data ?? []) {
    const s = row.status as string
    statusCounts[s] = (statusCounts[s] ?? 0) + 1
  }
  const leadsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }))

  return NextResponse.json({
    betaSignups: betaSignupsResult.count ?? 0,
    leads: leadsResult.count ?? 0,
    callEvents: callEventsResult.count ?? 0,
    messages: messagesResult.count ?? 0,
    byTrade,
    last14Days,
    leadsByStatus,
  })
}
