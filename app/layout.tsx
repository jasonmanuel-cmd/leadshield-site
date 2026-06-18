import type { Metadata } from 'next'
import './globals.css'
import SplashScreen from '@/components/SplashScreen'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'LeadShield — Turn Missed Calls Into Booked Jobs',
  description: 'LeadShield helps contractors protect paid leads with instant missed-call text-back, pipeline tracking, and commercial credential packets.',
  metadataBase: new URL('https://leadshield.live'),
  icons: {
    icon: '/leadshield-mark.svg',
  },
  openGraph: {
    title: 'LeadShield — Turn Missed Calls Into Booked Jobs',
    description: 'Instant missed-call text-back, contractor CRM, and commercial credential packets for local service businesses.',
    url: 'https://leadshield.live',
    siteName: 'LeadShield',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LeadShield — Turn Missed Calls Into Booked Jobs',
    description: 'Protect paid leads before they call your competitor.',
  },
  keywords: ['contractor CRM', 'missed call text back', 'lead management', 'pipeline tracking', 'commercial credential packets', 'LeadShield', 'small business CRM'],
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
