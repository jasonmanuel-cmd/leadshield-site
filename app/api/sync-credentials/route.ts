import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Returns sync credentials only to authenticated Supabase users.
// The sync token is served server-side and never exposed in client bundle.
export async function GET(_req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    syncUrl:   `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leadshield.live'}/api/sync`,
    syncToken: process.env.LEADSHIELD_SYNC_TOKEN ?? '',
    userId:    session.user.id,
  })
}
