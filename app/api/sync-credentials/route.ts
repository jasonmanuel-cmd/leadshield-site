import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const OPERATOR_TIER_ID = 2
const TIER_IDS: Record<string, number> = {
  'pro': 1,
  'operator': 2,
  'voice': 4,
  'team': 5,
  'master': 3,
}

// Returns sync credentials only to authenticated Supabase users with OPERATOR tier or above.
// The sync token is served server-side and never exposed in client bundle.
export async function GET(_req: NextRequest) {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: 'Sync service is not configured on this server.' }, { status: 500 })
  }

  const supabase = createServerClient(
    supabaseUrl,
    anonKey,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  // Use service role client to fetch the user's sync token from customer_sync_tokens table
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Sync service is not configured on this server.' }, { status: 500 })
  }

  const serviceClient = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  // Fetch user's active sync token
  const { data: tokenData, error: tokenError } = await serviceClient
    .from('customer_sync_tokens')
    .select('sync_token, tier, is_active')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  // Check if user has a valid sync token and OPERATOR tier or above
  if (tokenError || !tokenData) {
    return NextResponse.json(
      { error: 'Sync not available for your tier. Upgrade to OPERATOR tier or above.' },
      { status: 403 }
    )
  }

  // Verify tier is OPERATOR or above
  const tierId = TIER_IDS[tokenData.tier] || 0
  if (tierId < OPERATOR_TIER_ID) {
    return NextResponse.json(
      { error: 'Sync not available for your tier. Upgrade to OPERATOR tier or above.' },
      { status: 403 }
    )
  }

  return NextResponse.json({
    syncUrl:   `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leadshield.live'}/api/sync`,
    syncToken: tokenData.sync_token,
    userId:    userId,
  })
}

