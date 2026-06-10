import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const cookieStore = await cookies()
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll() {},
    },
  })
}

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createServerClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    cookies: { getAll() { return [] }, setAll() {} },
  })
}

export async function GET() {
  const supabase = await getClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = getAdmin()

  const [clientRes, configRes, templateRes] = await Promise.all([
    admin.from('clients').select('*').eq('id', user.id).maybeSingle(),
    admin.from('telephony_config').select('*').eq('client_id', user.id).maybeSingle(),
    admin.from('text_templates').select('*').eq('client_id', user.id).maybeSingle(),
  ])

  return NextResponse.json({
    client: clientRes.data ?? null,
    telephony: configRes.data ?? null,
    template: templateRes.data ?? null,
  })
}

export async function PUT(req: NextRequest) {
  const supabase = await getClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const sms_body = body.sms_body as string | undefined
  if (!sms_body) {
    return NextResponse.json({ error: 'sms_body is required' }, { status: 400 })
  }

  const admin = getAdmin()

  const { data: existing } = await admin
    .from('text_templates')
    .select('id')
    .eq('client_id', user.id)
    .eq('trigger_event', 'no-answer')
    .maybeSingle()

  let error
  if (existing) {
    const result = await admin
      .from('text_templates')
      .update({ sms_body, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    error = result.error
  } else {
    const result = await admin.from('text_templates').insert({
      client_id: user.id,
      trigger_event: 'no-answer',
      sms_body,
    })
    error = result.error
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
