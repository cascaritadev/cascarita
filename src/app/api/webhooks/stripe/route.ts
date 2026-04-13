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
    const shipping = session.shipping_details

    // 1. Crear la orden en la base de datos
    const order = await prisma.order.create({
      data: {
        email: session.customer_email ?? meta.userEmail ?? '',
        userId: meta.userId || null,
        stripeSessionId: session.id,
        stripePaymentId: session.payment_intent as string ?? null,
        status: 'PAID',
        boxType: meta.boxId,
        categoria: meta.categoria,
        talla: meta.talla,
        exclusiones: meta.exclusiones ? meta.exclusiones.split(',').filter(Boolean) : [],
        amountTotal: session.amount_total ?? 0,
        currency: session.currency ?? 'mxn',
        shippingName: shipping?.name ?? null,
        shippingLine1: shipping?.address?.line1 ?? null,
        shippingLine2: shipping?.address?.line2 ?? null,
        shippingCity: shipping?.address?.city ?? null,
        shippingState: shipping?.address?.state ?? null,
        shippingZip: shipping?.address?.postal_code ?? null,
        shippingCountry: shipping?.address?.country ?? null,
      },
    })

    // 2. Crear envío en SkyDropX (solo si tenemos dirección)
    if (shipping?.address?.line1) {
      const shipResult = await createShipment({
        boxType: meta.boxId,
        addressTo: {
          name: shipping.name ?? '',
          phone: meta.phone ?? '',
          email: session.customer_email ?? meta.userEmail ?? '',
          line1: shipping.address.line1 ?? '',
          line2: shipping.address.line2 ?? undefined,
          city: shipping.address.city ?? '',
          state: shipping.address.state ?? '',
          zip: shipping.address.postal_code ?? '',
          country: shipping.address.country ?? 'MX',
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
