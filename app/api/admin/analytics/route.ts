import { NextRequest, NextResponse } from 'next/server'
import { getAdmin, checkAdminAuth } from '@/lib/supabase-admin'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req.headers.get('authorization'))) return unauthorized()

  const supabase = getAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Total clients
  const { count: totalClients } = await supabase
    .from('clients').select('*', { count: 'exact', head: true })

  // Active clients
  const { count: activeClients } = await supabase
    .from('clients').select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Total leads ever
  const { count: totalLeads } = await supabase
    .from('lead_logs').select('*', { count: 'exact', head: true })

  // Leads in last 30 days
  const { count: leads30d } = await supabase
    .from('lead_logs').select('*', { count: 'exact', head: true })
    .gte('timestamp', thirtyDaysAgo)

  // Leads today
  const { count: leadsToday } = await supabase
    .from('lead_logs').select('*', { count: 'exact', head: true })
    .gte('timestamp', startOfMonth)

  // Active tracking numbers
  const { count: activeNumbers } = await supabase
    .from('telephony_config').select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // SMS sent/failed stats (last 30 days)
  const { data: smsStats } = await supabase
    .from('lead_logs')
    .select('sms_sent_status')
    .gte('timestamp', thirtyDaysAgo)

  const smsSent = smsStats?.filter(r => r.sms_sent_status === 'sent' || r.sms_sent_status === 'dispatched').length ?? 0
  const smsFailed = smsStats?.filter(r => r.sms_sent_status === 'failed').length ?? 0

  // Revenue this month
  const { data: payments } = await supabase
    .from('client_payments')
    .select('amount')
    .eq('status', 'paid')
    .gte('paid_at', startOfMonth)

  const revenueThisMonth = payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0

  // Revenue all time
  const { data: allPaid } = await supabase
    .from('client_payments')
    .select('amount')
    .eq('status', 'paid')

  const revenueAllTime = allPaid?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0

  // Lead volume by day (last 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString()
  const { data: recentLeads } = await supabase
    .from('lead_logs')
    .select('timestamp, client_id')
    .gte('timestamp', sevenDaysAgo)
    .order('timestamp', { ascending: true })

  const leadsByDay: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    leadsByDay[d.toISOString().split('T')[0]] = 0
  }
  for (const lead of recentLeads ?? []) {
    const day = new Date(lead.timestamp).toISOString().split('T')[0]
    if (leadsByDay[day] !== undefined) leadsByDay[day]++
  }

  // Top clients by lead count
  const { data: topClients } = await supabase
    .from('clients')
    .select('id, business_name')
    .eq('status', 'active')

  const clientLeadCounts: Array<{ business_name: string; lead_count: number }> = []
  for (const client of topClients ?? []) {
    const { count } = await supabase
      .from('lead_logs')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client.id)
    clientLeadCounts.push({
      business_name: client.business_name,
      lead_count: count ?? 0,
    })
  }
  clientLeadCounts.sort((a, b) => b.lead_count - a.lead_count)

  // Status distribution
  const { data: statusRows } = await supabase
    .from('lead_logs')
    .select('status')

  const statusDist: Record<string, number> = {}
  for (const row of statusRows ?? []) {
    const s = row.status ?? 'new'
    statusDist[s] = (statusDist[s] ?? 0) + 1
  }

  return NextResponse.json({
    totalClients: totalClients ?? 0,
    activeClients: activeClients ?? 0,
    totalLeads: totalLeads ?? 0,
    leads30d: leads30d ?? 0,
    leadsToday: leadsToday ?? 0,
    activeNumbers: activeNumbers ?? 0,
    smsSent,
    smsFailed,
    revenueThisMonth,
    revenueAllTime,
    leadsByDay,
    topClients: clientLeadCounts.slice(0, 10),
    statusDistribution: statusDist,
  })
}
