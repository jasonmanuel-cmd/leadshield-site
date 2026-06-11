import Link from 'next/link'

const STEPS = [
  { n: '01', color: '#00E5FF',
    title: 'Customer calls your tracking number',
    body: "You get a dedicated phone number that forwards calls straight to your cell. When you're on a job and can't answer, the system detects the missed call instantly — no hardware, no software, nothing to install." },
  { n: '02', color: '#0070FF',
    title: 'Auto-reply SMS fires in seconds',
    body: 'Within moments of the missed call, your customer receives a professional text message from your number. You write the message — "Hey, this is Mike from Mike\'s Plumbing — I\'m on a job right now but I got your call. What can I help you with?" — and the system sends it automatically.' },
  { n: '03', color: '#FFD700',
    title: 'Lead logged in your CRM',
    body: 'Every missed call becomes a lead card in your LeadShield dashboard. See who called, when, the message that was sent, and start tracking the lead through your pipeline.' },
  { n: '04', color: '#00E5FF',
    title: 'You call them back and close the job',
    body: 'When you\'re free, check your pipeline, call the lead back, and move them through the stages. The whole cycle — from missed call to booked job — lives in one place.' },
]

const FAQS = [
  { q: 'Do I need to install anything?', a: 'No. This is a cloud service. You get a tracking number and a CRM dashboard. No apps, no hardware, no software updates.' },
  { q: 'Do I need a new phone number?', a: 'You get a dedicated tracking number that forwards to your existing phone. Your customers call the tracking number. Your personal number stays private.' },
  { q: 'How fast is the auto-reply?', a: 'The SMS fires within seconds of the missed call being detected. Your customer gets a response before they have even put the phone down.' },
  { q: 'Can I customize the message?', a: 'Yes. Each client sets their own SMS template through the CRM settings. Change it anytime for different seasons, promotions, or services.' },
  { q: 'Do my customers know its automated?', a: 'No. The SMS comes from your tracking number and contains the message you wrote. It looks exactly like a personal text from your business.' },
  { q: 'How do I see who called?', a: 'Every missed call is logged immediately in your CRM dashboard at leadshield.live/crm. See the caller number, timestamp, and SMS status.' },
  { q: 'Can I use this for multiple businesses?', a: 'Yes. Each client gets their own tracking number, isolated CRM dashboard, and custom SMS template. Manage them all from one admin panel.' },
  { q: 'How is this different from a regular forwarding service?', a: 'Regular forwarding just sends the call to voicemail. LeadShield detects the missed call, sends an instant SMS, AND logs it as a lead in your CRM — all automatically.' },
]

