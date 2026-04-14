'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AnnouncementBar from '@/components/AnnouncementBar'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCart } from '@/context/CartContext'
import { getBoxPrice, formatMXN } from '@/lib/pricing'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL']

const TIPOS = [
  {
    id: 'actual',
    label: 'Actual',
    desc: 'Temporada en curso',
    icon: 'new_releases',
  },
  {
    id: 'mundialista',
    label: 'Mundialista',
    desc: 'Edición selección',
    icon: 'public',
  },
  {
    id: 'retro',
    label: 'Retro',
    desc: 'Edición vintage',
    icon: 'history',
  },
]

const BOX_LABELS: Record<string, { name: string; jerseys: number }> = {
  debutante: { name: 'Debutante', jerseys: 1 },
  doble: { name: 'Doble', jerseys: 2 },
  'hat-trick': { name: 'Hat-Trick', jerseys: 3 },
  'jersey-club': { name: 'Jersey Club', jerseys: 4 },
}

function ConfiguradorContent() {
  const router = useRouter()
  const params = useSearchParams()
  const boxId = params.get('box') ?? 'debutante'
  const categoria = params.get('categoria') ?? 'Liga MX'

  const boxInfo = BOX_LABELS[boxId] ?? BOX_LABELS.debutante
  const { addItem } = useCart()

  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedTipo, setSelectedTipo] = useState('actual')
  const [exclusiones, setExclusiones] = useState<string[]>([])
  const [inputEquipo, setInputEquipo] = useState('')
  const [added, setAdded] = useState(false)

  function addExclusion() {
    const trimmed = inputEquipo.trim()
    if (!trimmed || exclusiones.length >= 5 || exclusiones.includes(trimmed)) return
    setExclusiones([...exclusiones, trimmed])
    setInputEquipo('')
  }

  function removeExclusion(eq: string) {
    setExclusiones(exclusiones.filter((e) => e !== eq))
  }

  const computedPrice = getBoxPrice(boxId, selectedTipo)
  const computedPriceDisplay = formatMXN(computedPrice)

  function handleAgregarAlCarrito() {
    addItem({
      boxId,
      boxName: `Mystery Box ${boxInfo.name}`,
      categoria,
      talla: selectedSize,
      tipo: selectedTipo,
      exclusiones,
      price: computedPrice,
      priceDisplay: computedPriceDisplay,
      jerseys: boxInfo.jerseys,
    })
    setAdded(true)
    setTimeout(() => router.push('/carrito'), 800)
  }

  return (
    <div className="bg-surface text-on-surface">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row gap-12">
        {/* ── Steps ─────────────────────────────────────── */}
        <section className="flex-grow space-y-16">
          <header>
            <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase mb-2 font-label">
              Personalización / Paso 01-03
            </p>
            <h1 className="font-headline font-black text-4xl md:text-6xl text-on-surface tracking-tighter uppercase leading-none">
              Personaliza tu{' '}
              <br />
              <span className="text-gradient-primary">Experiencia</span>
            </h1>
          </header>

          {/* Step 1: Size */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="font-headline font-black text-2xl text-primary/20">01</span>
              <h2 className="font-headline font-bold text-xl uppercase tracking-tight">Selecciona tu Talla</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`border-2 p-6 rounded-lg transition-all flex flex-col items-center gap-2 ${
                    selectedSize === size
                      ? 'border-primary bg-primary-container text-white'
                      : 'border-outline-variant hover:border-primary'
                  }`}
                >
                  <span className="text-2xl font-black font-headline">{size}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-widest ${selectedSize === size ? 'text-on-primary-container' : 'text-secondary'}`}>
                    {size === 'XS' ? 'Extra Small' : size === 'S' ? 'Small' : size === 'M' ? 'Medium' : size === 'L' ? 'Large' : size === 'XL' ? 'X-Large' : '2X-Large'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Tipo de Jersey */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="font-headline font-black text-2xl text-primary/20">02</span>
              <h2 className="font-headline font-bold text-xl uppercase tracking-tight">Tipo de Jersey</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {TIPOS.map((tipo) => {
                const isPremium = tipo.id === 'retro'
                return (
                  <button
                    key={tipo.id}
                    onClick={() => setSelectedTipo(tipo.id)}
                    className={`border-2 p-6 rounded-xl transition-all text-left flex flex-col gap-3 relative ${
                      selectedTipo === tipo.id
                        ? 'border-primary bg-emerald-50 shadow-md'
                        : 'border-outline-variant hover:border-primary'
                    }`}
                  >
                    {isPremium && (
                      <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        $999/jersey
                      </span>
                    )}
                    <span className={`material-symbols-outlined text-3xl ${selectedTipo === tipo.id ? 'text-primary' : 'text-zinc-400'}`}>
                      {tipo.icon}
                    </span>
                    <div>
                      <p className="font-headline font-black text-lg uppercase tracking-tight">{tipo.label}</p>
                      <p className="text-xs text-on-surface-variant font-medium">{tipo.desc}</p>
                    </div>
                    {selectedTipo === tipo.id && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Seleccionado ✓</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 3: Exclusions */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="font-headline font-black text-2xl text-primary/20">03</span>
              <h2 className="font-headline font-bold text-xl uppercase tracking-tight">Equipos Excluidos</h2>
            </div>
            <div className="bg-surface-container p-8 rounded-xl space-y-6">
              <p className="text-sm text-on-surface-variant leading-relaxed max-w-xl">
                ¿Hay algún equipo que prefieras no recibir? Agrega hasta{' '}
                <span className="font-bold text-primary">5 clubes</span> y nos aseguraremos de que no formen parte de tu unboxing.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  className="flex-grow bg-white border-0 py-4 px-6 rounded-lg shadow-sm focus:ring-2 focus:ring-primary font-medium text-on-surface placeholder:text-zinc-400 outline-none"
                  placeholder="Escribe el nombre del equipo..."
                  type="text"
                  value={inputEquipo}
                  onChange={(e) => setInputEquipo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addExclusion()}
                  disabled={exclusiones.length >= 5}
                />
                <button
                  onClick={addExclusion}
                  disabled={exclusiones.length >= 5 || !inputEquipo.trim()}
                  className="bg-primary text-on-primary px-8 py-4 font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-primary-container transition-colors disabled:opacity-40"
                >
                  Añadir
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {exclusiones.map((eq) => (
                  <div key={eq} className="bg-white px-4 py-2 flex items-center gap-3 rounded-full border border-outline-variant/30">
                    <span className="text-xs font-bold uppercase tracking-wider">{eq}</span>
                    <button onClick={() => removeExclusion(eq)} className="material-symbols-outlined text-sm hover:text-error transition-colors">
                      close
                    </button>
                  </div>
                ))}
                {exclusiones.length < 5 && (
                  <div className="bg-zinc-200/50 px-4 py-2 flex items-center gap-3 rounded-full border border-dashed border-outline-variant/50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      Espacio disponible ({exclusiones.length}/5)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Summary Sidebar ───────────────────────────── */}
        <aside className="w-full lg:w-96 shrink-0">
          <div className="sticky top-32 space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/10 space-y-8">
              <h3 className="font-headline font-black text-2xl uppercase tracking-tighter">Tu Selección</h3>
              <div className="space-y-4">
                {[
                  { label: 'Producto', value: `${boxInfo.name} (${boxInfo.jerseys} jersey${boxInfo.jerseys > 1 ? 's' : ''})` },
                  { label: 'Categoría', value: categoria },
                  { label: 'Talla', value: selectedSize },
                  { label: 'Tipo', value: TIPOS.find((t) => t.id === selectedTipo)?.label ?? selectedTipo },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-3 border-b border-surface-container">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary">{row.label}</span>
                    <span className="text-sm font-bold uppercase">{row.value}</span>
                  </div>
                ))}

                {exclusiones.length > 0 && (
                  <div className="flex justify-between items-start py-3 border-b border-surface-container">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary">Exclusiones</span>
                    <div className="text-right">
                      {exclusiones.map((eq) => (
                        <p key={eq} className="text-[10px] font-bold uppercase">{eq}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center py-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">Envío</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-1 bg-emerald-100 text-emerald-800 rounded">Gratis</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider">Total</span>
                  <span className="text-4xl font-black font-headline text-primary">{computedPriceDisplay}</span>
                </div>
                <button
                  onClick={handleAgregarAlCarrito}
                  disabled={added}
                  className={`w-full py-5 rounded-lg font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 ${
                    added
                      ? 'bg-emerald-500 text-white scale-95'
                      : 'kinetic-gradient text-on-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {added ? (
                    <>
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      Agregado al Carrito
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">shopping_bag</span>
                      Añadir al Carrito
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-lg">
                <span className="material-symbols-outlined text-primary">verified</span>
                <p className="text-[10px] font-bold uppercase tracking-tight leading-tight">
                  Garantía de Autenticidad KINETIC PRECISION
                </p>
              </div>
            </div>

            <div className="bg-primary-container p-8 rounded-xl text-on-primary-container relative overflow-hidden">
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12">local_shipping</span>
              <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Promoción Activa</p>
              <h4 className="font-headline font-black text-xl uppercase leading-none mb-4">
                Envío Gratuito <br />Confirmado
              </h4>
              <p className="text-xs leading-relaxed opacity-90">
                Tu configuración califica para envío express sin costo adicional.
              </p>
            </div>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  )
}

export default function ConfigurarPage() {
  return (
    <Suspense>
      <ConfiguradorContent />
    </Suspense>
  )
}
