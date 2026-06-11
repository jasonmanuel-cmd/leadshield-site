import type { Metadata } from 'next'
import './globals.css'
import SplashScreen from '@/components/SplashScreen'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'LeadShield — Cloud CRM for Contractors',
  description: 'LeadShield is a web-based CRM with missed-call text-back for contractors. Track every lead, manage your pipeline, and never lose a job.',
  metadataBase: new URL('https://leadshield.live'),
  openGraph: {
    title: 'LeadShield — Cloud CRM for Contractors',
    description: 'Cloud CRM with missed-call auto-reply. Track leads, manage pipeline, and capture every job.',
    url: 'https://leadshield.live',
    siteName: 'LeadShield',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LeadShield — Cloud CRM for Contractors',
    description: 'Cloud CRM with missed-call auto-reply. Track leads, manage pipeline, and capture every job.',
  },
  keywords: ['contractor CRM', 'missed call text back', 'lead management', 'pipeline tracking', 'cloud CRM', 'LeadShield', 'small business CRM'],
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
