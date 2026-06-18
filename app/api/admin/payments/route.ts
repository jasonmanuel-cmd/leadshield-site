import { NextRequest, NextResponse } from 'next/server'
import { getAdmin, checkAdminAuth } from '@/lib/supabase-admin'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req.headers.get('authorization'))) return unauthorized()

  const supabase = getAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const { data: payments, error } = await supabase
    .from('client_payments')
    .select('*, clients(business_name, email)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ payments })
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req.headers.get('authorization'))) return unauthorized()

  const supabase = getAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const {
    client_id, amount, due_date, period_start, period_end,
    status, payment_method, notes,
  } = body as Record<string, string | undefined>

  if (!client_id || !amount) {
    return NextResponse.json({ error: 'client_id and amount required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('client_payments')
    .insert({
      client_id,
      amount: parseFloat(amount),
      status: status || 'unpaid',
      due_date: due_date || new Date().toISOString().split('T')[0],
      period_start: period_start || new Date().toISOString().split('T')[0],
      period_end: period_end || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      payment_method: payment_method || null,
      notes: notes || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ payment: data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  if (!checkAdminAuth(req.headers.get('authorization'))) return unauthorized()

  const supabase = getAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const id = typeof body.id === 'string' ? body.id : ''
  const status = typeof body.status === 'string' ? body.status : undefined
  const paymentMethod = typeof body.payment_method === 'string' ? body.payment_method : undefined
  const notes = typeof body.notes === 'string' ? body.notes : undefined

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (status) {
    updates.status = status
    if (status === 'paid') updates.paid_at = new Date().toISOString()
  }
  if (paymentMethod) updates.payment_method = paymentMethod
  if (notes !== undefined) updates.notes = notes

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { error } = await supabase
    .from('client_payments')
    .update(updates)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
