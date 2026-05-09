'use client'

import { useState } from 'react'
import Link from 'next/link'

const REASONS = [
  'No longer using LeadShield',
  'I want my account and data removed',
  'Privacy concern',
  'Accidental signup',
  'Other',
]

type FormState = {
  fullName: string
  email: string
  phone: string
  accountId: string
  reason: string
  details: string
  website: string
  confirmDelete: boolean
}

const initialForm: FormState = {
  fullName: '',
  email: '',
  phone: '',
  accountId: '',
  reason: REASONS[0],
  details: '',
  website: '',
  confirmDelete: false,
}

export default function DeleteAccountPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const updateField = (key: keyof FormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = event.target instanceof HTMLInputElement && event.target.type === 'checkbox'
      ? event.target.checked
      : event.target.value

    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!form.confirmDelete) {
      setErrorMessage('Please confirm that you want to submit a deletion request.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const payload = await response.json()

      if (!response.ok) {
        setErrorMessage(payload.error || 'We could not submit your request.')
        setStatus('error')
        return
      }

      setStatus('success')
    } catch {
      setErrorMessage('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen px-4 py-12" style={{ background: '#050814' }}>
        <div className="pointer-events-none absolute inset-0" style={{
          background: 'radial-gradient(circle at top left, rgba(0,229,255,0.12), transparent 28%), radial-gradient(circle at bottom right, rgba(255,68,68,0.08), transparent 30%)',
        }} />
        <main className="relative mx-auto max-w-2xl pt-8">
          <div className="rounded-[28px] p-6 md:p-8 glass-panel surface-glow" style={{ background: 'rgba(7,10,18,0.86)' }}>
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: '#FF6666' }}>
              Request Received
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3" style={{ color: '#F5F7FA' }}>
              Your deletion request is in queue.
            </h1>
            <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: '#A6AEC1' }}>
              We&apos;ve received your request and will review it for account verification. You should
              get a confirmation email within 3 business days.
            </p>

            <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.18)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#FF6666' }}>What happens next</p>
              <p className="text-sm leading-relaxed" style={{ color: '#C8D1E0' }}>
                If the account matches our records, we will delete the LeadShield account and
                associated cloud-synced CRM data that can be removed under our retention policy.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/privacy"
                className="flex-1 text-center rounded-xl px-4 py-3 text-sm font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#E8EAF0', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                View Privacy Policy
              </Link>
              <a
                href="mailto:privacy@coaibakersfield.com"
                className="flex-1 text-center rounded-xl px-4 py-3 text-sm font-semibold transition-all"
                style={{ background: 'linear-gradient(135deg, #00E5FF 0%, #0070FF 100%)', color: '#fff' }}
              >
                Email Privacy Team
              </a>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const inputBase = 'w-full rounded-xl px-4 py-3 text-sm outline-none transition-all'
  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#E8EAF0' }
  const focusStyle = { borderColor: 'rgba(0,229,255,0.5)', background: 'rgba(255,255,255,0.07)' }
  const blurStyle = { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }

  return (
    <div className="min-h-screen px-4 py-10 md:py-14" style={{ background: '#050814' }}>
      <div className="pointer-events-none absolute inset-0" style={{
        background: 'radial-gradient(circle at top left, rgba(0,229,255,0.12), transparent 28%), radial-gradient(circle at bottom right, rgba(255,68,68,0.08), transparent 30%)',
      }} />

      <main className="relative mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: '#FF6666' }}>
            Delete Account
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4" style={{ color: '#F5F7FA' }}>
            Request account deletion
          </h1>
          <p className="max-w-2xl text-sm md:text-base leading-relaxed" style={{ color: '#A6AEC1' }}>
            Use this form to request deletion of your LeadShield account. We will verify the request,
            process it as quickly as possible, and email you when it is complete.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <form onSubmit={handleSubmit} className="rounded-[28px] p-5 md:p-7 glass-panel surface-glow" style={{ background: 'rgba(7,10,18,0.88)' }}>
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name *">
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={updateField('fullName')}
                    placeholder="Jordan Smith"
                    className={inputBase}
                    style={inputStyle}
                    onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                    onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                  />
                </Field>

                <Field label="Email Address *">
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={updateField('email')}
                    placeholder="jordan@example.com"
                    className={inputBase}
                    style={inputStyle}
                    onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                    onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone Number">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={updateField('phone')}
                    placeholder="(661) 555-0100"
                    className={inputBase}
                    style={inputStyle}
                    onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                    onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                  />
                </Field>

                <Field label="Account / User ID">
                  <input
                    type="text"
                    value={form.accountId}
                    onChange={updateField('accountId')}
                    placeholder="Optional"
                    className={inputBase}
                    style={inputStyle}
                    onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                    onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                  />
                </Field>
              </div>

              <Field label="Reason for Request *">
                <select
                  value={form.reason}
                  onChange={updateField('reason')}
                  className={inputBase}
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                >
                  {REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Additional Details">
                <textarea
                  rows={4}
                  value={form.details}
                  onChange={updateField('details')}
                  placeholder="Share anything that will help us verify the request."
                  className={`${inputBase} resize-none`}
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                />
              </Field>

              <div className="hidden" aria-hidden="true">
                <label>
                  Website
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={updateField('website')}
                  />
                </label>
              </div>

              <label className="flex items-start gap-3 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <input
                  type="checkbox"
                  checked={form.confirmDelete}
                  onChange={updateField('confirmDelete')}
                  className="mt-1 h-4 w-4 rounded border-gray-500"
                />
                <span className="text-sm leading-relaxed" style={{ color: '#C8D1E0' }}>
                  I understand this is a deletion request and not an immediate deletion. I want LeadShield to remove my account after verification.
                </span>
              </label>

              {status === 'error' && (
                <p className="text-sm font-medium" style={{ color: '#FF6666' }}>
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-2xl px-5 py-4 text-base font-bold transition-all disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  background: status === 'loading' ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #FF6666 0%, #C62828 100%)',
                  color: '#fff',
                  boxShadow: status === 'loading' ? 'none' : '0 0 28px rgba(255,68,68,0.24)',
                }}
              >
                {status === 'loading' ? 'Submitting request...' : 'Request Account Deletion'}
              </button>
            </div>
          </form>

          <aside className="rounded-[28px] p-5 md:p-7 glass-panel" style={{ background: 'rgba(7,10,18,0.76)' }}>
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#00E5FF' }}>
              Before You Submit
            </p>

            <div className="space-y-4 text-sm leading-relaxed" style={{ color: '#A6AEC1' }}>
              <p>
                Account deletion removes your LeadShield account and the cloud-synced CRM data that can be deleted under our retention policy.
              </p>
              <p>
                Some records may be retained where required for billing, fraud prevention, or legal obligations.
              </p>
              <p>
                If you need help first, email <a href="mailto:privacy@coaibakersfield.com" className="underline" style={{ color: '#00E5FF' }}>privacy@coaibakersfield.com</a>.
              </p>
            </div>

            <div className="mt-6 rounded-2xl p-4" style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.18)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#00E5FF' }}>Expected turnaround</p>
              <p className="text-sm leading-relaxed" style={{ color: '#C8D1E0' }}>
                We typically confirm deletion requests within 3 business days.
              </p>
            </div>

            <div className="mt-4 rounded-2xl p-4" style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.18)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#FFD700' }}>Need a copy of your policy?</p>
              <Link href="/privacy" className="text-sm underline" style={{ color: '#E8EAF0' }}>
                Open the privacy policy
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest mb-2" style={{ color: '#8892A4' }}>
        {label}
      </span>
      {children}
    </label>
  )
}