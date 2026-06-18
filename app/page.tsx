'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'

const C = {
  bg: '#050814',
  ink: '#F5F7FA',
  text: '#E8EAF0',
  muted: '#A6AEC1',
  quiet: '#6F7A8F',
  cyan: '#00E5FF',
  blue: '#1677FF',
  green: '#00FF88',
  gold: '#FFD166',
  red: '#FF6B6B',
  panel: 'rgba(255,255,255,0.045)',
  border: 'rgba(255,255,255,0.09)',
}

const FEATURES = [
  {
    title: 'Instant Missed-Call Save',
    desc: 'A hot buyer gets a text before they start dialing the next contractor.',
    stat: '< 10 sec',
    accent: C.cyan,
  },
  {
    title: 'Lead Command Center',
    desc: 'Every caller moves through New, Called Back, Quoted, Booked, or Lost.',
    stat: '5 stages',
    accent: C.green,
  },
  {
    title: 'Commercial Packet Builder',
    desc: 'Track W-9s, COIs, licenses, bonds, and safety docs for larger buyer accounts.',
    stat: 'Pro',
    accent: C.gold,
  },
]

const PROOF = [
  'Built for contractors, cleaners, junk removal, landscapers, and local service teams.',
  'No app install. Your team works from any browser.',
  'Setup handled for you, including your first template and pipeline.',
  'Designed around paid leads, missed calls, follow-up, and commercial onboarding.',
]

const PRICING = [
  {
    tier: 'Starter',
    outcome: 'Stop losing missed calls',
    price: '39',
    setup: '350',
    accent: C.cyan,
    features: ['1 tracking number', 'Instant missed-call text-back', 'Lead dashboard', 'Status pipeline', 'Contact notes'],
  },
  {
    tier: 'Growth',
    outcome: 'Track and close more jobs',
    price: '69',
    setup: '350',
    accent: C.green,
    popular: true,
    features: ['Everything in Starter', '2+ tracking numbers', 'Custom SMS templates', 'Pipeline overview', 'Credential packet builder'],
  },
  {
    tier: 'Commercial',
    outcome: 'Win larger buyer accounts',
    price: '119',
    setup: '500',
    accent: C.gold,
    features: ['Everything in Growth', 'Commercial credential packets', 'Renewal risk tracking', 'Multi-client workspace', 'Priority setup support'],
  },
]

const FAQS = [
  {
    q: 'Why does missed-call speed matter so much?',
    a: 'A missed call is usually an active buyer. If they do not hear back quickly, many will call the next contractor on the list. LeadShield answers instantly and keeps the lead organized.',
  },
  {
    q: 'Is this just another CRM?',
    a: 'No. LeadShield is built around contractor revenue moments: missed calls, follow-up, job status, and commercial vendor paperwork.',
  },
  {
    q: 'Do customers need to install anything?',
    a: 'No. The dashboard is web-based. Your missed-call response and lead tracking are set up for you.',
  },
  {
    q: 'What is the credential packet builder?',
    a: 'It helps service businesses track insurance, W-9, license, bond, and safety documents needed to win commercial accounts.',
  },
]

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function DemoForm() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')
    setMessage('')
    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok) {
        setStatus('success')
      } else {
        setMessage(data?.error || 'The text demo is temporarily unavailable. Please try again.')
        setStatus('error')
      }
    } catch {
      setMessage('The text demo is temporarily unavailable. Please try again.')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <input
        type="tel"
        placeholder="Enter your phone number"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full rounded-xl px-5 py-4 text-base outline-none"
        style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, color: C.ink }}
      />
      <button
        disabled={loading || status === 'success'}
        className="rounded-xl px-5 py-4 text-base font-black disabled:opacity-60"
        style={{ background: status === 'success' ? C.green : `linear-gradient(135deg,${C.cyan},${C.blue})`, color: C.bg }}
      >
        {loading ? 'Sending test message...' : status === 'success' ? 'SMS sent. Check your phone.' : 'Send me the missed-call text'}
      </button>
      {status === 'error' && <p className="text-sm font-semibold text-red-300">{message}</p>}
    </form>
  )
}

