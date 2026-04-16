'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/context/CartContext'

const links = [
  { label: 'Mystery Box', href: '/cajas' },
  { label: 'Envíos', href: '/envios' },
  { label: 'Contacto', href: '/contacto' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { totalItems } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  function isActive(href: string) {
    if (href === '/cajas') {
      return pathname === '/cajas' || pathname.startsWith('/configurar')
    }
    return pathname === href
  }

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
                  isActive(link.href)
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-zinc-500 hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Cart icon with badge */}
          <Link href="/carrito" className="relative">
            <span className="material-symbols-outlined text-primary text-[28px]">shopping_bag</span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center leading-none">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>

          {/* Desktop — rastreo / admin salir */}
          {session ? (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs font-bold text-on-surface-variant">
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
              href="/rastreo"
              className="hidden md:inline-flex items-center gap-1.5 kinetic-gradient text-white px-6 py-2.5 rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-sm">local_shipping</span>
              Rastrear Pedido
            </Link>
          )}

          {/* Hamburger button — mobile only */}
          <button
            className="md:hidden p-1 text-primary"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            <span className="material-symbols-outlined text-[30px]">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-zinc-100 px-6 py-4 flex flex-col gap-1 shadow-lg">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`py-3 font-bold uppercase tracking-wider text-sm border-b border-zinc-50 transition-colors ${
                isActive(link.href) ? 'text-primary' : 'text-zinc-600 hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3">
            {session ? (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface-variant">
                  {session.user?.name?.split(' ')[0]}
                </span>
                <button
                  onClick={() => { signOut({ callbackUrl: '/' }); setMenuOpen(false) }}
                  className="kinetic-gradient text-white px-5 py-2 rounded-lg font-bold uppercase tracking-wider text-xs hover:opacity-90 transition-opacity"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                href="/rastreo"
                onClick={() => setMenuOpen(false)}
                className="kinetic-gradient text-white w-full py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity text-center flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">local_shipping</span>
                Rastrear Pedido
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
