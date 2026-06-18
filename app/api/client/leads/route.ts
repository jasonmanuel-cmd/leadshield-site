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
        setAll(cookiesToSet, _headers) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
    },
  })
}

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createServerClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    cookies: { getAll() { return [] }, setAll(_cookies, _headers) {} },
  })
}

export async function GET() {
  const supabase = await getClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: client } = await getAdmin()
    .from('clients')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!client) {
    return NextResponse.json({ leads: [] })
  }

  const { data: leads, error } = await getAdmin()
    .from('lead_logs')
    .select('*')
    .eq('client_id', user.id)
    .order('timestamp', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ leads })
}

export async function PATCH(req: NextRequest) {
  const supabase = await getClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { id, status, contact_name, notes } = body as Record<string, string | undefined>

  if (id && status) {
    const now = new Date().toISOString()
    const updates: Record<string, unknown> = { status, updated_at: now }
    if (notes !== undefined) updates.notes = notes
    if (status === 'called_back') updates.called_back_at = now

    const { error } = await getAdmin()
      .from('lead_logs')
      .update(updates)
      .eq('id', id)
      .eq('client_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (id && notes !== undefined) {
    const { error } = await getAdmin()
      .from('lead_logs')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('client_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (id && contact_name !== undefined) {
    const { error } = await getAdmin()
      .from('lead_logs')
      .update({ contact_name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('client_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'id and status or contact_name required' }, { status: 400 })
}
