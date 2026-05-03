import Link from 'next/link'
import LandingSignupForm from '@/components/LandingSignupForm'

const STEPS = [
  { n: '01', color: '#00E5FF',
    title: 'You miss a call on the job site',
    body: "You're on a roof, under a sink, or mid-install. Phone rings. You can't answer. It happens 3 to 5 times every single workday." },
  { n: '02', color: '#0070FF',
    title: 'LeadShield detects it in under a second',
    body: 'The app runs silently on your existing Android phone. The moment a call goes unanswered it activates — no tapping, no manual trigger.' },
  { n: '03', color: '#FFD700',
    title: 'An intelligent SMS fires automatically',
    body: '"Hey, it\'s Mike from Mike\'s Plumbing — I\'m on a job right now but I got your call. What can I help you with today?"' },
  { n: '04', color: '#00E5FF',
    title: 'Gemini AI holds the full conversation',
    body: 'If they reply, Google Gemini keeps the back-and-forth going — collects the job address, confirms urgency, answers basic questions. All while you work.' },
  { n: '05', color: '#FFD700',
    title: 'You see a scored lead card when you\'re free',
    body: '🔴 HOT — Burst pipe, flooding kitchen, needs help TODAY. You call back with full context. You already have the job.' },
]

const FEATURES = [
  { icon: '🔴', title: 'HOT / WARM / COLD Scoring',    desc: 'Every incoming message is scored instantly. Emergency burst pipe = HOT. Quote request = WARM. You always know who to call back first.' },
  { icon: '🤖', title: 'Gemini AI Conversations',       desc: "Google's Gemini AI holds the full SMS conversation — collects job details, address, and urgency while you're still on the job." },
  { icon: '💰', title: 'Money Captured Tracker',        desc: 'See the real dollar value of every lead you have protected. Watch the number grow in real time based on your trade type.' },
  { icon: '📋', title: 'Lead Pipeline Board',           desc: 'Every lead gets a card: New → Active → Quoted → Won. Follow-up reminders fire automatically for HOT leads you have not called back.' },
  { icon: '⭐', title: 'Google Review Automation',      desc: 'Mark a job done and 24 hours later your customer gets a text with your Google Review link. Five-star reviews on autopilot.' },
  { icon: '🌙', title: 'After-Hours Smart Reply',       desc: 'Different message fires automatically in the evenings and weekends. Keeps every lead warm overnight without you lifting a finger.' },
  { icon: '👑', title: 'VIP Contact Routing',           desc: 'Loyal clients get a more personal reply automatically. The app knows the difference between a returning customer and a cold lead.' },
  { icon: '📊', title: 'CRM Web Dashboard',             desc: 'View all leads, conversations, and analytics from your laptop at leadshield.live — full pipeline visibility from any device.' },
  { icon: '🛡️', title: 'Private by Default',           desc: "Free and Pro tiers: all data stays on your phone. Nothing uploaded. No data sold. Your customers' info belongs to you." },
]

const TIERS = [
  {
    name: 'Free',    price: '$0',     period: '/mo', accent: '#8892A4', badge: null,
    desc: 'Try it with zero risk.',
    features: ['10 auto-replies / month', 'Custom SMS message', 'Active hours scheduling', 'Reply history log'],
    cta: 'Download Free', ctaHref: 'https://play.google.com/store/apps/details?id=com.mctb.autoreply',
  },
  {
    name: 'Pro',     price: '$7.99',  period: '/mo', accent: '#00E5FF', badge: 'Most Popular',
    desc: 'Everything you need to never lose a lead.',
    features: ['Unlimited auto-replies', 'HOT / WARM / COLD scoring', 'After-hours split messages', 'Money Captured tracker', 'Full analytics dashboard', 'VIP contacts + overrides', 'Message templates by trade'],
    cta: 'Get 60 Days Free', ctaHref: '#signup',
  },
  {
    name: 'Operator', price: '$49',   period: '/mo', accent: '#FFD700', badge: 'Power Tier',
    desc: 'Your AI-powered business receptionist.',
    features: ['Everything in Pro', 'Gemini AI holds the conversation', 'Lead card pipeline (Kanban)', 'Follow-up reminders', 'Google Review automation', 'CRM web dashboard', 'Cloud sync across devices'],
    cta: 'Join Beta', ctaHref: '#signup',
  },
  {
    name: 'Voice',   price: '$99',    period: '/mo', accent: '#A78BFA', badge: 'Coming Q3 2026',
    desc: 'AI answers the phone so you never have to.',
    features: ['Everything in Operator', 'AI phone answering (Twilio)', 'Voicemail to lead card auto', 'Call transcription', 'Zero missed opportunities'],
    cta: 'Join Waitlist', ctaHref: '#signup',
  },
  {
    name: 'Team',    price: '$129',   period: '/mo', accent: '#34D399', badge: 'Coming Q4 2026',
    desc: 'Run your whole crew from one dashboard.',
    features: ['Everything in Voice', 'Multi-number management', 'Team member lead assignment', 'Shared templates & routing', 'Team analytics dashboard'],
    cta: 'Join Waitlist', ctaHref: '#signup',
  },
]