export default function MissedCallPage() {
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
          <a href="/"                  className="hover:text-white transition-colors">CRM</a>
          <a href="#how-it-works"      className="hover:text-white transition-colors">How It Works</a>
          <a href="#faq"               className="hover:text-white transition-colors">FAQ</a>
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
            Missed Call Auto-Reply System
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.02] mb-6 tracking-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Never Lose a{' '}
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg,#00E5FF,#0070FF)' }}>
              Job
            </span>
            <br />to a Missed Call.
          </h1>

          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-10" style={{ color: '#A6AEC1' }}>
            When you are on a job and cannot answer, LeadShield sends an instant SMS to your customer
            and logs the lead in your CRM.{' '}
            <strong style={{ color: '#F5F7FA' }}>You close the job when you are free.</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/signon"
              className="px-10 py-4 rounded-xl font-bold text-lg transition-all hover:opacity-95 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#00E5FF,#0070FF)', color: '#050814', boxShadow: '0 0 40px rgba(0,229,255,0.28)', fontFamily: 'Space Grotesk, sans-serif' }}>
              Access Your CRM →
            </Link>
            <Link href="/"
              className="px-10 py-4 rounded-xl font-bold text-lg transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#E8EAF0', fontFamily: 'Space Grotesk, sans-serif' }}>
              CRM Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 max-w-3xl mx-auto rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              ['62%',   'of contractor calls go unanswered'],
              ['85%',   'of missed callers never call back'],
              ['~$850', 'average missed plumbing job'],
              ['~$4,500','average missed roofing job'],
            ].map(([v, l]) => (
              <div key={l} className="py-6 px-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: '#FFD700', fontFamily: 'Space Grotesk, sans-serif' }}>{v}</div>
                <div className="text-xs leading-snug" style={{ color: '#8892A4' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE COST */}
      <section className="px-6 md:px-16 py-16 max-w-4xl mx-auto">
        <div className="rounded-3xl p-8 md:p-12"
          style={{ background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.12)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#FFD700' }}>
            The Real Cost of a Missed Call
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
            You are not just missing a call.<br />You are missing a job.
          </h2>
          <div className="space-y-4 text-base md:text-lg leading-relaxed" style={{ color: '#A6AEC1' }}>
            <p>
              A contractor who misses <strong style={{ color: '#F5F7FA' }}>3 calls a week</strong> loses roughly{' '}
              <strong style={{ color: '#F5F7FA' }}>12 leads a month</strong>. With 85% of missed callers never calling back,
              that is{' '}
              <strong style={{ color: '#F5F7FA', fontSize: '1.15em' }}>$8,500/month walking out the door</strong>
              {' '}— while you are on someone else&apos;s job.
            </p>
            <p>
              LeadShield catches every one of those calls — sends an instant SMS, logs the lead in your CRM,
              and puts everything you need to close the job at your fingertips.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 md:px-16 py-20"
        style={{ background: 'rgba(255,255,255,0.018)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#00E5FF' }}>How It Works</div>
            <h2 className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
              Missed call to booked job
            </h2>
            <p className="mt-3 max-w-lg mx-auto text-sm" style={{ color: '#8892A4' }}>
              No hardware, no software, no app. Just a tracking number and our cloud system.
            </p>
          </div>
          <div className="space-y-4">
            {STEPS.map(step => (
              <div key={step.n} className="flex gap-5 items-start rounded-2xl p-5 md:p-6"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{ background: `${step.color}15`, border: `2px solid ${step.color}`, color: step.color, fontFamily: 'Space Grotesk, sans-serif' }}>
                  {step.n}
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1" style={{ color: '#F5F7FA' }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#8892A4' }}>{step.body}</p>
                </div>
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
              LeadShield CRM
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
              Every lead, tracked end to end
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#A6AEC1' }}>
              The missed-call system feeds directly into your CRM. Each lead gets a card with status tracking,
              notes, contact management, and full pipeline visibility. Sign in at{' '}
              <strong style={{ color: '#00E5FF' }}>leadshield.live/crm</strong>.
            </p>
          </div>
          <div className="flex flex-col gap-3 flex-shrink-0">
            <Link href="/signon"
              className="px-8 py-3 rounded-xl font-bold text-sm text-center transition-all hover:opacity-90"
              style={{ background: 'rgba(0,229,255,0.15)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.3)' }}>
              Sign In to CRM →
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 md:px-16 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#FFD700' }}>Features</div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
            What the system does for you
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '📞', title: 'Instant Detection', desc: 'The system detects a missed call within seconds of it happening. No delays, no polling, no false triggers.' },
            { icon: '💬', title: 'Custom Auto-Reply', desc: 'Write your own SMS template per client. The message goes out from your tracking number automatically.' },
            { icon: '📋', title: 'Lead Logged Automatically', desc: 'Every missed call creates a lead card in your CRM. Caller number, timestamp, and SMS status — all captured.' },
            { icon: '📱', title: 'Works With Any Phone', desc: 'Your tracking number forwards to any phone number. Smartphone or flip phone, it makes no difference.' },
            { icon: '🏢', title: 'Multi-Client Support', desc: 'Each business gets their own tracking number, message template, and isolated CRM. Manage them all from one admin.' },
            { icon: '🔌', title: 'No Integration Needed', desc: 'Works out of the box. Provision a number, set your message, and the system is live. No APIs to configure.' },
          ].map(f => (
            <div key={f.title}
              className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-base mb-2" style={{ color: '#F5F7FA' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#8892A4' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 md:px-16 py-16 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#FFD700' }}>FAQ</div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
            Questions about the system?
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
            Ready to Stop Missing Jobs?
          </h2>
          <p className="text-lg mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: '#A6AEC1' }}>
            Every missed call is a job you did not have to lose. Get your CRM access and start protecting your revenue.
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
                  { href: '/',                       label: 'CRM' },
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
