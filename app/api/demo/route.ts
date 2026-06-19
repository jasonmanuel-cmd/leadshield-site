import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function cleanHeaderValue(value: string) {
  return value.replace(/[^\x20-\x7E]/g, '').trim()
}

function normalizeUsPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

async function getDemoFromNumber() {
  if (process.env.TELNYX_DEMO_FROM_NUMBER) return process.env.TELNYX_DEMO_FROM_NUMBER
  if (!supabaseUrl || !supabaseKey) return '+16615935773'

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase
    .from('telephony_config')
    .select('provisioned_phone_number')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Demo sender lookup failed:', error.message)
  }

  return data?.provisioned_phone_number || '+16615935773'
}

export async function POST(req: NextRequest) {
  const telnyxKey = process.env.TELNYX_API_KEY ? cleanHeaderValue(process.env.TELNYX_API_KEY) : ''

  if (!telnyxKey) {
    console.error('Demo SMS is not configured: TELNYX_API_KEY is missing.')
    return NextResponse.json(
      { error: 'The text demo is temporarily unavailable. Please call or message us directly.' },
      { status: 503 },
    )
  }

  try {
    const body = await req.json()
    const { phone } = body

    if (typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json({ error: 'Enter a valid phone number.' }, { status: 400 })
    }

    const cleanPhone = normalizeUsPhone(phone)
    if (!cleanPhone) {
      return NextResponse.json({ error: 'Enter a 10-digit US phone number.' }, { status: 400 })
    }

    const demoFromNumber = await getDemoFromNumber()
    const smsContent = "LeadShield Demo: This is the text your customers would receive within seconds of a missed call. It keeps the lead warm while you're on the job. Reply YES to learn more."

    const smsRes = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: demoFromNumber,
        to: cleanPhone,
        text: smsContent,
      }),
    })

    if (!smsRes.ok) {
      const errorText = await smsRes.text()
      if (smsRes.status === 401) {
        console.warn('Telnyx demo SMS auth fallback.', {
          from: demoFromNumber,
          toSuffix: cleanPhone.slice(-4),
        })
        return NextResponse.json({
          ok: true,
          previewOnly: true,
          message: 'Demo preview ready. The live SMS provider needs a fresh Telnyx key before it can send texts.',
          smsPreview: smsContent,
        })
      }

      console.error('Telnyx demo SMS failed.', {
        status: smsRes.status,
        from: demoFromNumber,
        toSuffix: cleanPhone.slice(-4),
        error: errorText,
      })

      return NextResponse.json(
        { error: 'The text demo could not send to that number. Please try a mobile number or contact us directly.' },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Demo API error:', err)
    return NextResponse.json(
      { error: 'The text demo is temporarily unavailable. Please try again in a few minutes.' },
      { status: 500 },
    )
  }
}
