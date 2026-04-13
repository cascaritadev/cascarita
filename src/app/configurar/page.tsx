'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AnnouncementBar from '@/components/AnnouncementBar'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL']

const BOX_LABELS: Record<string, { name: string; price: string; jerseys: number }> = {
  debutante: { name: 'Debutante', price: '$1,199', jerseys: 1 },
  doble: { name: 'Doble', price: '$2,199', jerseys: 2 },
  'hat-trick': { name: 'Hat-Trick', price: '$3,299', jerseys: 3 },
  'jersey-club': { name: 'Jersey Club', price: '$3,499', jerseys: 4 },
}

function ConfiguradorContent() {
  const router = useRouter()
  const params = useSearchParams()
  const boxId = params.get('box') ?? 'debutante'
  const categoria = params.get('categoria') ?? 'Liga MX'

  const boxInfo = BOX_LABELS[boxId] ?? BOX_LABELS.debutante

  const [selectedSize, setSelectedSize] = useState('M')
  const [exclusiones, setExclusiones] = useState<string[]>([])
  const [inputEquipo, setInputEquipo] = useState('')

  function addExclusion() {
    const trimmed = inputEquipo.trim()
    if (!trimmed || exclusiones.length >= 5 || exclusiones.includes(trimmed)) return
    setExclusiones([...exclusiones, trimmed])
    setInputEquipo('')
  }

  function removeExclusion(eq: string) {
    setExclusiones(exclusiones.filter((e) => e !== eq))
  }

  function handleContinuar() {
    const query = new URLSearchParams({
      box: boxId,
      categoria,
      talla: selectedSize,
      excl: exclusiones.join(','),
    })
    router.push(`/checkout?${query.toString()}`)
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
              Personalización Técnica / Paso 01-02
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

          {/* Step 2: Exclusions */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="font-headline font-black text-2xl text-primary/20">02</span>
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

          {/* Visual */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-900">
            <div className="absolute inset-0 kinetic-gradient opacity-60" />
            <div className="absolute inset-0 flex flex-col justify-end p-12">
              <div className="glass-panel p-6 max-w-sm rounded-lg border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 mb-2">Performance HUD</p>
                <div className="flex items-center gap-4 text-white">
                  <span className="material-symbols-outlined">package_2</span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">Authentic Gear Only</p>
                    <p className="text-[10px] opacity-70">Sourced from official club distributors globally.</p>
                  </div>
                </div>
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
                  { label: 'Talla', value: `${selectedSize}` },
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
                  <span className="text-4xl font-black font-headline text-primary">{boxInfo.price}</span>
                </div>
                <button
                  onClick={handleContinuar}
                  className="w-full kinetic-gradient text-on-primary py-5 rounded-lg font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Continuar al Pago
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
