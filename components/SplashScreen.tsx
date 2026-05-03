'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function SplashScreen() {
  const [phase, setPhase] = useState<'shield' | 'shine' | 'text' | 'out' | 'done'>('shield')

  useEffect(() => {
    if (sessionStorage.getItem('ls_splash')) { setPhase('done'); return }
    sessionStorage.setItem('ls_splash', '1')
    const t1 = setTimeout(() => setPhase('shine'), 600)
    const t2 = setTimeout(() => setPhase('text'),  1100)
    const t3 = setTimeout(() => setPhase('out'),   3400)
    const t4 = setTimeout(() => setPhase('done'),  4100)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  if (phase === 'done') return null

  return (
    <>
      <style>{`
        @keyframes shieldIn {
          0%   { opacity:0; transform:scale(0.25) translateY(30px); }
          65%  { opacity:1; transform:scale(1.1) translateY(-6px); }
          100% { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes shineBar {
          0%   { left:-80%; opacity:0; }
          8%   { opacity:1; }
          100% { left:180%; opacity:0; }
        }
        @keyframes textIn {
          0%   { opacity:0; transform:translateY(18px); }
          100% { opacity:1; transform:translateY(0); }
        }
        @keyframes subIn {
          0%   { opacity:0; transform:translateY(10px); }
          100% { opacity:1; transform:translateY(0); }
        }
        @keyframes splashOut {
          0%   { opacity:1; }
          100% { opacity:0; pointer-events:none; }
        }
        @keyframes glow {
          0%,100% { box-shadow:0 0 40px rgba(255,215,0,0.25),0 0 80px rgba(0,112,255,0.15); }
          50%      { box-shadow:0 0 70px rgba(255,215,0,0.5),0 0 140px rgba(0,112,255,0.3); }
        }
        .ls-shield { animation:shieldIn 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .ls-glow   { animation:glow 2s ease-in-out infinite; }
        .ls-shine  { position:absolute;top:0;bottom:0;width:55%;
                     background:linear-gradient(110deg,transparent 10%,rgba(255,215,0,0.65) 50%,transparent 90%);
                     animation:shineBar 0.7s ease-in-out forwards; pointer-events:none; }
        .ls-title  { animation:textIn 0.5s ease-out forwards; }
        .ls-sub    { animation:subIn 0.5s ease-out 0.25s both; }
        .ls-out    { animation:splashOut 0.7s ease-in forwards; }
      `}</style>

      <div
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center${phase === 'out' ? ' ls-out' : ''}`}
        style={{ background: 'linear-gradient(160deg,#030610 0%,#07111f 60%,#050e1a 100%)' }}
      >
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle,rgba(0,112,255,0.14) 0%,transparent 70%)' }} />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[280px] h-[280px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle,rgba(255,215,0,0.09) 0%,transparent 70%)' }} />
        </div>

        {/* Shield logo */}
        <div
          className="ls-shield ls-glow relative rounded-[32px] overflow-hidden"
          style={{ width: 190, height: 190 }}
        >
          <Image src="/logo.png" alt="LeadShield" fill className="object-cover" priority />
          {(phase === 'shine' || phase === 'text' || phase === 'out') && (
            <div className="ls-shine" />
          )}
        </div>

        {/* Welcome text */}
        {(phase === 'text' || phase === 'out') && (
          <div className="mt-10 text-center px-8 max-w-sm">
            <h1
              className="ls-title text-4xl md:text-5xl font-bold mb-4 leading-tight"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                background: 'linear-gradient(135deg,#FFFFFF 25%,#FFD700 75%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Welcome to<br />LeadShield
            </h1>
            <p
              className="ls-sub text-lg font-medium leading-relaxed"
              style={{ color: '#A6AEC1', fontFamily: 'Inter, sans-serif' }}
            >
              Where you stop losing money<br />and save more time
            </p>
          </div>
        )}

        {/* Progress bar */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 h-0.5 rounded-full overflow-hidden"
          style={{ width: 80, background: 'rgba(255,255,255,0.07)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: phase === 'shield' ? '15%' : phase === 'shine' ? '50%' : phase === 'text' ? '85%' : '100%',
              background: 'linear-gradient(90deg,#00E5FF,#FFD700)',
              transition: 'width 0.6s ease',
            }}
          />
        </div>
      </div>
    </>
  )
}
