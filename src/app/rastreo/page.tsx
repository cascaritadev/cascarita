'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnnouncementBar from '@/components/AnnouncementBar'

type TrackingStep = {
  icon: string
  label: string
  done: boolean
  active: boolean
}

type TrackingData = {
  orderId: string
  status: string
  statusLabel: string
  eta: string
  etaWindow: string
  trackingNumber: string | null
  trackingUrl: string | null
  carrier: string
  product: string
  total: string
  address: string
  steps: TrackingStep[]
  events: { date: string; desc: string; location: string }[]
}

type ErrorData = {
  error: string
  hint?: string
}

function RastreoContent() {
  const params = useSearchParams()
  const [input, setInput] = useState(params.get('order') ?? '')
  const [data, setData] = useState<TrackingData | null>(null)
  const [errorData, setErrorData] = useState<ErrorData | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSearch() {
    const query = input.trim()
    if (!query) return
    setLoading(true)
    setErrorData(null)
    setData(null)

    try {
      const res = await fetch(`/api/tracking?q=${encodeURIComponent(query)}`)
      const json = await res.json()

      if (!res.ok) {
        setErrorData({ error: json.error, hint: json.hint })
      } else {
        setData(json)
      }
    } catch {
      setErrorData({ error: 'Error de conexión. Intenta de nuevo.' })
    }

    setLoading(false)
  }

  const stepIndex = data ? data.steps.findIndex((s) => s.active) : -1

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">

        {/* Header */}
        <header className="mb-10">
          <span className="font-label text-[10px] uppercase tracking-[0.3em] text-primary mb-2 block">
            Logística · Estafeta
          </span>
          <h1 className="font-headline font-black text-5xl md:text-7xl tracking-tighter uppercase text-primary leading-none mb-6">
            Rastrea tu<br />Pedido
          </h1>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <input
              type="text"
              placeholder="Número de guía, ID de orden o tu correo"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-grow bg-surface-container border border-zinc-200 focus:ring-2 focus:ring-primary focus:border-transparent py-4 px-6 text-sm font-medium outline-none rounded-none"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !input.trim()}
              className="kinetic-gradient text-white px-8 py-4 font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Rastrear'}
            </button>
          </div>

          <p className="text-[11px] text-zinc-400 mt-2 font-medium">
            Puedes buscar con el número de guía Estafeta, el ID de tu orden (ej: cjld2c…) o con el correo con que compraste.
          </p>
        </header>

        {/* Estado: sin búsqueda aún */}
        {!data && !errorData && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <span className="material-symbols-outlined text-6xl text-zinc-200">local_shipping</span>
            <p className="text-on-surface-variant font-medium text-sm max-w-xs">
              Ingresa tu número de guía, ID de orden o correo electrónico para ver el estado de tu envío.
            </p>
          </div>
        )}

        {/* Estado: error / no encontrado */}
        {errorData && (
          <div className="max-w-2xl mx-auto py-12 flex flex-col items-center text-center gap-5">
            <span className="material-symbols-outlined text-5xl text-zinc-300">search_off</span>
            <div>
              <p className="font-bold text-on-surface mb-2">{errorData.error}</p>
              {errorData.hint && (
                <p className="text-sm text-on-surface-variant leading-relaxed">{errorData.hint}</p>
              )}
            </div>
            <a
              href="mailto:contacto@lacascarita.mx"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-sm">mail</span>
              Contactar por correo
            </a>
          </div>
        )}

        {/* Estado: resultado encontrado */}
        {data && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-zinc-400 font-medium">
              Mostrando orden <span className="font-black text-on-surface">{data.orderId.slice(0, 8)}…</span>
            </p>
            <button
              onClick={() => { setData(null); setInput('') }}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Nueva consulta
            </button>
          </div>
        )}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Panel principal */}
            <section className="lg:col-span-8 space-y-6">

              {/* Status hero */}
              <div className="relative h-[260px] w-full bg-surface-container overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 kinetic-gradient opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />

                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-label text-[10px] font-black uppercase tracking-widest">
                    {data.statusLabel}
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-4">
                  <div className="bg-primary text-white p-4 flex-1 min-w-[140px]">
                    <span className="font-label text-[10px] uppercase tracking-[0.2em] opacity-70 block mb-1">Estado</span>
                    <h2 className="font-headline font-bold text-xl uppercase italic tracking-tight">{data.statusLabel}</h2>
                    <p className="text-xs mt-1 opacity-90">{data.product}</p>
                  </div>
                  <div className="bg-white text-primary p-4 flex-1 min-w-[140px]">
                    <span className="font-label text-[10px] uppercase tracking-[0.2em] text-zinc-400 block mb-1">Entrega estimada</span>
                    <h2 className="font-headline font-bold text-xl uppercase italic tracking-tight text-on-surface">{data.eta}</h2>
                    {data.etaWindow && <p className="text-xs mt-1 text-zinc-400">{data.etaWindow}</p>}
                  </div>
                </div>

                <span className="material-symbols-outlined text-[8rem] text-primary/10">local_shipping</span>
              </div>

              {/* Stepper */}
              <div className="bg-surface-container-lowest p-6 sm:p-8">
                <div className="relative flex justify-between items-start">
                  <div className="absolute top-5 left-0 w-full h-[2px] bg-surface-container" />
                  <div
                    className="absolute top-5 left-0 h-[2px] bg-primary transition-all duration-500"
                    style={{ width: stepIndex < 0 ? '0%' : `${(stepIndex / (data.steps.length - 1)) * 100}%` }}
                  />

                  {data.steps.map((step) => (
                    <div key={step.label} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`flex items-center justify-center mb-4 transition-all ${
                          step.active
                            ? 'w-12 h-12 -mt-1 bg-primary text-white ring-8 ring-white'
                            : step.done
                            ? 'w-10 h-10 bg-primary text-white'
                            : 'w-10 h-10 bg-surface-container text-zinc-400'
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-sm ${step.active ? 'text-xl animate-pulse' : ''}`}
                          style={step.done ? { fontVariationSettings: "'FILL' 1" } : undefined}
                        >
                          {step.icon}
                        </span>
                      </div>
                      <span
                        className={`font-label text-[10px] font-black uppercase tracking-tighter text-center max-w-[60px] ${
                          step.active ? 'text-primary' : step.done ? 'text-on-surface' : 'text-zinc-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historial de eventos Estafeta */}
              {data.events.length > 0 ? (
                <div className="bg-surface-container-lowest p-6 sm:p-8 space-y-4">
                  <h3 className="font-headline font-black uppercase tracking-tighter text-lg mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">timeline</span>
                    Historial de movimientos
                  </h3>
                  {data.events.map((ev, i) => (
                    <div key={i} className="flex gap-4 pb-4 border-b border-surface-container last:border-0">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <p className="text-sm font-bold">{ev.desc}</p>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">
                          {ev.date}{ev.location ? ` · ${ev.location}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : data.status === 'SHIPPED' && data.trackingNumber ? (
                <div className="bg-surface-container-lowest p-6 text-center">
                  <p className="text-sm text-on-surface-variant mb-3">
                    Tu guía ya fue generada. El historial de movimientos aparecerá en cuanto Estafeta registre el primer escaneo.
                  </p>
                  {data.trackingUrl && (
                    <a
                      href={data.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border border-primary text-primary px-5 py-2.5 font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      Ver en Estafeta
                    </a>
                  )}
                </div>
              ) : null}
            </section>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-4">

              {/* Resumen del pedido */}
              <div className="bg-surface-container-lowest p-6">
                <h3 className="font-headline font-black uppercase tracking-widest text-xs mb-5 border-b border-surface-container pb-3">
                  Resumen del Pack
                </h3>
                <div className="flex gap-4 mb-5">
                  <div className="w-16 h-16 bg-surface-container shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-zinc-300">inventory_2</span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="font-label text-[10px] uppercase tracking-widest text-primary mb-0.5">LA CASCARITA</span>
                    <p className="font-headline font-extrabold uppercase leading-tight text-sm">{data.product}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-surface-container pt-3">
                  <span className="text-zinc-400 uppercase tracking-widest font-bold">Total</span>
                  <span className="font-headline font-black text-xl text-primary">{data.total}</span>
                </div>
              </div>

              {/* Dirección */}
              <div className="bg-surface-container p-5">
                <h3 className="font-headline font-black uppercase tracking-widest text-xs mb-3">Punto de Entrega</h3>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-lg mt-0.5">location_on</span>
                  <p className="text-xs text-zinc-500 leading-relaxed">{data.address}</p>
                </div>
              </div>

              {/* Guía */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-surface-container-low p-4">
                  <span className="font-label text-[8px] uppercase tracking-[0.2em] text-zinc-400 block mb-1">Guía Estafeta</span>
                  <span className="font-headline font-bold text-xs uppercase break-all">
                    {data.trackingNumber ?? 'Pendiente'}
                  </span>
                </div>
                <div className="bg-surface-container-low p-4">
                  <span className="font-label text-[8px] uppercase tracking-[0.2em] text-zinc-400 block mb-1">Paquetería</span>
                  <span className="font-headline font-bold text-xs uppercase">{data.carrier}</span>
                </div>
              </div>

              {/* Botón ver en Estafeta */}
              {data.trackingUrl && (
                <a
                  href={data.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-surface-container-lowest border border-zinc-200 text-on-surface py-3.5 font-headline font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  Ver en Estafeta
                </a>
              )}

              {/* Soporte */}
              <a
                href="mailto:contacto@lacascarita.mx"
                className="w-full bg-primary text-white py-4 font-headline font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm">support_agent</span>
                Contactar Soporte
              </a>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function RastreoPage() {
  return (
    <Suspense>
      <RastreoContent />
    </Suspense>
  )
}
