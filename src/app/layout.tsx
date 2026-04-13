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
  title: 'LA CASCARITA | Jersey Club',
  description: 'Jerseys auténticos de las mejores ligas y selecciones. Mystery boxes curadas con precisión técnica.',
  icons: {
    icon: '/favicon.svg',
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
