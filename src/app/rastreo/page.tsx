'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

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
  trackingNumber: string
  carrier: string
  product: string
  total: string
  address: string
  steps: TrackingStep[]
  events: { date: string; desc: string; location: string }[]
}

const MOCK_DATA: TrackingData = {
  orderId: 'LC-00000',
  status: 'shipped',
  statusLabel: 'En Camino',
  eta: 'En proceso',
  etaWindow: 'Pendiente de detalles',
  trackingNumber: '—',
  carrier: 'SkyDropX',
  product: 'Mystery Box',
  total: '—',
  address: 'Ingresa tu número de orden',
  steps: [
    { icon: 'check_circle', label: 'Pedido Confirmado', done: false, active: false },
    { icon: 'package_2', label: 'En Preparación', done: false, active: false },
    { icon: 'local_shipping', label: 'En Camino', done: false, active: false },
    { icon: 'home', label: 'Entregado', done: false, active: false },
  ],
  events: [],
}

function RastreoContent() {
  const params = useSearchParams()
  const [orderId, setOrderId] = useState(params.get('order') ?? '')
  const [inputOrder, setInputOrder] = useState(params.get('order') ?? '')
  const [data, setData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch() {
    if (!inputOrder.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/tracking/${encodeURIComponent(inputOrder.trim())}`)
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'Pedido no encontrado.')
        setData(null)
      } else {
        setData(json)
        setOrderId(inputOrder.trim())
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    }

    setLoading(false)
  }

  const display = data ?? MOCK_DATA
  const stepIndex = display.steps.findIndex((s) => s.active)

  return (
    <div className="bg-background text-on-background font-body antialiased">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-label text-[10px] uppercase tracking-[0.3em] text-primary mb-2 block">
                Logística de Élite
              </span>
              <h1 className="font-headline font-black text-5xl md:text-7xl tracking-tighter uppercase text-primary leading-none">
                Rastrea tu <br />Unboxing
              </h1>
            </div>

            <div className="bg-surface-container-lowest p-6 flex flex-col items-start gap-1 border-l-4 border-primary">
              <span className="font-label text-[10px] uppercase tracking-widest text-secondary">
                Número de Orden
              </span>
              <span className="font-headline font-extrabold text-2xl tracking-tight">
                #{orderId || '—'}
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <input
              type="text"
              placeholder="Ej: LC-98234"
              value={inputOrder}
              onChange={(e) => setInputOrder(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-grow bg-surface-container border-0 focus:ring-2 focus:ring-primary py-4 px-6 text-sm font-medium outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="kinetic-gradient text-white px-8 py-4 font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? 'Buscando...' : 'Rastrear'}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-error text-sm font-bold">{error}</p>
          )}
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tracking Status */}
          <section className="lg:col-span-8 space-y-6">
            {/* Map placeholder */}
            <div className="relative h-[300px] w-full bg-surface-container overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 kinetic-gradient opacity-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />

              {/* Tech overlay top */}
              <div className="absolute top-4 left-4 bg-surface-container-lowest/80 backdrop-blur-md p-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-label text-[10px] font-black uppercase tracking-widest">
                    Live: {display.statusLabel}
                  </span>
                </div>
              </div>

              {/* Status cards */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-4">
                <div className="bg-primary text-white p-4 flex-1 min-w-[140px]">
                  <span className="font-label text-[10px] uppercase tracking-[0.2em] opacity-70 block mb-1">Estado Actual</span>
                  <h2 className="font-headline font-bold text-xl uppercase italic tracking-tight">{display.statusLabel}</h2>
                  <p className="font-body text-xs mt-1 opacity-90">{display.product}</p>
                </div>
                <div className="bg-surface-container-lowest text-primary p-4 flex-1 min-w-[140px]">
                  <span className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary block mb-1">Entrega Estimada</span>
                  <h2 className="font-headline font-bold text-xl uppercase italic tracking-tight text-on-surface">{display.eta}</h2>
                  <p className="font-body text-xs mt-1 text-on-surface-variant">{display.etaWindow}</p>
                </div>
              </div>

              {/* Map icon */}
              <span className="material-symbols-outlined text-[8rem] text-primary/10">map</span>
            </div>

            {/* Stepper */}
            <div className="bg-surface-container-lowest p-8">
              <div className="relative flex justify-between items-start">
                {/* Progress lines */}
                <div className="absolute top-5 left-0 w-full h-[2px] bg-surface-container" />
                <div
                  className="absolute top-5 left-0 h-[2px] bg-primary transition-all duration-500"
                  style={{ width: `${(stepIndex / (display.steps.length - 1)) * 100}%` }}
                />

                {display.steps.map((step, i) => (
                  <div key={step.label} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center mb-4 transition-all ${
                        step.active
                          ? 'w-12 h-12 -mt-1 bg-primary text-white ring-8 ring-white'
                          : step.done
                          ? 'w-10 h-10 bg-primary text-white'
                          : 'w-10 h-10 bg-surface-container text-outline'
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
                        step.active ? 'text-primary' : step.done ? 'text-on-surface' : 'text-outline'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Events */}
            {display.events.length > 0 && (
              <div className="bg-surface-container-lowest p-8 space-y-4">
                <h3 className="font-headline font-black uppercase tracking-tighter text-lg mb-6">Historial de Movimientos</h3>
                {display.events.map((ev, i) => (
                  <div key={i} className="flex gap-4 pb-4 border-b border-surface-container last:border-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold">{ev.desc}</p>
                      <p className="text-[10px] text-outline uppercase tracking-widest mt-0.5">{ev.date} · {ev.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Order Summary */}
            <div className="bg-surface-container-lowest p-6">
              <h3 className="font-headline font-black uppercase italic tracking-widest text-xs mb-6 border-b border-surface-container pb-2">
                Resumen del Pack
              </h3>
              <div className="flex gap-4 mb-6">
                <div className="w-24 h-24 bg-surface-container flex-shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-outline-variant">inventory_2</span>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="font-label text-[10px] uppercase tracking-widest text-primary mb-1">LA CASCARITA</span>
                  <p className="font-headline font-extrabold uppercase leading-tight">{display.product}</p>
                </div>
              </div>
              {display.total !== '—' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-label text-secondary uppercase tracking-widest">Total</span>
                    <span className="font-headline font-black text-2xl text-primary">{display.total}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Address */}
            <div className="bg-surface-container p-6">
              <h3 className="font-headline font-black uppercase italic tracking-widest text-xs mb-4">Punto de Entrega</h3>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <div>
                  <p className="font-headline font-bold uppercase text-sm mb-1">Domicilio</p>
                  <p className="text-xs text-secondary leading-relaxed">{display.address}</p>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-surface-container-low p-4">
                <span className="font-label text-[8px] uppercase tracking-[0.2em] text-secondary block mb-1">Guía</span>
                <span className="font-headline font-bold text-xs uppercase">{display.trackingNumber}</span>
              </div>
              <div className="bg-surface-container-low p-4">
                <span className="font-label text-[8px] uppercase tracking-[0.2em] text-secondary block mb-1">Couriers</span>
                <span className="font-headline font-bold text-xs uppercase">{display.carrier}</span>
              </div>
            </div>

            {/* Support */}
            <button className="w-full bg-primary text-white py-4 font-headline font-black uppercase italic tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all">
              <span>Contactar Soporte</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </aside>
        </div>
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
