import type { Metadata } from 'next'
import { Manrope, Inter } from 'next/font/google'
import Providers from '@/components/Providers'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['200', '400', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://cascaritajc.com'),
  title: {
    default: 'La Cascarita Jersey Club | Mystery Box de Jerseys Originales',
    template: '%s | La Cascarita Jersey Club',
  },
  description:
    'Compra tu Mystery Box de jerseys originales de las mejores ligas del mundo: Liga MX, Premier League, Champions League y Selección Mexicana. Envío gratis a todo México.',
  keywords: [
    'jerseys originales México',
    'mystery box jerseys fútbol',
    'jerseys de fútbol baratos México',
    'jersey Liga MX',
    'jersey selección mexicana',
    'jersey Premier League México',
    'comprar jerseys en línea México',
    'caja sorpresa jerseys',
    'jersey club',
    'jerseys con envío gratis México',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://cascaritajc.com',
    siteName: 'La Cascarita Jersey Club',
    title: 'La Cascarita Jersey Club | Mystery Box de Jerseys Originales',
    description:
      'Jerseys originales de Liga MX, Premier League, Champions League y Selección Mexicana en Mystery Box. Envío gratis a todo México.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'La Cascarita Jersey Club – Mystery Box de Jerseys',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Cascarita Jersey Club | Mystery Box de Jerseys',
    description: 'Jerseys originales en Mystery Box con envío gratis a todo México.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/favicon.png',
  },
  alternates: {
    canonical: 'https://cascaritajc.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${manrope.variable} ${inter.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
