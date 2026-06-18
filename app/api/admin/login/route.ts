import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const username = typeof body.username === 'string' ? body.username.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const expectedUsername = process.env.MASTER_ADMIN_USERNAME
  const expectedPassword = process.env.MASTER_ADMIN_PASSWORD
  const adminToken = process.env.MASTER_ADMIN_TOKEN

  if (!expectedUsername || !expectedPassword || !adminToken) {
    return NextResponse.json({ error: 'Admin login is not configured' }, { status: 500 })
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 })
  }

  return NextResponse.json({
    ok: true,
    token: adminToken,
    username,
  })
}
