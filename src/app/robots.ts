import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/checkout', '/login', '/registro', '/configurar'],
    },
    sitemap: 'https://cascaritajc.com/sitemap.xml',
  }
}
