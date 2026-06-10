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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await getClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { id } = await params
  const { data: lead, error } = await getAdmin()
    .from('lead_logs')
    .select('*')
    .eq('id', id)
    .eq('client_id', user.id)
    .single()

  if (error || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  return NextResponse.json({ lead })
}
