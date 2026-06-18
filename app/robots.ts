import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/missed-call-text-back', '/privacy', '/signon'],
      disallow: ['/admin', '/crm', '/api', '/reset-password'],
    },
    sitemap: 'https://leadshield.live/sitemap.xml',
  }
}
