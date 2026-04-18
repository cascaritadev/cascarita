import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { createShipment } from '@/lib/skydropx'

// Necesario para leer el raw body del webhook
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[WEBHOOK] Signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ── checkout.session.completed ──────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const meta = session.metadata ?? {}

    // Parsear items del metadata
    let firstItem = { boxId: meta.boxId ?? '', categoria: meta.categoria ?? '', talla: meta.talla ?? '', exclusiones: meta.exclusiones ?? '' }
    if (meta.items) {
      try {
        const parsed = JSON.parse(meta.items)
        if (Array.isArray(parsed) && parsed.length > 0) firstItem = parsed[0]
      } catch { /* mantener fallback */ }
    }

    const email = session.customer_details?.email ?? session.customer_email ?? meta.userEmail ?? ''

    // Promo code — preferir metadata (si fue pasado por nuestra API) y caer en la sesión expandida
    let promoCode = meta.promoCode || null
    let promoPerson = meta.promoPerson || null
    let promoType = meta.promoType || null
    const amountDiscount = session.total_details?.amount_discount ?? 0
    const amountSubtotal = session.amount_subtotal ?? null

    if (!promoCode && amountDiscount > 0) {
      try {
        const full = await getStripe().checkout.sessions.retrieve(session.id, {
          expand: ['total_details.breakdown.discounts.discount.promotion_code'],
        })
        const discount = full.total_details?.breakdown?.discounts?.[0]?.discount
        const promo = discount?.promotion_code
        if (promo && typeof promo !== 'string') {
          promoCode = promo.code
          promoPerson = (promo.metadata?.person as string) ?? null
          promoType = (promo.metadata?.type as string) ?? null
        }
      } catch (err) {
        console.warn('[WEBHOOK] No se pudo expandir promo:', err)
      }
    }

    // Dirección: shipping_details (versiones antiguas) o customer_details.address (API 2026-03+)
    const rawSession = session as unknown as Record<string, unknown>
    const collectedShipping = ((rawSession.collected_information as Record<string, unknown>)?.shipping_details ?? null) as { name?: string; address?: { line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string } } | null
    const shippingAddr = session.shipping_details?.address ?? collectedShipping?.address ?? session.customer_details?.address
    const shippingName = session.shipping_details?.name ?? collectedShipping?.name ?? session.customer_details?.name ?? null

    const orderData = {
      email,
      userId: meta.userId || null,
      stripePaymentId: session.payment_intent as string ?? null,
      status: 'PAID' as const,
      boxType: firstItem.boxId,
      categoria: firstItem.tipo ?? firstItem.categoria ?? '',
      talla: firstItem.talla ?? '',
      exclusiones: firstItem.exclusiones ? firstItem.exclusiones.split(',').filter(Boolean) : [],
      amountSubtotal,
      amountDiscount: amountDiscount || null,
      amountTotal: session.amount_total ?? 0,
      currency: session.currency ?? 'mxn',
      promoCode,
      promoPerson,
      promoType,
      shippingName,
      shippingLine1: shippingAddr?.line1 ?? null,
      shippingLine2: shippingAddr?.line2 ?? null,
      shippingCity: shippingAddr?.city ?? null,
      shippingState: shippingAddr?.state ?? null,
      shippingZip: shippingAddr?.postal_code ?? null,
      shippingCountry: shippingAddr?.country ?? null,
    }

    // 1. Crear o actualizar la orden (idempotente ante reenvíos del webhook)
    const order = await prisma.order.upsert({
      where: { stripeSessionId: session.id },
      create: { stripeSessionId: session.id, ...orderData },
      update: orderData,
    })

    // 2. Crear envío en SkyDropX (solo si tenemos dirección y aún no tiene guía)
    if (shippingAddr?.line1 && !order.trackingNumber) {
      const shipResult = await createShipment({
        boxType: firstItem.boxId,
        addressTo: {
          name: shippingName ?? '',
          phone: meta.phone ?? '',
          email,
          line1: shippingAddr.line1 ?? '',
          line2: shippingAddr.line2 ?? undefined,
          city: shippingAddr.city ?? '',
          state: shippingAddr.state ?? '',
          zip: shippingAddr.postal_code ?? '',
          country: shippingAddr.country ?? 'MX',
        },
      })

      if (!shipResult.error) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'SHIPPED',
            skydropxShipmentId: shipResult.id,
            trackingNumber: shipResult.tracking_number ?? null,
            trackingUrl: shipResult.tracking_url ?? null,
            carrier: shipResult.carrier ?? null,
          },
        })
      } else {
        // Hubo error con SkyDropX, marcar como PROCESSING para revisión manual
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PROCESSING' },
        })
        console.error(`[WEBHOOK] SkyDropX error for order ${order.id}:`, shipResult.error)
      }
    }

    console.log(`[WEBHOOK] Order ${order.id} processed for ${session.customer_email}`)
  }

  return NextResponse.json({ received: true })
}
