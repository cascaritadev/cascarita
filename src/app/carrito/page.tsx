'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnnouncementBar from '@/components/AnnouncementBar'
import { useCart } from '@/context/CartContext'

type AppliedPromo = {
  code: string
  amountOff: number | null
  percentOff: number | null
  person: string | null
  type: string | null
}

function formatMXN(cents: number) {
  return `$${(cents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

export default function CarritoPage() {
  const { items, removeItem, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [promoInput, setPromoInput] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [promo, setPromo] = useState<AppliedPromo | null>(null)

  const subtotal = items.reduce((sum, item) => sum + item.price, 0)
  const discount = promo
    ? promo.amountOff
      ? Math.min(promo.amountOff, subtotal)
      : promo.percentOff
      ? Math.round((subtotal * promo.percentOff) / 100)
      : 0
    : 0
  const total = Math.max(subtotal - discount, 0)
  const totalDisplay = formatMXN(total)

  async function handleApplyPromo() {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    setPromoLoading(true)
    setPromoError('')

    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok || !data.valid) {
        setPromoError(data.error || 'Código inválido.')
        setPromo(null)
      } else {
        setPromo({
          code: data.code,
          amountOff: data.amountOff ?? null,
          percentOff: data.percentOff ?? null,
          person: data.person ?? null,
          type: data.type ?? null,
        })
        setPromoInput(data.code)
      }
    } catch {
      setPromoError('Error de conexión.')
    } finally {
      setPromoLoading(false)
    }
  }

  function handleRemovePromo() {
    setPromo(null)
    setPromoInput('')
    setPromoError('')
  }

  async function handleCheckout() {
    if (items.length === 0) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            boxId: item.boxId,
            categoria: item.categoria,
            talla: item.talla,
            tipo: item.tipo,
            exclusiones: item.exclusiones,
          })),
          ...(promo ? { promoCode: promo.code } : {}),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al procesar el pago.')
        setLoading(false)
        return
      }

      clearCart()
      window.location.href = data.url
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-6 py-12 md:py-20">
        {/* Breadcrumb */}
        <div className="mb-12 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Link href="/cajas" className="font-label text-[10px] tracking-[0.2em] uppercase text-outline hover:text-primary transition-colors">
            MYSTERY BOX
          </Link>
          <span className="material-symbols-outlined text-[12px] text-outline">chevron_right</span>
          <span className="font-label text-[10px] tracking-[0.2em] uppercase text-primary font-bold">CARRITO</span>
          <span className="material-symbols-outlined text-[12px] text-outline">chevron_right</span>
          <span className="font-label text-[10px] tracking-[0.2em] uppercase text-outline">PAGO SEGURO (STRIPE)</span>
          <span className="material-symbols-outlined text-[12px] text-outline">chevron_right</span>
          <span className="font-label text-[10px] tracking-[0.2em] uppercase text-outline">CONFIRMACIÓN</span>
        </div>

        <h1 className="font-headline text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12">
          Tu Carrito
        </h1>

        {items.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-32 text-center gap-8">
            <span className="material-symbols-outlined text-[6rem] text-zinc-200">shopping_bag</span>
            <div>
              <h2 className="font-headline text-2xl font-black uppercase tracking-tighter text-zinc-400 mb-2">
                Tu carrito está vacío
              </h2>
              <p className="text-sm text-on-surface-variant">Agrega una Mystery Box para comenzar.</p>
            </div>
            <Link
              href="/cajas"
              className="kinetic-gradient text-white px-8 py-4 font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity rounded-lg"
            >
              Ver Mystery Boxes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* ── Left: Items ── */}
            <div className="lg:col-span-7 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-zinc-100 hover:border-primary/30 transition-colors rounded-xl overflow-hidden"
                >
                  <div className="h-1 w-full bg-gradient-to-r from-primary to-emerald-400" />
                  <div className="p-6 flex gap-5 items-start">
                    {/* Icono */}
                    <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white text-3xl">inventory_2</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-headline font-black text-base uppercase tracking-tight leading-tight mb-2">
                        {item.boxName}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                        <span>Talla: <span className="text-on-surface">{item.talla}</span></span>
                        <span>Categoría: <span className="text-on-surface">{item.categoria}</span></span>
                        <span>Tipo: <span className="text-on-surface capitalize">{item.tipo}</span></span>
                        <span>{item.jerseys} jersey{item.jerseys > 1 ? 's' : ''}</span>
                      </div>
                      {item.exclusiones.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="text-[10px] font-bold uppercase text-zinc-400 mr-1">Excl:</span>
                          {item.exclusiones.map((eq) => (
                            <span key={eq} className="text-[10px] bg-zinc-100 px-2 py-0.5 rounded-full font-bold uppercase">
                              {eq}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price + remove */}
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <span className="font-headline font-black text-xl text-primary">{item.priceDisplay}</span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear cart */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={clearCart}
                  className="text-zinc-400 hover:text-red-500 transition-colors text-[11px] font-bold uppercase tracking-widest flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">remove_shopping_cart</span>
                  Vaciar carrito
                </button>
              </div>
            </div>

            {/* ── Right: Summary ── */}
            <aside className="lg:col-span-5 lg:sticky lg:top-32">
              <div className="bg-surface-container-low p-8 rounded-xl space-y-8">
                <h3 className="font-headline text-xl font-extrabold tracking-tight uppercase">
                  Resumen del Pedido
                </h3>

                <div className="space-y-3 pt-4 border-t border-outline-variant/30">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="text-on-surface-variant font-medium truncate mr-2">{item.boxName}</span>
                      <span className="font-bold flex-shrink-0">{item.priceDisplay}</span>
                    </div>
                  ))}

                  <div className="flex justify-between items-center text-sm pt-2">
                    <span className="text-outline uppercase tracking-wider text-[11px] font-bold">Envío</span>
                    <span className="text-primary font-black uppercase text-[11px] tracking-wider">GRATIS</span>
                  </div>

                  {/* ── Promo code ── */}
                  <div className="pt-4 border-t border-outline-variant/30 space-y-2">
                    <label className="text-outline uppercase tracking-wider text-[11px] font-bold block">
                      Código promocional
                    </label>
                    {promo ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                          <div className="flex flex-col leading-tight">
                            <span className="font-bold text-xs text-emerald-800">{promo.code}</span>
                            <span className="text-[10px] text-emerald-700">
                              {promo.amountOff
                                ? `${formatMXN(promo.amountOff)} de descuento`
                                : `${promo.percentOff}% de descuento`}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={handleRemovePromo}
                          className="text-[10px] font-bold uppercase text-emerald-700 hover:text-red-600 tracking-widest"
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => {
                            setPromoInput(e.target.value.toUpperCase())
                            setPromoError('')
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                          placeholder=""
                          className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-primary"
                          maxLength={40}
                        />
                        <button
                          onClick={handleApplyPromo}
                          disabled={promoLoading || !promoInput.trim()}
                          className="bg-primary text-white px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition disabled:opacity-40"
                        >
                          {promoLoading ? '...' : 'Aplicar'}
                        </button>
                      </div>
                    )}
                    {promoError && (
                      <p className="text-[11px] text-red-600 font-bold">{promoError}</p>
                    )}
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center text-sm pt-2">
                      <span className="text-emerald-700 uppercase tracking-wider text-[11px] font-bold">Descuento</span>
                      <span className="text-emerald-700 font-bold">−{formatMXN(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-6 border-t border-on-surface/10">
                    <span className="font-headline font-black uppercase text-lg tracking-tighter">Total</span>
                    <div className="text-right">
                      {discount > 0 && (
                        <span className="block text-xs text-outline line-through font-bold">
                          {formatMXN(subtotal)}
                        </span>
                      )}
                      <span className="block font-headline font-black text-2xl tracking-tighter text-primary">
                        {totalDisplay}
                      </span>
                      <span className="text-[10px] text-outline font-medium">MXN · IVA incluido</span>
                    </div>
                  </div>
                </div>

                {/* Security badge */}
                <div className="bg-surface-container p-4 rounded-lg flex gap-4 items-center">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified_user
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] leading-tight">
                      Transacción Encriptada
                    </p>
                    <p className="text-[9px] text-outline uppercase tracking-widest mt-0.5">
                      Powered by Stripe · Seguridad SSL
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-bold">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading || items.length === 0}
                  className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-5 px-8 font-label font-bold uppercase tracking-[0.2em] text-sm hover:scale-[0.98] transition-transform flex items-center justify-center gap-3 disabled:opacity-60 rounded-lg"
                >
                  {loading ? (
                    'REDIRIGIENDO...'
                  ) : (
                    <>
                      Pagar con Stripe
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                    </>
                  )}
                </button>

                <div className="flex justify-center gap-6 opacity-40">
                  {['VISA', 'MASTERCARD', 'AMEX'].map((card) => (
                    <span key={card} className="font-label text-[10px] tracking-[0.3em] font-bold">
                      {card}
                    </span>
                  ))}
                </div>

                <p className="text-[9px] text-center text-outline uppercase tracking-[0.2em]">
                  Al comprar aceptas nuestros{' '}
                  <a href="#" className="underline">Términos de Servicio</a>
                </p>
              </div>

              {/* Seguir comprando */}
              <div className="mt-4 text-center">
                <Link
                  href="/cajas"
                  className="text-primary font-bold uppercase tracking-widest text-xs hover:underline flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Seguir comprando
                </Link>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