function RevenueCalculator() {
  const [missedCalls, setMissedCalls] = useState(8)
  const [jobValue, setJobValue] = useState(450)
  const [closeRate, setCloseRate] = useState(35)

  const leak = useMemo(() => {
    const weekly = missedCalls * jobValue * (closeRate / 100)
    return {
      weekly,
      monthly: weekly * 4.33,
      yearly: weekly * 52,
    }
  }, [missedCalls, jobValue, closeRate])

  return (
    <section id="calculator" className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] md:px-16">
      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.22em]" style={{ color: C.gold }}>Lost Revenue Calculator</p>
        <h2 className="font-display text-4xl font-bold leading-tight md:text-5xl" style={{ color: C.ink }}>
          See what slow callbacks may be costing you.
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed" style={{ color: C.muted }}>
          This is the number contractors feel immediately: paid leads that already had buying intent but cooled off before anyone replied.
        </p>
      </div>
      <div className="rounded-[28px] p-6" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
        <div className="grid gap-5">
          <Slider label="Missed calls per week" value={missedCalls} min={1} max={40} onChange={setMissedCalls} suffix="calls" />
          <Slider label="Average job value" value={jobValue} min={100} max={2500} step={50} onChange={setJobValue} prefix="$" />
          <Slider label="Realistic close rate" value={closeRate} min={10} max={80} onChange={setCloseRate} suffix="%" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <CalcCard label="Weekly leak" value={money.format(leak.weekly)} />
          <CalcCard label="Monthly leak" value={money.format(leak.monthly)} featured />
          <CalcCard label="Yearly leak" value={money.format(leak.yearly)} />
        </div>
        <Link href="#demo" className="mt-5 inline-flex w-full justify-center rounded-xl px-5 py-4 text-sm font-black"
          style={{ background: `linear-gradient(135deg,${C.gold},${C.green})`, color: C.bg }}>
          Protect those leads
        </Link>
      </div>
    </section>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  prefix = '',
  suffix = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  prefix?: string
  suffix?: string
  onChange: (value: number) => void
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center justify-between gap-4 text-sm font-bold" style={{ color: C.text }}>
        {label}
        <b style={{ color: C.cyan }}>{prefix}{value}{suffix}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-300"
      />
    </label>
  )
}

function CalcCard({ label, value, featured }: { label: string; value: string; featured?: boolean }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: featured ? 'rgba(255,209,102,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${featured ? 'rgba(255,209,102,0.25)' : C.border}` }}>
      <p className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: C.quiet }}>{label}</p>
      <strong className="mt-2 block font-display text-2xl" style={{ color: featured ? C.gold : C.ink }}>{value}</strong>
    </div>
  )
}

