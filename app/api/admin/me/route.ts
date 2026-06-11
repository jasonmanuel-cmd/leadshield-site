import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options as any))
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = getAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Server config error' }, { status: 500 })
  }

  const { data: client } = await admin
    .from('clients')
    .select('id, role, business_name, email, plan_tier, monthly_fee, payment_status, status, created_at')
    .eq('id', user.id)
    .maybeSingle()

  if (!client) {
    return NextResponse.json({ role: 'client', client: null })
  }

  return NextResponse.json({
    role: client.role,
    client,
  })
}
