import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendOrderConfirmationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { orderIds } = await req.json().catch(() => ({}))

  // Si se pasan IDs específicos, solo esos; si no, todas las PAID sin email enviado
  const orders = await prisma.order.findMany({
    where: orderIds?.length
      ? { id: { in: orderIds } }
      : { status: { in: ['PAID', 'PROCESSING', 'SHIPPED'] }, email: { not: '' } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const results: { id: string; email: string; ok: boolean; error?: string }[] = []

  for (const order of orders) {
    try {
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
      results.push({ id: order.id, email: order.email, ok: true })
    } catch (err) {
      results.push({ id: order.id, email: order.email, ok: false, error: String(err) })
    }
  }

  const sent = results.filter((r) => r.ok).length
  const failed = results.filter((r) => !r.ok).length

  return NextResponse.json({ sent, failed, results })
}
