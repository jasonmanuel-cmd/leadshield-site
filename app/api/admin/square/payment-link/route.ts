import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth, getAdmin } from '@/lib/supabase-admin'
import { createSquarePaymentLink } from '@/lib/square'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req.headers.get('authorization'))) return unauthorized()

  const supabase = getAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const paymentId = typeof body.payment_id === 'string' ? body.payment_id : ''
  if (!paymentId) {
    return NextResponse.json({ error: 'payment_id required' }, { status: 400 })
  }

  const { data: payment, error: paymentError } = await supabase
    .from('client_payments')
    .select('*, clients(business_name, email)')
    .eq('id', paymentId)
    .single()

  if (paymentError || !payment) {
    return NextResponse.json({ error: paymentError?.message || 'Payment not found' }, { status: 404 })
  }

  try {
    const businessName = payment.clients?.business_name || 'LeadShield customer'
    const email = payment.clients?.email || null
    const amount = Number(payment.amount)
    const link = await createSquarePaymentLink({
      amount,
      buyerEmail: email,
      name: `LeadShield - ${businessName}`,
      description: `LeadShield payment for ${businessName}`,
      redirectUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://leadshield.live',
    })

    const existingNotes = typeof payment.notes === 'string' && payment.notes.trim()
      ? `${payment.notes.trim()}\n`
      : ''
    const notes = `${existingNotes}Square checkout: ${link.url}`

    await supabase
      .from('client_payments')
      .update({
        payment_method: 'square',
        notes,
      })
      .eq('id', paymentId)

    return NextResponse.json({ payment_link: link })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create Square payment link'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
