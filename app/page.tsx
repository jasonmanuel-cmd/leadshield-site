import Link from 'next/link'

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    title: 'Lead Pipeline Board',
    desc: 'Every lead gets a card with status tracking. Move through New → Called Back → Quoted → Booked → Lost. See your entire pipeline at a glance.'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: 'Lead Notes & Contact Management',
    desc: 'Add contact names, notes, and callback timestamps to every lead. Keep all the context you need to close the job.'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    title: 'Call Tracking Integration',
    desc: 'Every call to your tracking number is logged automatically. Know who called, when, and what status you left them at.'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Multi-Client Management',
    desc: 'Run multiple businesses? Each client gets their own isolated CRM dashboard, tracking number, and settings. Full separation of data.'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Secure & Private',
    desc: 'Row-level security keeps each clients data completely isolated. Encrypted database. TLS 1.3 in transit. No shared data between businesses.'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Instant Lead Capture',
    desc: 'The moment a lead comes in, its on your dashboard. No delays, no manual entry. Just a clean pipeline waiting for your follow-up.'
  },
]

const PRICING = [
  {
    tier: 'Single',
    price: '39',
    desc: 'Perfect for solo contractors and independent tradespeople.',
    features: [
      '1 tracking number',
      'Full CRM pipeline',
      'Missed-call text-back',
      'Lead status tracking',
      'Contact name & notes',
      'Web-based dashboard',
      'Email support',
    ],
    accent: '#00E5FF',
    cta: 'Get Started',
    popular: false,
  },
  {
    tier: 'Pro',
    price: '69',
    desc: 'For growing businesses that need more flexibility.',
    features: [
      'Everything in Single, plus:',
      '2+ tracking numbers',
      'Missed-call text-back',
      'Custom SMS templates',
      'Pipeline overview & analytics',
      'Priority email support',
    ],
    accent: '#FFD700',
    cta: 'Get Started',
    popular: true,
  },
  {
    tier: 'Agency',
    price: '149',
    desc: 'For agencies and multi-business owners.',
    features: [
      'Everything in Pro, plus:',
      'Up to 5 clients',
      'Missed-call text-back per client',
      'Consolidated admin panel',
      'Usage analytics per client',
      'Payment tracking dashboard',
      'Priority support',
    ],
    accent: '#A855F7',
    cta: 'Contact Admin',
    popular: false,
  },
]

