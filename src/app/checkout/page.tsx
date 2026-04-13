'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const BOX_INFO: Record<string, { name: string; price: number; priceDisplay: string; originalPrice: string }> = {
  debutante: { name: 'Debutante (1 Jersey)', price: 89900, priceDisplay: '$899.00', originalPrice: '$1,199.00' },
  doble: { name: 'Doble (2 Jerseys)', price: 159900, priceDisplay: '$1,599.00', originalPrice: '$2,399.00' },
  'hat-trick': { name: 'Hat-Trick (3 Jerseys)', price: 259900, priceDisplay: '$2,599.00', originalPrice: '$3,599.00' },
  'jersey-club': { name: 'Jersey Club (4 Jerseys)', price: 339900, priceDisplay: '$3,399.00', originalPrice: '$4,799.00' },
}

function CheckoutContent() {
  const params = useSearchParams()
  const boxId = params.get('box') ?? 'debutante'
  const categoria = params.get('categoria') ?? 'Liga MX'
  const talla = params.get('talla') ?? 'M'
  const excl = params.get('excl') ?? ''
  const exclusiones = excl ? excl.split(',').filter(Boolean) : []

  const box = BOX_INFO[boxId] ?? BOX_INFO.debutante

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCheckout() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boxId, categoria, talla, exclusiones }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al procesar el pago.')
        setLoading(false)
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-6 py-12 md:py-20">
        {/* Breadcrumb */}
        <div className="mb-12 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <span className="font-label text-[10px] tracking-[0.2em] uppercase text-outline">CARRITO</span>
          <span className="material-symbols-outlined text-[12px] text-outline">chevron_right</span>
          <span className="font-label text-[10px] tracking-[0.2em] uppercase text-primary font-bold">REVISIÓN DEL PEDIDO</span>
          <span className="material-symbols-outlined text-[12px] text-outline">chevron_right</span>
          <span className="font-label text-[10px] tracking-[0.2em] uppercase text-outline">PAGO SEGURO (STRIPE)</span>
          <span className="material-symbols-outlined text-[12px] text-outline">chevron_right</span>
          <span className="font-label text-[10px] tracking-[0.2em] uppercase text-outline">CONFIRMACIÓN</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left: Order Details */}
          <div className="lg:col-span-7 space-y-10">
            <div>
              <h1 className="font-headline text-4xl font-black uppercase tracking-tighter mb-2">Revisa tu Pedido</h1>
              <p className="text-on-surface-variant text-sm">
                Confirma los detalles antes de proceder al pago seguro con Stripe.
              </p>
            </div>

            {/* Box summary */}
            <div className="bg-surface-container-low p-8 space-y-6">
              <h2 className="font-headline text-xl font-extrabold tracking-tight uppercase">Tu Caja Mystery</h2>

              <div className="flex gap-6 items-start">
                <div className="w-24 h-24 bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-4xl text-white/60">inventory_2</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm uppercase leading-tight tracking-wide mb-1">{box.name}</h3>
                  <div className="space-y-1 text-xs text-on-surface-variant">
                    <p><span className="font-bold uppercase">Categoría:</span> {categoria}</p>
                    <p><span className="font-bold uppercase">Talla:</span> {talla}</p>
                    {exclusiones.length > 0 && (
                      <p><span className="font-bold uppercase">Excluidos:</span> {exclusiones.join(', ')}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-headline font-extrabold text-lg">{box.priceDisplay}</span>
                  <span className="block text-[10px] font-bold text-primary-container bg-primary-fixed px-2 py-1 tracking-widest uppercase mt-1">
                    ENVÍO GRATIS
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping info */}
            <div className="bg-surface-container-low p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 bg-primary-container text-primary-fixed flex items-center justify-center font-headline font-bold text-sm">01</div>
                <h2 className="font-headline text-xl font-extrabold tracking-tight uppercase">Información de Envío</h2>
              </div>
              <div className="flex items-start gap-3 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary">info</span>
                <p>
                  Stripe Checkout recopilará tu dirección de envío de forma segura en el siguiente paso.
                  Acepta todas las tarjetas de crédito y débito.
                </p>
              </div>
            </div>

            {/* Payment info */}
            <div className="bg-surface-container-low p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 bg-primary-container text-primary-fixed flex items-center justify-center font-headline font-bold text-sm">02</div>
                <h2 className="font-headline text-xl font-extrabold tracking-tight uppercase">Método de Pago</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full border-2 border-primary-container flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary-container" />
                </div>
                <span className="font-bold text-sm uppercase tracking-wide">Stripe Checkout — Seguro y Encriptado</span>
                <span className="material-symbols-outlined text-outline">lock</span>
              </div>
              <div className="mt-4 flex gap-6 opacity-40 ml-8">
                {['VISA', 'MASTERCARD', 'AMEX'].map((card) => (
                  <span key={card} className="font-label text-[10px] tracking-[0.3em] font-bold">{card}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary + CTA */}
          <aside className="lg:col-span-5 lg:sticky lg:top-32">
            <div className="bg-surface-container-low p-8 space-y-8">
              <h3 className="font-headline text-xl font-extrabold tracking-tight uppercase">Resumen del Pedido</h3>

              <div className="space-y-4 pt-4 border-t border-outline-variant/30">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-outline uppercase tracking-wider text-[11px] font-bold">Subtotal</span>
                  <span className="font-medium">{box.originalPrice}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-emerald-700 uppercase tracking-wider text-[11px] font-bold">Descuento</span>
                  <span className="text-emerald-700 font-medium">
                    -${((parseFloat(box.originalPrice.replace(/[$,]/g, '')) - parseFloat(box.priceDisplay.replace(/[$,]/g, ''))).toFixed(2))}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-outline uppercase tracking-wider text-[11px] font-bold">Envío</span>
                  <span className="text-primary-container font-black uppercase tracking-tighter">GRATIS</span>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-on-surface/10">
                  <span className="font-headline font-black uppercase text-lg tracking-tighter">Total</span>
                  <div className="text-right">
                    <span className="block font-headline font-black text-2xl tracking-tighter">{box.priceDisplay}</span>
                    <span className="text-[10px] text-outline font-medium">MXN · IVA incluido</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container p-4 flex gap-4 items-center">
                <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified_user
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] leading-tight">Transacción Encriptada</p>
                  <p className="text-[9px] text-outline uppercase tracking-widest mt-0.5">Powered by Stripe · Seguridad SSL</p>
                </div>
              </div>

              {error && (
                <div className="bg-error-container text-error px-4 py-3 text-sm font-bold">{error}</div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-5 px-8 font-label font-bold uppercase tracking-[0.2em] text-sm hover:scale-[0.98] transition-transform flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {loading ? 'REDIRIGIENDO...' : 'Pagar con Stripe'}
                {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
              </button>

              <p className="text-[9px] text-center text-outline uppercase tracking-[0.2em]">
                Al comprar aceptas nuestros{' '}
                <a href="#" className="underline">Términos de Servicio</a>
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  )
}