const FAQS = [
  { q: 'What phone does LeadShield work on?',
    a: 'LeadShield is an Android app that works on any Android phone running Android 8.0 or newer — basically any phone made after 2017. An iOS version is on the roadmap for Q3 2026.' },
  { q: 'Do I need a new phone number?',
    a: 'No. LeadShield works with your existing number and phone plan. Customers receive texts from your actual number — not a third-party number. It looks like you texted them yourself.' },
  { q: 'Will it reply to every missed call?',
    a: "You're in complete control. Set active hours, configure an after-hours message, use contacts-only mode, or pause it with one tap. It only fires when you want it to." },
  { q: 'What does the beta include?',
    a: 'Full Pro tier access for 60 days — completely free. Unlimited auto-replies, lead scoring, Money Captured tracker, after-hours messages, and full analytics. No credit card required.' },
  { q: 'Is my customer data private?',
    a: 'On Free and Pro tiers, all data stays on your phone — nothing is uploaded. On Operator tier, CRM sync is opt-in and encrypted. We never sell data.' },
  { q: 'What is the CRM dashboard?',
    a: 'Operator subscribers get a full web dashboard at leadshield.live where they can view all leads, read AI conversation threads, manage their pipeline, and see analytics from any device.' },
  { q: 'How long does setup take?',
    a: 'About 3 minutes. Install the app, enter your business name and trade type, write your auto-reply message, set your active hours, and you are live. No technical knowledge required.' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#050814', color: '#E8EAF0' }}>

      {/* Announcement bar */}
      <div className="text-center text-sm font-semibold py-2.5 px-4"
        style={{ background: 'linear-gradient(90deg,rgba(0,229,255,0.12),rgba(0,112,255,0.18),rgba(0,229,255,0.12))', borderBottom: '1px solid rgba(0,229,255,0.18)', color: '#00E5FF' }}>
        🛡️ LeadShield Beta is now open — limited spots available
      </div>

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
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#features"     className="hover:text-white transition-colors">Features</a>
          <a href="#pricing"      className="hover:text-white transition-colors">Pricing</a>
          <a href="#signup"       className="hover:text-white transition-colors">Beta</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/signon"
            className="hidden sm:block text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ color: '#8892A4' }}>
            Sign In to CRM
          </Link>
          <a href="#signup"
            className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#00E5FF,#0070FF)', color: '#050814' }}>
            Get Beta Access
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative px-6 md:px-16 pt-24 pb-20 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle,rgba(0,229,255,0.12),transparent 70%)' }} />
          <div className="absolute top-40 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
            style={{ background: 'rgba(255,215,0,0.06)' }} />
          <div className="absolute top-20 right-1/4 w-[300px] h-[300px] rounded-full blur-3xl"
            style={{ background: 'rgba(0,112,255,0.08)' }} />
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
            style={{ background: 'rgba(0,229,255,0.08)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.22)' }}>
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
            Beta Access Now Open — Android
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.02] mb-6 tracking-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Stop Losing{' '}
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg,#00E5FF,#0070FF)' }}>
              $8,500
            </span>
            <br />a Month to<br />Missed Calls
          </h1>

          <p className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: '#A6AEC1' }}>
            LeadShield is the AI-powered auto-reply built for contractors and tradespeople.
            When you&apos;re on a ladder, under a sink, or roofing a house —{' '}
            <strong style={{ color: '#F5F7FA' }}>LeadShield answers for you.</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a href="#signup"
              className="px-10 py-4 rounded-xl font-bold text-lg transition-all hover:opacity-95 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#00E5FF,#0070FF)', color: '#050814', boxShadow: '0 0 40px rgba(0,229,255,0.28)', fontFamily: 'Space Grotesk, sans-serif' }}>
              Get Free Beta Access →
            </a>
            <a href="#how-it-works"
              className="px-10 py-4 rounded-xl font-bold text-lg transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#E8EAF0', fontFamily: 'Space Grotesk, sans-serif' }}>
              See How It Works
            </a>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 max-w-3xl mx-auto rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              ['62%',   'of contractor calls go unanswered'],
              ['85%',   'of missed callers never call back'],
              ['$850',  'average plumbing job value'],
              ['$4,500','average roofing job value'],
            ].map(([v, l]) => (
              <div key={l} className="py-6 px-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: '#FFD700', fontFamily: 'Space Grotesk, sans-serif' }}>{v}</div>
                <div className="text-xs leading-snug" style={{ color: '#8892A4' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE MATH */}
      <section className="px-6 md:px-16 py-16 max-w-4xl mx-auto">
        <div className="rounded-3xl p-8 md:p-12"
          style={{ background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.12)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#FFD700' }}>
            The Real Cost of a Missed Call
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
            You&apos;re not just missing a call.<br />You&apos;re missing a job.
          </h2>
          <div className="space-y-4 text-base md:text-lg leading-relaxed" style={{ color: '#A6AEC1' }}>
            <p>
              A plumber who misses <strong style={{ color: '#F5F7FA' }}>3 calls a week</strong> loses roughly{' '}
              <strong style={{ color: '#FFD700' }}>12 leads a month</strong>. At $850 per job, with 85% never calling back,
              that is{' '}
              <strong style={{ color: '#F5F7FA', fontSize: '1.15em' }}>$8,500/month walking out the door</strong>
              {' '}— silently, while you are on someone else&apos;s job.
            </p>
            <p>
              LeadShield fires an intelligent SMS the moment you miss that call. The AI scores the
              lead <strong style={{ color: '#FF4444' }}>HOT</strong>,{' '}
              <strong style={{ color: '#FFB300' }}>WARM</strong>, or{' '}
              <strong style={{ color: '#8892A4' }}>COLD</strong> so you always know who to call back first.
            </p>
            <div className="mt-6 p-5 rounded-2xl"
              style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.18)' }}>
              <p className="font-bold text-lg" style={{ color: '#FFD700' }}>
                At $7.99/month — if it saves you one job, the ROI is over 100x. That is math a contractor can respect.
              </p>
            </div>
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
              Protecting your leads in 5 steps
            </h2>
            <p className="mt-3 max-w-lg mx-auto text-sm" style={{ color: '#8892A4' }}>
              No setup headaches. No new number. Works silently on the Android phone you already own.
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

      {/* FEATURES */}
      <section id="features" className="px-6 md:px-16 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#FFD700' }}>Features</div>
          <h2 className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
            Everything a contractor needs
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-sm" style={{ color: '#8892A4' }}>
            Built for the trades. 3-minute setup. Works on your existing Android phone.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
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

      {/* PRICING */}
      <section id="pricing" className="px-6 md:px-16 py-20"
        style={{ background: 'rgba(255,255,255,0.018)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#00E5FF' }}>Pricing</div>
            <h2 className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
              Simple pricing. Insane ROI.
            </h2>
            <p className="mt-3 text-sm" style={{ color: '#8892A4' }}>
              Beta testers get{' '}
              <strong style={{ color: '#FFD700' }}>60 days Pro completely free</strong>.
              No credit card required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {TIERS.map(tier => (
              <div key={tier.name}
                className="rounded-2xl p-6 flex flex-col"
                style={{
                  background: tier.badge === 'Most Popular' ? `rgba(0,229,255,0.05)` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tier.accent}35`,
                  boxShadow: tier.badge === 'Most Popular' ? `0 0 40px ${tier.accent}18` : 'none',
                }}>
                {tier.badge && (
                  <div className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 self-start"
                    style={{ background: `${tier.accent}18`, color: tier.accent, border: `1px solid ${tier.accent}35` }}>
                    {tier.badge}
                  </div>
                )}
                <div className="font-bold text-lg mb-1" style={{ color: '#F5F7FA', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {tier.name}
                </div>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-4xl font-bold" style={{ color: tier.accent, fontFamily: 'Space Grotesk, sans-serif' }}>
                    {tier.price}
                  </span>
                  <span className="text-xs mb-1.5" style={{ color: '#8892A4' }}>{tier.period}</span>
                </div>
                <p className="text-xs mb-4" style={{ color: '#8892A4' }}>{tier.desc}</p>
                <ul className="space-y-2 flex-1 mb-5">
                  {tier.features.map(ft => (
                    <li key={ft} className="flex items-start gap-2 text-xs" style={{ color: '#A6AEC1' }}>
                      <span className="mt-0.5 font-bold flex-shrink-0" style={{ color: tier.accent }}>✓</span>
                      {ft}
                    </li>
                  ))}
                </ul>
                <a href={tier.ctaHref}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-center transition-all hover:opacity-90"
                  style={{ background: `${tier.accent}18`, color: tier.accent, border: `1px solid ${tier.accent}35` }}>
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CRM CALLOUT */}
      <section className="px-6 md:px-16 py-16 max-w-4xl mx-auto">
        <div className="rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8"
          style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.15)' }}>
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#FFD700' }}>
              Operator Tier Included
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
              Your leads, live on the web
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#A6AEC1' }}>
              Operator subscribers get full access to the LeadShield web dashboard — view every lead,
              read full AI conversation threads, manage your pipeline, and see revenue analytics from
              any device at any time. Sign in at{' '}
              <strong style={{ color: '#FFD700' }}>leadshield.live/dashboard</strong>.
            </p>
          </div>
          <div className="flex flex-col gap-3 flex-shrink-0">
            <Link href="/signon"
              className="px-8 py-3 rounded-xl font-bold text-sm text-center transition-all hover:opacity-90"
              style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)' }}>
              Sign In to CRM →
            </Link>
            <a href="#signup"
              className="px-8 py-3 rounded-xl font-bold text-sm text-center transition-all hover:opacity-90"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#E8EAF0', border: '1px solid rgba(255,255,255,0.1)' }}>
              Get Operator Access
            </a>
          </div>
        </div>
      </section>

      {/* BETA SIGNUP */}
      <section id="signup" className="px-6 md:px-16 py-24"
        style={{ background: 'rgba(255,255,255,0.018)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#00E5FF' }}>
              Join the Beta
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
              Secure your spot.<br />Get 60 days Pro free.
            </h2>
            <p className="max-w-md mx-auto text-sm leading-relaxed" style={{ color: '#A6AEC1' }}>
              Beta closes soon. Fill in your info below and we will email you the moment the app is
              ready — with your personal download link and 60-day free Pro access.
            </p>
          </div>

          <div className="rounded-3xl p-8 md:p-10"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,229,255,0.15)', boxShadow: '0 0 60px rgba(0,229,255,0.07)' }}>
            <LandingSignupForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 md:px-16 py-16">
        <div className="max-w-3xl mx-auto">
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
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 md:px-16 py-24 text-center">
        <div className="max-w-3xl mx-auto rounded-3xl p-12 md:p-16"
          style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.15)', boxShadow: '0 0 80px rgba(0,229,255,0.07)' }}>
          <div className="text-6xl mb-6">🛡️</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F5F7FA' }}>
            Never Miss a Lead Again.
          </h2>
          <p className="text-lg mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: '#A6AEC1' }}>
            Every day without LeadShield is another $850 you did not have to lose.
            Join the beta and protect your next call — free.
          </p>
          <a href="#signup"
            className="inline-block px-12 py-5 rounded-xl font-bold text-xl text-[#050814] transition-all hover:opacity-95 hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#00E5FF,#0070FF)', boxShadow: '0 0 50px rgba(0,229,255,0.3)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Join the Beta — Free
          </a>
          <p className="mt-4 text-xs" style={{ color: '#8892A4' }}>
            60 days Pro &nbsp;·&nbsp; No credit card &nbsp;·&nbsp; No spam &nbsp;·&nbsp; Just a smarter business
          </p>
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
                The AI-powered missed-call auto-reply built for contractors and tradespeople.
                Never lose a lead again.
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
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8892A4' }}>Product</p>
              <div className="space-y-2.5">
                {[
                  { href: '#how-it-works', label: 'How It Works' },
                  { href: '#features',     label: 'Features' },
                  { href: '#pricing',      label: 'Pricing' },
                  { href: '#signup',       label: 'Beta Signup' },
                  { href: '/privacy',      label: 'Privacy Policy' },
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
                Operator CRM
              </p>
              <div className="space-y-2.5 mb-5">
                {[
                  { href: '/signon',      label: 'Sign In' },
                  { href: '/dashboard',  label: 'Dashboard' },
                  { href: '/pipeline',   label: 'Lead Pipeline' },
                  { href: '/analytics',  label: 'Analytics' },
                  { href: '/settings',   label: 'Account Settings' },
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
              © 2026 Chaotically Organized AI. All rights reserved. &nbsp;·&nbsp; leadshield.live
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
