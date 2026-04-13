'use client'

import { useState } from 'react'
import Link from 'next/link'
import AnnouncementBar from '@/components/AnnouncementBar'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const BOXES = [
  {
    id: 'debutante',
    name: 'Debutante',
    subtitle: 'Single Authentic Jersey',
    jerseys: 1,
    price: 119900,
    priceDisplay: '$1,199',
    originalPrice: '$1,450',
    tag: 'KIT BASE',
    categorias: ['Liga MX', 'Internacional', 'Selecciones'],
    featured: false,
  },
  {
    id: 'doble',
    name: 'Doble',
    subtitle: 'Duo Kit Bundle',
    jerseys: 2,
    price: 219900,
    priceDisplay: '$2,199',
    originalPrice: '$2,900',
    tag: null,
    categorias: ['Liga MX', 'Internacional', 'Selecciones'],
    featured: false,
  },
  {
    id: 'hat-trick',
    name: 'Hat-Trick',
    subtitle: 'Triple Performance Pack',
    jerseys: 3,
    price: 329900,
    priceDisplay: '$3,299',
    originalPrice: '$4,350',
    tag: 'PROMO 3x2',
    categorias: ['Internacional', 'Liga MX', 'Selecciones'],
    featured: false,
  },
  {
    id: 'jersey-club',
    name: 'Jersey Club',
    subtitle: 'Ultimate Curator\'s Pack',
    jerseys: 4,
    price: 349900,
    priceDisplay: '$3,499',
    originalPrice: '$5,800',
    tag: 'MEJOR VALOR',
    categorias: ['Mix (Recomendado)', 'Internacional', 'Liga MX'],
    featured: true,
  },
]

export default function CajasPage() {
  const [categorias, setCategorias] = useState<Record<string, string>>({
    debutante: 'Liga MX',
    doble: 'Liga MX',
    'hat-trick': 'Internacional',
    'jersey-club': 'Mix (Recomendado)',
  })

  function handleCategoria(boxId: string, value: string) {
    setCategorias((prev) => ({ ...prev, [boxId]: value }))
  }

  return (
    <div className="bg-surface text-on-surface">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-16 text-center md:text-left">
          <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="font-label text-xs font-bold tracking-[0.2em] text-primary uppercase">Elite Selection</span>
          </div>
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface mb-6 uppercase">
            Selecciona <br className="hidden md:block" />
            tu <span className="text-primary-container">Caja</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant font-medium leading-relaxed mx-auto md:mx-0">
            Mystery drops con autenticidad garantizada. Selecciona tu nivel y categoría para comenzar tu colección técnica.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {BOXES.map((box) => (
            <div
              key={box.id}
              className={`group bg-white flex flex-col transition-all hover:-translate-y-1 rounded-xl relative ${
                box.featured
                  ? 'ring-2 ring-primary shadow-lg hover:shadow-2xl hover:-translate-y-2'
                  : 'technical-border hover:shadow-xl'
              }`}
            >
              {box.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 px-6 py-1 rounded-full border-2 border-white bg-gradient-to-r from-primary to-primary-container">
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">
                    Mejor Valor / 3x2 Promo
                  </span>
                </div>
              )}

              {/* Image placeholder */}
              <div className={`relative h-48 overflow-hidden rounded-t-xl flex items-center justify-center ${box.featured ? 'bg-primary' : 'bg-surface-container'}`}>
                <span className="material-symbols-outlined text-[5rem] text-white/20">inventory_2</span>
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-full ${box.featured ? 'bg-primary text-white' : 'bg-white/90 backdrop-blur-sm text-primary border border-primary/10'}`}>
                    Envío Gratis
                  </span>
                </div>
                {box.tag && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-emerald-400 text-primary text-[10px] font-black px-2 py-0.5 uppercase tracking-wider">
                      {box.tag}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={`p-6 flex flex-col flex-grow ${box.featured ? 'bg-emerald-50/30' : ''}`}>
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-1">
                    <h3 className="font-headline text-2xl font-black uppercase tracking-tighter">{box.name}</h3>
                    {box.featured && <span className="material-symbols-outlined text-primary text-xl">stars</span>}
                  </div>
                  <p className="text-[10px] text-outline font-bold uppercase tracking-widest">
                    {box.subtitle}
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-black font-headline ${box.featured ? 'text-primary-container' : 'text-primary'}`}>
                      {box.priceDisplay}
                    </span>
                    <span className="text-sm text-outline line-through">{box.originalPrice}</span>
                  </div>
                  {box.featured && (
                    <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-tighter block">
                      Pagas 3, Llevas 4 Jerseys
                    </span>
                  )}

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      Categoría
                    </label>
                    <select
                      value={categorias[box.id]}
                      onChange={(e) => handleCategoria(box.id, e.target.value)}
                      className={`w-full text-xs font-bold uppercase tracking-wider rounded-lg focus:ring-primary focus:border-primary ${box.featured ? 'bg-white border-primary/20' : 'border-zinc-200'}`}
                    >
                      {box.categorias.map((cat) => (
                        <option key={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Link
                  href={`/configurar?box=${box.id}&categoria=${encodeURIComponent(categorias[box.id])}`}
                  className={`mt-auto w-full py-3 text-center font-label font-bold uppercase tracking-widest text-[11px] rounded-lg transition-all block ${
                    box.featured
                      ? 'kinetic-gradient text-white hover:opacity-90 shadow-md active:scale-95 py-4'
                      : 'bg-on-surface text-white hover:bg-primary-container'
                  }`}
                >
                  Añadir al Carrito
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-20 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-outline-variant pt-12">
          <div className="flex flex-wrap justify-center md:justify-start gap-12">
            {[
              { icon: 'verified', title: '100% Original', sub: 'Authenticity Guaranteed' },
              { icon: 'local_shipping', title: 'Envío Express', sub: 'Gratis en Packs Premium' },
              { icon: 'history', title: 'Rare Drops', sub: 'Limited Edition Units' },
            ].map((badge) => (
              <div key={badge.title} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">{badge.icon}</span>
                <div>
                  <p className="font-label text-xs font-black uppercase tracking-tight">{badge.title}</p>
                  <p className="text-[10px] text-outline uppercase font-bold tracking-widest">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-right">
            <p className="text-[10px] text-outline font-bold uppercase tracking-[0.2em] mb-2">KP-LOGISTICS // GEN-02</p>
            <div className="flex gap-2 justify-end">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="w-2 h-2 rounded-full bg-primary/20" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
