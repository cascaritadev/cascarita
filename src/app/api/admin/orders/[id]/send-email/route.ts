import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendOrderConfirmationEmail, sendShippingEmail, sendStatusEmail } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { type } = await req.json()
  const order = await prisma.order.findUnique({ where: { id: params.id } })
  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

  try {
    if (type === 'confirmation') {
      await sendOrderConfirmationEmail({
        orderId: order.id,
        email: order.email,
        shippingName: order.shippingName,
        boxType: order.boxType,
        categoria: order.categoria,
        talla: order.talla,
        exclusiones: order.exclusiones ?? [],
        amountTotal: order.amountTotal,
        amountSubtotal: order.amountSubtotal,
        amountDiscount: order.amountDiscount,
        promoCode: order.promoCode,
        shippingCity: order.shippingCity,
        shippingState: order.shippingState,
      })
    } else if (type === 'shipping') {
      if (!order.trackingNumber) {
        return NextResponse.json({ error: 'Este pedido no tiene guía aún.' }, { status: 400 })
      }
      await sendShippingEmail({
        orderId: order.id,
        email: order.email,
        shippingName: order.shippingName,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        carrier: order.carrier,
        estimatedDelivery: order.estimatedDelivery?.toISOString() ?? null,
      })
    } else if (type === 'status') {
      await sendStatusEmail({
        orderId: order.id,
        email: order.email,
        shippingName: order.shippingName,
        status: order.status,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
      })
    } else {
      return NextResponse.json({ error: 'Tipo de email inválido.' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[SEND_EMAIL]', err)
    return NextResponse.json({ error: 'Error al enviar el correo.' }, { status: 500 })
  }
}