const FAQS = [
  { q: 'What is LeadShield CRM?', a: 'LeadShield is a web-based CRM for contractors and tradespeople. It logs every missed call as a lead, tracks your pipeline through status stages, and integrates with our missed-call text-back system.' },
  { q: 'Do I need to install anything?', a: 'No. LeadShield is a cloud CRM. Access it from any device with a web browser at leadshield.live/crm.' },
  { q: 'How do leads get into the CRM?', a: 'When a call comes in to your tracking number and you don\'t answer, the system logs it as a lead automatically. You can also manually add leads from the dashboard.' },
  { q: 'Can I track my pipeline?', a: 'Yes. Move leads through New → Called Back → Quoted → Booked → Lost. Add notes, contact names, and callback timestamps to every lead.' },
  { q: 'Is my data secure?', a: 'Yes. Each clients data is isolated with row-level security. The database is encrypted, and all connections use TLS 1.3.' },
  { q: 'Can I manage multiple businesses?', a: 'Yes. Each client gets their own tracking number, SMS template, settings, and isolated CRM dashboard. Perfect for agencies running multiple contractors.' },
  { q: 'How do I sign in?', a: 'Go to leadshield.live/signon and use your credentials. If you don\'t have an account, contact your admin.' },
  { q: 'What is the missed call text-back system?', a: 'It\'s a feature that automatically sends a custom SMS to anyone who calls your tracking number and you don\'t answer. Learn more on our Missed Call Text-Back page.' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#050814', color: '#E8EAF0' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-5 sticky top-0 z-50"
        style={{ background: 'rgba(5,8,20,0.88)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black"
            style={{ background: 'linear-gradient(135deg,#0070FF,#00E5FF)' }}>🛡️</div>
          <span className="font-bold text-xl tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
            LeadShield
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: '#8892A4' }}>
          <a href="#features"     className="hover:text-white transition-colors">Features</a>
          <a href="/missed-call-text-back" className="hover:text-white transition-colors">Missed Call System</a>
          <a href="#faq"          className="hover:text-white transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/signon"
            className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ color: '#8892A4' }}>
            Sign In
          </Link>
          <Link href="/admin"
            className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#00E5FF,#0070FF)', color: '#050814' }}>
            Admin Login
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative px-6 md:px-16 pt-24 pb-20 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle,rgba(0,229,255,0.12),transparent 70%)' }} />
          <div className="absolute top-40 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
            style={{ background: 'rgba(255,215,0,0.06)' }} />
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
            style={{ background: 'rgba(0,229,255,0.08)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.22)' }}>
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
            Cloud CRM for Contractors & Trades
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.02] mb-6 tracking-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Your Entire{' '}
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg,#00E5FF,#0070FF)' }}>
              Pipeline
            </span>
            <br />In One Place.
          </h1>

          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-10" style={{ color: '#A6AEC1' }}>
            LeadShield is the web-based CRM built for contractors and tradespeople.
            Track every lead, manage your pipeline, and never lose track of a potential job —{' '}
            <strong style={{ color: '#F5F7FA' }}>all from your browser.</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/signon"
              className="px-10 py-4 rounded-xl font-bold text-lg transition-all hover:opacity-95 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#00E5FF,#0070FF)', color: '#050814', boxShadow: '0 0 40px rgba(0,229,255,0.28)', fontFamily: 'Space Grotesk, sans-serif' }}>
              Access Your CRM →
            </Link>
            <a href="/missed-call-text-back"
              className="px-10 py-4 rounded-xl font-bold text-lg transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#E8EAF0', fontFamily: 'Space Grotesk, sans-serif' }}>
              Missed Call System
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 max-w-3xl mx-auto rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              ['Real-Time', 'leads hit your dashboard the moment a call is missed'],
              ['5 Status Stages', 'New → Called Back → Quoted → Booked → Lost'],
              ['Multi-Client', 'isolated dashboards for every business you run'],
              ['100% Web', 'no app, no install, no maintenance'],
            ].map(([v, l]) => (
              <div key={v} className="py-6 px-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: '#FFD700', fontFamily: 'Space Grotesk, sans-serif' }}>{v}</div>
                <div className="text-xs leading-snug" style={{ color: '#8892A4' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 md:px-16 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#FFD700' }}>Features</div>
          <h2 className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
            Everything you need to manage your leads
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-sm" style={{ color: '#8892A4' }}>
            One dashboard. Every lead. Full pipeline visibility.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title}
              className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="mb-4">{f.icon}</div>
              <h3 className="font-semibold text-base mb-2" style={{ color: '#F5F7FA' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#8892A4' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 md:px-16 py-20"
        style={{ background: 'rgba(255,255,255,0.018)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#00E5FF' }}>How It Works</div>
          <h2 className="text-4xl font-bold mb-12" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
            From call to close in one dashboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { n: '01', title: 'Lead Arrives', body: 'A missed call or new lead appears in your CRM automatically. See the phone number, timestamp, and status.' },
              { n: '02', title: 'You Follow Up', body: 'Call them back, update the status, add notes, and save their contact name. Everything tracked in one place.' },
              { n: '03', title: 'Close the Job', body: 'Move the lead through your pipeline to Booked. Know exactly how many jobs you won — and how many you lost.' },
            ].map(s => (
              <div key={s.n} className="rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm mb-4"
                  style={{ background: '#00E5FF15', border: '2px solid #00E5FF', color: '#00E5FF', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {s.n}
                </div>
                <h3 className="font-semibold text-base mb-2" style={{ color: '#F5F7FA' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8892A4' }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CRM CALLOUT */}
      <section className="px-6 md:px-16 py-16 max-w-4xl mx-auto">
        <div className="rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8"
          style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.15)' }}>
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#00E5FF' }}>
              LeadShield CRM + Missed Call System
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
              Add instant text-back to your pipeline
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#A6AEC1' }}>
              Pair your CRM with our missed-call auto-reply system. When you are on a job and cannot answer,
              your customer gets an instant SMS — and the lead is already in your dashboard waiting for you.
            </p>
          </div>
          <Link href="/missed-call-text-back"
            className="px-8 py-3 rounded-xl font-bold text-sm text-center transition-all hover:opacity-90 flex-shrink-0"
            style={{ background: 'rgba(0,229,255,0.15)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.3)' }}>
            Learn How It Works →
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 md:px-16 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#FFD700' }}>Pricing</div>
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
            Choose your plan
          </h2>
          <p className="text-sm" style={{ color: '#A6AEC1' }}>
            $350 one-time setup. No long-term contracts.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {PRICING.map((p) => {
            const isPro = p.popular
            return (
              <div key={p.tier} style={{
                borderRadius: '24px', padding: '32px', position: 'relative',
                background: isPro ? 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(168,85,247,0.06))' : 'rgba(255,255,255,0.03)',
                border: isPro ? '1px solid rgba(255,215,0,0.25)' : '1px solid rgba(255,255,255,0.07)',
                display: 'flex', flexDirection: 'column',
              }}>
                {isPro && (
                  <div style={{
                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                    background: '#FFD700', color: '#050814', fontSize: '11px', fontWeight: 800,
                    padding: '4px 16px', borderRadius: '20px', textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Most Popular
                  </div>
                )}
                <div style={{ fontSize: '13px', fontWeight: 700, color: p.accent, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  {p.tier}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '36px', fontWeight: 800, color: '#F5F7FA' }}>${p.price}</span>
                  <span style={{ color: '#A6AEC1', fontSize: '14px' }}>/mo</span>
                </div>
                <div style={{ fontSize: '12px', color: '#A6AEC1', marginBottom: '8px' }}>
                  + <span style={{ color: '#00E5FF', fontWeight: 600 }}>$350</span> one-time setup
                </div>
                <p style={{ color: '#A6AEC1', fontSize: '13px', margin: '0 0 20px', lineHeight: 1.5 }}>{p.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {p.features.map((f, i) => (
                    <li key={i} style={{ fontSize: '13px', color: '#E8EAF0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#00FF88' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="/signon"
                  style={{
                    display: 'block', textAlign: 'center', padding: '12px', borderRadius: '14px',
                    fontWeight: 700, fontSize: '14px', textDecoration: 'none',
                    background: isPro ? 'linear-gradient(135deg, #FFD700, #A855F7)' : 'rgba(255,255,255,0.06)',
                    color: isPro ? '#050814' : '#F5F7FA',
                    border: isPro ? 'none' : '1px solid rgba(255,255,255,0.07)',
                  }}>
                  {p.cta}
                </a>
              </div>
            )
          })}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 md:px-16 py-16 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#FFD700' }}>FAQ</div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
            Questions? We got answers.
          </h2>
        </div>
        <div className="space-y-3">
          {FAQS.map(faq => (
            <details key={faq.q}
              className="rounded-xl overflow-hidden group"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <summary className="px-6 py-4 cursor-pointer font-medium text-sm flex justify-between items-center list-none"
                style={{ color: '#E8EAF0' }}>
                {faq.q}
                <span className="ml-4 flex-shrink-0 text-xl group-open:rotate-45 transition-transform duration-200"
                  style={{ color: '#8892A4' }}>+</span>
              </summary>
              <div className="px-6 pb-5 pt-4 text-sm leading-relaxed"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#8892A4' }}>
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 md:px-16 py-24 text-center">
        <div className="max-w-3xl mx-auto rounded-3xl p-12 md:p-16"
          style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.15)', boxShadow: '0 0 80px rgba(0,229,255,0.07)' }}>
          <div className="text-6xl mb-6">🛡️</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
            Ready to Take Control of Your Pipeline?
          </h2>
          <p className="text-lg mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: '#A6AEC1' }}>
            Every lead in one place. Every status tracked. Every job accounted for.
          </p>
          <Link href="/signon"
            className="inline-block px-12 py-5 rounded-xl font-bold text-xl text-[#050814] transition-all hover:opacity-95 hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#00E5FF,#0070FF)', boxShadow: '0 0 50px rgba(0,229,255,0.3)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Access Your CRM →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-16 py-12"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: 'linear-gradient(135deg,#0070FF,#00E5FF)' }}>🛡️</div>
                <span className="font-bold text-xl" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
                  LeadShield
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#8892A4', maxWidth: '280px' }}>
                Cloud CRM for contractors and tradespeople. Track your pipeline, manage leads, and never lose a job.
              </p>
              <p className="text-xs" style={{ color: '#8892A4' }}>
                Built by{' '}
                <a href="https://coaibakersfield.com" target="_blank" rel="noreferrer"
                  style={{ color: '#00E5FF' }}>
                  Chaotically Organized AI
                </a>
                {' '}· Bakersfield, CA
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8892A4' }}>Platform</p>
              <div className="space-y-2.5">
                {[
                  { href: '/missed-call-text-back', label: 'Missed Call System' },
                  { href: '#features',               label: 'Features' },
                  { href: '#faq',                    label: 'FAQ' },
                  { href: '/privacy',                label: 'Privacy Policy' },
                ].map(({ href, label }) => (
                  <a key={label} href={href}
                    className="block text-sm transition-colors" style={{ color: '#8892A4' }}>
                    {label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8892A4' }}>
                CRM Access
              </p>
              <div className="space-y-2.5 mb-5">
                {[
                  { href: '/signon',  label: 'Sign In' },
                  { href: '/crm',     label: 'CRM Dashboard' },
                  { href: '/admin',   label: 'Admin Panel' },
                ].map(({ href, label }) => (
                  <a key={label} href={href}
                    className="block text-sm transition-colors" style={{ color: '#8892A4' }}>
                    {label}
                  </a>
                ))}
              </div>
              <a href="mailto:support@coaibakersfield.com"
                className="text-xs" style={{ color: '#8892A4' }}>
                support@coaibakersfield.com
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs" style={{ color: '#8892A4' }}>
              &copy; 2026 Chaotically Organized AI. All rights reserved. &nbsp;·&nbsp; leadshield.live
            </p>
            <div className="flex gap-5 text-xs" style={{ color: '#8892A4' }}>
              <a href="/privacy"                      className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="https://coaibakersfield.com"
                target="_blank" rel="noreferrer"      className="hover:text-white transition-colors">
                coaibakersfield.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
