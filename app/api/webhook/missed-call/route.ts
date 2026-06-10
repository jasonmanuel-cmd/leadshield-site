import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null
  return createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Webhook service not configured.' }, { status: 500 })
  }

  let payload: Record<string, string>
  const contentType = req.headers.get('content-type') ?? ''

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text()
    const params = new URLSearchParams(text)
    payload = Object.fromEntries(params.entries())
  } else {
    payload = await req.json()
  }

  const callStatus = payload.CallStatus       // no-answer, busy, completed, answered
  const trackingNumber = payload.To            // number the customer dialed
  const customerNumber = payload.From          // the customer's number

  // Filter out answered/completed calls immediately — only act on missed
  if (callStatus === 'completed' || callStatus === 'answered') {
    return new NextResponse('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }

  try {
    // Step 1: Look up client by their provisioned tracking number
    const { data: config, error: configError } = await supabase
      .from('telephony_config')
      .select('client_id')
      .eq('provisioned_phone_number', trackingNumber)
      .single()

    if (configError || !config) {
      console.error('Telephony config lookup failed:', configError?.message)
      return NextResponse.json({ error: 'Client routing mapping not found.' }, { status: 404 })
    }

    const clientId = config.client_id

    // Step 2: Fetch the client's custom auto-reply template
    const { data: template, error: templateError } = await supabase
      .from('text_templates')
      .select('sms_body')
      .eq('client_id', clientId)
      .eq('trigger_event', 'no-answer')
      .single()

    const smsContent = templateError || !template
      ? "Hey! Sorry we missed your call. We'll get back to you shortly."
      : template.sms_body

    // Step 3: Log the lead in the CRM
    await supabase.from('lead_logs').insert({
      client_id: clientId,
      customer_phone: customerNumber,
      call_status: callStatus,
      sms_sent_status: 'dispatched',
      status: 'new',
      timestamp: new Date().toISOString(),
    })

    // Step 4: Return TwiML instructing the carrier to send the SMS
    const twiml = `<Response><Sms from="${trackingNumber}" to="${customerNumber}">${smsContent}</Sms></Response>`

    return new NextResponse(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Internal system architecture failure.' }, { status: 500 })
  }
}
