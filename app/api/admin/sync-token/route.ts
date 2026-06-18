import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/supabase-admin'
import {
  generateSyncTokenForCustomer,
  getSyncTokenForCustomer,
  revokeSyncTokenForCustomer,
} from '@/lib/sync-token-manager'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req.headers.get('authorization'))) return unauthorized()

  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  }

  const syncToken = await getSyncTokenForCustomer(userId)
  return NextResponse.json({ sync_token: syncToken })
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req.headers.get('authorization'))) return unauthorized()

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const userId = typeof body.user_id === 'string' ? body.user_id.trim() : ''
  const tier = typeof body.tier === 'string' ? body.tier.trim() : 'operator'
  const deviceId = typeof body.device_id === 'string' ? body.device_id.trim() : undefined
  const validTiers = new Set(['pro', 'operator', 'voice', 'team', 'master'])

  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  }

  if (!validTiers.has(tier)) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  }

  try {
    const syncToken = await generateSyncTokenForCustomer(
      userId,
      tier as 'pro' | 'operator' | 'voice' | 'team' | 'master',
      deviceId
    )
    return NextResponse.json({ sync_token: syncToken }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate sync token'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAdminAuth(req.headers.get('authorization'))) return unauthorized()

  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  }

  try {
    await revokeSyncTokenForCustomer(userId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to revoke sync token'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
