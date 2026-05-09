import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder')

const NOTIFY_EMAILS = [
  'privacy@coaibakersfield.com',
  'support@coaibakersfield.com',
]

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 3

const requestBuckets = new Map<string, { count: number; resetAt: number }>()

type DeleteAccountRequest = {
  fullName?: string
  email?: string
  phone?: string
  accountId?: string
  reason?: string
  details?: string
  website?: string
  confirmDelete?: boolean
}

export async function POST(req: NextRequest) {
  try {
    const clientKey = getClientKey(req)
    if (isRateLimited(clientKey)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const body = (await req.json()) as DeleteAccountRequest
    const fullName = normalizeString(body.fullName)
    const email = normalizeEmail(body.email)
    const phone = normalizeString(body.phone)
    const accountId = normalizeString(body.accountId)
    const reason = normalizeString(body.reason)
    const details = normalizeString(body.details)
    const website = normalizeString(body.website)

    if (website) {
      return NextResponse.json({ success: true })
    }

    if (!fullName || !email || !reason) {
      return NextResponse.json({ error: 'Full name, email, and reason are required.' }, { status: 400 })
    }

    if (!body.confirmDelete) {
      return NextResponse.json({ error: 'Please confirm the deletion request.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const submittedAt = new Date().toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      dateStyle: 'full',
      timeStyle: 'short',
    })

    const summaryRows: Array<[string, string]> = [
      ['Name', fullName],
      ['Email', email],
      ['Phone', phone || 'Not provided'],
      ['Account / User ID', accountId || 'Not provided'],
      ['Reason', reason],
      ['Details', details || 'No additional details provided'],
      ['Submitted', `${submittedAt} PT`],
    ]

    const staffEmailResult = await resend.emails.send({
      from: 'LeadShield Privacy <onboarding@resend.dev>',
      to: NOTIFY_EMAILS,
      subject: `Account deletion request: ${fullName}`,
      html: renderHtml('New Delete Account Request', summaryRows),
    })

    if (!staffEmailResult.data?.id) {
      return NextResponse.json({ error: 'We could not submit your request.' }, { status: 500 })
    }

    try {
      await resend.emails.send({
        from: 'LeadShield <onboarding@resend.dev>',
        to: [email],
        subject: 'We received your LeadShield account deletion request',
        html: renderConfirmation(fullName),
      })
    } catch (confirmationError) {
      console.error('Delete account confirmation email error:', confirmationError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete account request error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

function renderHtml(title: string, rows: Array<[string, string]>) {
  const bodyRows = rows
    .map(([label, value]) => `<tr><td class="label">${escapeHtml(label)}</td><td class="value">${escapeHtml(value)}</td></tr>`)
    .join('')

  return `
<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  body{margin:0;padding:0;background:#080C1E;font-family:Arial,sans-serif;color:#fff}
  .wrap{max-width:640px;margin:0 auto;padding:28px}
  .hdr{background:linear-gradient(135deg,#FF6666,#C62828);padding:24px 28px;border-radius:10px 10px 0 0;text-align:center}
  .hdr h1{margin:0;font-size:26px;color:#fff}
  .hdr p{margin:6px 0 0;color:#FFD7D7;font-size:13px}
  .bdy{background:#0D1230;padding:28px;border-radius:0 0 10px 10px;border:1px solid #1A2550;border-top:none}
  table{width:100%;border-collapse:collapse}
  .label{width:180px;padding:10px 12px 10px 0;color:#8899AA;font-size:12px;text-transform:uppercase;letter-spacing:1px;vertical-align:top}
  .value{padding:10px 0;color:#fff;font-size:15px;font-weight:bold;white-space:pre-wrap}
  .foot{text-align:center;margin-top:22px;color:#8899AA;font-size:11px}
  p{color:#C0CCE0;line-height:1.7;margin:12px 0}
</style></head><body>
<div class="wrap">
  <div class="hdr"><h1>${escapeHtml(title)}</h1><p>LeadShield account deletion queue</p></div>
  <div class="bdy">
    <p>A user submitted a request to delete their LeadShield account. Review the details below and process the request after verifying ownership.</p>
    <table>${bodyRows}</table>
  </div>
  <div class="foot">LeadShield &nbsp;·&nbsp; Chaotically Organized AI</div>
</div>
</body></html>`
}

function renderConfirmation(fullName: string) {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  body{margin:0;padding:0;background:#080C1E;font-family:Arial,sans-serif;color:#fff}
  .wrap{max-width:580px;margin:0 auto;padding:28px}
  .hdr{background:linear-gradient(135deg,#00E5FF,#0070FF);padding:32px 28px;border-radius:10px 10px 0 0;text-align:center}
  .hdr h1{margin:0;font-size:30px;color:#fff}
  .bdy{background:#0D1230;padding:32px;border-radius:0 0 10px 10px;border:1px solid #1A2550;border-top:none}
  .gold{color:#00E5FF;font-weight:bold}
  p{color:#C0CCE0;line-height:1.75;margin:12px 0}
  .foot{text-align:center;margin-top:26px;color:#8899AA;font-size:11px}
</style></head><body>
<div class="wrap">
  <div class="hdr"><h1>Request Received</h1></div>
  <div class="bdy">
    <p>Hey <span class="gold">${escapeHtml(fullName)}</span>,</p>
    <p>We received your LeadShield account deletion request and sent it to our privacy team for verification. If the request matches our records, we will proceed with deletion and confirm by email.</p>
    <p>If you need to add anything to your request, reply to this email or contact <span class="gold">privacy@coaibakersfield.com</span>.</p>
  </div>
  <div class="foot">LeadShield &nbsp;·&nbsp; Chaotically Organized AI</div>
</div>
</body></html>`
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeEmail(value: unknown): string {
  return normalizeString(value).toLowerCase()
}

function getClientKey(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim() || 'unknown'
  }

  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

function isRateLimited(clientKey: string): boolean {
  const now = Date.now()
  const bucket = requestBuckets.get(clientKey)

  if (!bucket || bucket.resetAt <= now) {
    requestBuckets.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  bucket.count += 1
  return bucket.count > RATE_LIMIT_MAX_REQUESTS
}