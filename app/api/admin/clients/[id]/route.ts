import { NextRequest, NextResponse } from 'next/server'
import { getAdmin, checkAdminAuth } from '@/lib/supabase-admin'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(req.headers.get('authorization'))) return unauthorized()

  const supabase = getAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const { id } = await params

  // Delete auth user first
  const { error: authError } = await supabase.auth.admin.deleteUser(id)
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  // Cascade will handle client record + related data
  return NextResponse.json({ ok: true })
}
