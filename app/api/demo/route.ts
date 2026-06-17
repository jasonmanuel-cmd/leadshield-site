import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const telnyxKey = process.env.TELNYX_API_KEY
  const demoFromNumber = "+16615935773" // Our live tracking number

  if (!telnyxKey) {
    return NextResponse.json({ error: 'SMS service not configured.' }, { status: 500 })
  }

  try {
    const { phone } = await req.json()
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 })
    }

    // Clean phone number (strip non-digits, ensure +1)
    let cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length === 10) cleanPhone = '1' + cleanPhone
    if (!cleanPhone.startsWith('+')) cleanPhone = '+' + cleanPhone

    const smsContent = "🛡️ LeadShield Demo: This is the exact text your customers would receive within seconds of missing your call. It keeps them on the hook while you're busy! Reply YES to start your free trial."

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
      const error = await smsRes.json()
      console.error('Telnyx Demo SMS failed:', error)
      return NextResponse.json({ error: 'Failed to send demo SMS.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Demo API error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
