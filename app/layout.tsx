import type { Metadata } from 'next'
import './globals.css'
import SplashScreen from '@/components/SplashScreen'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'LeadShield — AI Auto-Reply for Contractors | Never Miss a Lead Again',
  description: 'LeadShield fires an intelligent SMS the moment you miss a call, scores the lead HOT/WARM/COLD with Gemini AI, and tracks your Money Captured. Built for plumbers, HVAC techs, electricians, roofers, and all tradespeople.',
  metadataBase: new URL('https://leadshield.live'),
  openGraph: {
    title: 'LeadShield — AI Auto-Reply for Contractors',
    description: 'Stop losing $8,500/month to missed calls. LeadShield answers for you while you work.',
    url: 'https://leadshield.live',
    siteName: 'LeadShield',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LeadShield — AI Auto-Reply for Contractors',
    description: 'Stop losing $8,500/month to missed calls. LeadShield answers for you while you work.',
  },
  keywords: ['contractor auto reply', 'missed call text back', 'plumber app', 'HVAC lead management', 'electrician SMS', 'contractor CRM', 'LeadShield'],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: '#0a0e1a', minHeight: '100vh' }}>
        <SplashScreen />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
