import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function cleanHeaderValue(value: string) {
  return value.replace(/[^\x20-\x7E]/g, '').trim()
}

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null
  return createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function parsePayload(body: any) {
  // Telnyx format: { data: { event_type, payload: { from, to, hangup_cause, ... } } }
  if (body?.data?.event_type && body?.data?.payload) {
    const p = body.data.payload
    const isMissed = body.data.event_type === 'call.hangup' && p.hangup_cause === 'NO_ANSWER'
    return { from: p.from, to: p.to, isMissed, source: 'telnyx' as const }
  }
  // Twilio format: { CallStatus, From, To }
  const callStatus = (body.CallStatus || '').toLowerCase()
  const isMissed = callStatus !== 'completed' && callStatus !== 'answered'
  return { from: body.From, to: body.To, isMissed, source: 'twilio' as const }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Webhook service not configured.' }, { status: 500 })
  }

  let raw: any
  const contentType = req.headers.get('content-type') ?? ''
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text()
    const params = new URLSearchParams(text)
    raw = Object.fromEntries(params.entries())
  } else {
    raw = await req.json()
  }

  const { from: customerNumber, to: trackingNumber, isMissed, source } = parsePayload(raw)

  if (!isMissed || !customerNumber || !trackingNumber) {
    return new NextResponse('OK', { status: 200 })
  }

  try {
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

    const { data: template } = await supabase
      .from('text_templates')
      .select('sms_body')
      .eq('client_id', clientId)
      .eq('trigger_event', 'no-answer')
      .single()

    const smsContent = !template
      ? "Hey! Sorry we missed your call. We'll get back to you shortly."
      : template.sms_body

    // Send SMS via Telnyx API (if configured)
    const telnyxKey = process.env.TELNYX_API_KEY ? cleanHeaderValue(process.env.TELNYX_API_KEY) : ''
    if (telnyxKey) {
      const smsRes = await fetch('https://api.telnyx.com/v2/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${telnyxKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: trackingNumber,
          to: customerNumber,
          text: smsContent,
        }),
      })
      const smsResult = await smsRes.json()
      await supabase.from('lead_logs').insert({
        client_id: clientId,
        customer_phone: customerNumber,
        call_status: 'no-answer',
        sms_sent_status: smsRes.ok ? 'sent' : 'failed',
        status: 'new',
        timestamp: new Date().toISOString(),
      })
      if (!smsRes.ok) {
        console.error('Telnyx SMS failed:', JSON.stringify(smsResult))
      }
    } else {
      // No Telnyx key — log the lead but don't send SMS
      await supabase.from('lead_logs').insert({
        client_id: clientId,
        customer_phone: customerNumber,
        call_status: 'no-answer',
        sms_sent_status: 'dispatched',
        status: 'new',
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 })
  }
}