function ProductPreview() {
  const rows = [
    ['Maria G.', 'Missed call', 'Auto-text sent', C.green],
    ['Ridge HOA', 'Quoted', 'Credential packet open', C.gold],
    ['Bakersfield Plaza', 'Booked', 'Commercial cleanout', C.cyan],
  ]

  return (
    <div className="relative rounded-[30px] p-4 shadow-2xl" style={{ background: 'rgba(4,8,18,0.92)', border: `1px solid ${C.border}` }}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: C.quiet }}>Live Lead Board</p>
          <h3 className="font-display text-2xl font-bold" style={{ color: C.ink }}>$8,450 protected this month</h3>
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: 'rgba(0,255,136,0.12)', color: C.green, border: '1px solid rgba(0,255,136,0.24)' }}>
          94% reply speed
        </span>
      </div>
      <div className="grid gap-3">
        {rows.map(([name, stage, note, color]) => (
          <div key={name} className="grid grid-cols-[1fr_auto] gap-3 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}` }}>
            <div>
              <strong style={{ color: C.ink }}>{name}</strong>
              <p className="mt-1 text-sm" style={{ color: C.muted }}>{note}</p>
            </div>
            <span className="h-fit rounded-full px-3 py-1 text-xs font-black" style={{ color: color as string, background: `${color}18`, border: `1px solid ${color}33` }}>
              {stage}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          ['New', '11'],
          ['Quoted', '7'],
          ['Booked', '5'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <b className="block font-display text-2xl" style={{ color: C.ink }}>{value}</b>
            <span className="text-xs" style={{ color: C.quiet }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LogoMark({ size = 42 }: { size?: number }) {
  return <Image src="/leadshield-mark.svg" alt="" width={size} height={size} priority />
}

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: C.bg, color: C.text }}>
      <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-4 md:px-16"
        style={{ background: 'rgba(5,8,20,0.86)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${C.border}` }}>
        <Link href="/" className="flex items-center gap-3">
          <LogoMark />
          <span className="font-display text-xl font-black tracking-tight" style={{ color: C.ink }}>LeadShield</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-bold md:flex" style={{ color: C.muted }}>
          <a href="#calculator">Calculator</a>
          <a href="#system">System</a>
          <a href="#pricing">Pricing</a>
          <a href="#demo">Demo</a>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/signon" className="rounded-xl px-4 py-2 text-sm font-bold" style={{ color: C.muted }}>Sign In</Link>
          <Link href="/admin" className="rounded-xl px-4 py-2 text-sm font-black" style={{ background: C.ink, color: C.bg }}>Admin</Link>
        </div>
      </nav>

      <header className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-16 pt-16 md:px-16 lg:grid-cols-[1fr_0.86fr] lg:items-center">
        <div className="absolute inset-0 -z-10 opacity-80" style={{ background: 'radial-gradient(circle at 15% 10%, rgba(0,229,255,0.13), transparent 28%), radial-gradient(circle at 80% 12%, rgba(0,255,136,0.09), transparent 24%), radial-gradient(circle at 50% 80%, rgba(255,209,102,0.07), transparent 30%)' }} />
        <section>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em]"
            style={{ background: 'rgba(0,229,255,0.08)', color: C.cyan, border: '1px solid rgba(0,229,255,0.22)' }}>
            Built for contractors who cannot answer every call
          </div>
          <h1 className="font-display text-5xl font-black leading-[0.98] tracking-tight md:text-7xl">
            Turn missed calls into booked jobs before your competitor calls them back.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed md:text-xl" style={{ color: C.muted }}>
            You paid for the lead. LeadShield replies instantly, logs the caller, moves the job through your pipeline, and helps you package credentials for bigger commercial buyers.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="#calculator" className="rounded-xl px-8 py-4 text-center text-base font-black" style={{ background: `linear-gradient(135deg,${C.cyan},${C.blue})`, color: C.bg }}>
              Calculate my lead leak
            </Link>
            <Link href="#demo" className="rounded-xl px-8 py-4 text-center text-base font-black" style={{ border: `1px solid ${C.border}`, color: C.ink }}>
              Send test auto-reply
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              ['Fast', 'instant response'],
              ['Simple', 'browser dashboard'],
              ['Revenue', 'built around jobs'],
            ].map(([top, bottom]) => (
              <div key={top} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.035)', border: `1px solid ${C.border}` }}>
                <b className="block font-display text-xl" style={{ color: C.gold }}>{top}</b>
                <span className="text-xs" style={{ color: C.quiet }}>{bottom}</span>
              </div>
            ))}
          </div>
        </section>
        <ProductPreview />
      </header>

      <RevenueCalculator />

      <section id="system" className="mx-auto max-w-7xl px-6 py-20 md:px-16">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em]" style={{ color: C.green }}>The Revenue System</p>
          <h2 className="font-display text-4xl font-bold md:text-5xl" style={{ color: C.ink }}>
            Three tools that protect the whole customer path.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="rounded-[28px] p-7" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
              <span className="mb-8 inline-flex rounded-full px-3 py-1 text-xs font-black" style={{ color: feature.accent, background: `${feature.accent}14`, border: `1px solid ${feature.accent}33` }}>
                {feature.stat}
              </span>
              <h3 className="font-display text-2xl font-bold" style={{ color: C.ink }}>{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: C.muted }}>{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-16">
        <div className="grid grid-cols-1 gap-6 rounded-[32px] p-7 md:grid-cols-[0.8fr_1.2fr] md:p-10"
          style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.07), rgba(0,255,136,0.04))', border: '1px solid rgba(0,229,255,0.18)' }}>
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.22em]" style={{ color: C.cyan }}>Trust Proof</p>
            <h2 className="font-display text-3xl font-bold" style={{ color: C.ink }}>No vague software promise. Operational proof buyers understand.</h2>
          </div>
          <div className="grid gap-3">
            {PROOF.map((item) => (
              <div key={item} className="rounded-2xl p-4 text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.045)', border: `1px solid ${C.border}`, color: C.text }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 md:px-16">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em]" style={{ color: C.gold }}>Pricing</p>
          <h2 className="font-display text-4xl font-bold" style={{ color: C.ink }}>Choose the outcome you want.</h2>
          <p className="mt-3 text-sm" style={{ color: C.muted }}>Setup is done for you. No long-term contract required.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {PRICING.map((plan) => (
            <article key={plan.tier} className="relative rounded-[28px] p-7" style={{ background: plan.popular ? 'linear-gradient(135deg, rgba(0,255,136,0.09), rgba(255,209,102,0.06))' : C.panel, border: `1px solid ${plan.popular ? 'rgba(0,255,136,0.25)' : C.border}` }}>
              {plan.popular && <span className="absolute -top-3 left-7 rounded-full px-4 py-1 text-xs font-black" style={{ background: C.green, color: C.bg }}>Best first move</span>}
              <p className="text-xs font-black uppercase tracking-[0.16em]" style={{ color: plan.accent }}>{plan.tier}</p>
              <h3 className="mt-2 font-display text-2xl font-bold" style={{ color: C.ink }}>{plan.outcome}</h3>
              <div className="mt-5">
                <span className="font-display text-5xl font-black" style={{ color: C.ink }}>${plan.price}</span>
                <span style={{ color: C.muted }}>/mo</span>
              </div>
              <p className="mt-1 text-sm" style={{ color: C.muted }}>+ ${plan.setup} setup</p>
              <ul className="mt-6 grid gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm" style={{ color: C.text }}>
                    <span style={{ color: C.green }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="#demo" className="mt-7 inline-flex w-full justify-center rounded-xl px-5 py-3 text-sm font-black" style={{ background: plan.popular ? `linear-gradient(135deg,${C.green},${C.gold})` : 'rgba(255,255,255,0.07)', color: plan.popular ? C.bg : C.ink, border: plan.popular ? 'none' : `1px solid ${C.border}` }}>
                Start here
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="demo" className="mx-auto max-w-5xl px-6 py-20 text-center md:px-16">
        <div className="rounded-[34px] p-8 md:p-14" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}` }}>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em]" style={{ color: C.green }}>Instant Demo</p>
          <h2 className="font-display text-4xl font-bold md:text-5xl" style={{ color: C.ink }}>
            Feel what your customer feels when LeadShield answers.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed" style={{ color: C.muted }}>
            Enter your phone number and get the same kind of missed-call response a buyer would receive while you are on a job.
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <DemoForm />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center md:px-16">
        <h2 className="font-display text-4xl font-black leading-tight md:text-5xl" style={{ color: C.ink }}>
          A missed call is not a voicemail. It is a buyer deciding who gets paid.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl" style={{ color: C.muted }}>
          LeadShield keeps the lead warm, keeps your pipeline clean, and helps you move from one-off jobs to commercial accounts.
        </p>
        <Link href="#calculator" className="mt-8 inline-flex rounded-xl px-8 py-4 text-base font-black" style={{ background: C.ink, color: C.bg }}>
          Check my lost revenue
        </Link>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-6 py-16 md:px-16">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em]" style={{ color: C.gold }}>FAQ</p>
          <h2 className="font-display text-3xl font-bold" style={{ color: C.ink }}>Common buyer questions</h2>
        </div>
        <div className="grid gap-3">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group rounded-2xl p-5" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
              <summary className="cursor-pointer list-none font-bold" style={{ color: C.text }}>{faq.q}</summary>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: C.muted }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="px-6 py-10 md:px-16" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <LogoMark size={38} />
            <div>
              <b className="font-display text-lg" style={{ color: C.ink }}>LeadShield</b>
              <p className="text-xs" style={{ color: C.quiet }}>Built by Chaotically Organized AI</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-5 text-sm" style={{ color: C.muted }}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/signon">Sign In</Link>
            <Link href="/crm">CRM</Link>
            <Link href="/crm/credentials">Credentials</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
