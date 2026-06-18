import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth, getAdmin } from '@/lib/supabase-admin'
import { isSquareConfigured } from '@/lib/square'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req.headers.get('authorization'))) return unauthorized()

  const supabase = getAdmin()
  const supabaseConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  let supabaseHealthy = false
  if (supabase) {
    const { error } = await supabase.from('clients').select('id', { count: 'exact', head: true })
    supabaseHealthy = !error
  }

  const squareConfigured = isSquareConfigured()

  return NextResponse.json({
    github: {
      connected: true,
      repo: 'jasonmanuel-cmd/leadshield-site',
    },
    supabase: {
      configured: supabaseConfigured,
      healthy: supabaseHealthy,
    },
    telnyx: {
      configured: !!process.env.TELNYX_API_KEY,
    },
    square: {
      configured: squareConfigured,
      environment: process.env.SQUARE_ENVIRONMENT || null,
      missing: [
        !process.env.SQUARE_ACCESS_TOKEN ? 'SQUARE_ACCESS_TOKEN' : null,
        !process.env.SQUARE_LOCATION_ID ? 'SQUARE_LOCATION_ID' : null,
      ].filter(Boolean),
    },
    admin: {
      usernameConfigured: !!process.env.MASTER_ADMIN_USERNAME,
      passwordConfigured: !!process.env.MASTER_ADMIN_PASSWORD,
      tokenConfigured: !!process.env.MASTER_ADMIN_TOKEN,
    },
  })
}
