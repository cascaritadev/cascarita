'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

const links = [
  { label: 'Jerseys', href: '/cajas' },
  { label: 'Mystery Box', href: '/cajas' },
  { label: 'Colección 2024', href: '/cajas' },
  { label: 'Rastrear Pedido', href: '/rastreo' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-zinc-100 w-full">
      <div className="flex justify-between items-center px-6 h-20 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-black tracking-tighter text-primary uppercase font-headline">
            LA CASCARITA
          </Link>
          <div className="hidden md:flex gap-8 items-center">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`font-bold uppercase tracking-wider text-sm transition-colors ${
                  pathname === link.href
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-zinc-500 hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="material-symbols-outlined text-primary">
            shopping_bag
          </button>

          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-on-surface-variant hidden md:block">
                {session.user?.name?.split(' ')[0]}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="kinetic-gradient text-white px-5 py-2 rounded-lg font-bold uppercase tracking-wider text-xs hover:opacity-90 transition-opacity"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="kinetic-gradient text-white px-6 py-2.5 rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
            >
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
