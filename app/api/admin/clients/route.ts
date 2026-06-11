import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function checkAuth(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  return token && token === process.env.MASTER_ADMIN_TOKEN
}

// GET /api/admin/clients — list all clients with lead counts & phone
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()

  const supabase = getAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const [clientsRes, leadsRes, configRes] = await Promise.all([
    supabase.from('clients').select('*').order('created_at', { ascending: false }),
    supabase.from('lead_logs').select('client_id, id'),
    supabase.from('telephony_config').select('*').eq('is_active', true),
  ])

  if (clientsRes.error) {
    return NextResponse.json({ error: clientsRes.error.message }, { status: 500 })
  }

  const leadCounts: Record<string, number> = {}
  for (const row of leadsRes.data ?? []) {
    leadCounts[row.client_id] = (leadCounts[row.client_id] ?? 0) + 1
  }

  const configByClient: Record<string, NonNullable<typeof configRes.data>> = {}
  for (const row of configRes.data ?? []) {
    if (!configByClient[row.client_id]) configByClient[row.client_id] = []
    configByClient[row.client_id]!.push(row)
  }

  const clients = (clientsRes.data ?? []).map((c) => ({
    ...c,
    lead_count: leadCounts[c.id] ?? 0,
    telephony: configByClient[c.id] ?? [],
  }))

  return NextResponse.json({ clients })
}

// POST /api/admin/clients — provision a new client business
// PATCH /api/admin/clients — update client (suspend/activate, change plan, mark payment)
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()

  const supabase = getAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { id, status, plan_tier, monthly_fee, payment_status } = body as Record<string, string | undefined>

  if (!id) {
    return NextResponse.json({ error: 'Client id required' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (plan_tier) updates.plan_tier = plan_tier
  if (monthly_fee) updates.monthly_fee = parseFloat(monthly_fee)
  if (payment_status) updates.payment_status = payment_status

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { error } = await supabase.from('clients').update(updates).eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()

  const supabase = getAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    business_name,
    owner_name,
    email,
    password,
    provisioned_phone_number,
    forwarding_phone_number,
    sms_template,
  } = body as Record<string, string | undefined>

  if (!business_name || !email || !password) {
    return NextResponse.json(
      { error: 'business_name, email, and password are required' },
      { status: 400 }
    )
  }

  // 1. Create Supabase Auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { business_name, owner_name: owner_name ?? null },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  const userId = authUser.user.id

  // 2. Insert client record (id = auth user id so RLS works)
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert({
      id: userId,
      business_name,
      owner_name: owner_name ?? null,
      email,
      status: 'active',
    })
    .select()
    .single()

  if (clientError) {
    // rollback: delete auth user
    await supabase.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: clientError.message }, { status: 500 })
  }

  // 3. Create telephony config (optional)
  if (provisioned_phone_number && forwarding_phone_number) {
    const { error: telError } = await supabase.from('telephony_config').insert({
      client_id: userId,
      provisioned_phone_number,
      forwarding_phone_number,
      is_active: true,
    })

    if (telError) {
      await supabase.from('clients').delete().eq('id', userId)
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: telError.message }, { status: 500 })
    }
  }

  // 4. Create default text template (optional)
  if (sms_template) {
    await supabase.from('text_templates').insert({
      client_id: userId,
      trigger_event: 'no-answer',
      sms_body: sms_template,
    })
  }

  return NextResponse.json({ client }, { status: 201 })
}
