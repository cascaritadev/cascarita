import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getEstafetaTrackingUrl } from '@/lib/estafeta'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

function isAdmin(email?: string | null) {
  return email && ADMIN_EMAIL && email === ADMIN_EMAIL
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { status, trackingNumber, estimatedDelivery } = body

  const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {}

  if (status) {
    updateData.status = status
    // Auto-registrar fecha de envío
    if (status === 'SHIPPED') updateData.shippedAt = new Date()
  }

  if (trackingNumber !== undefined) {
    updateData.trackingNumber = trackingNumber || null
    updateData.trackingUrl = trackingNumber ? getEstafetaTrackingUrl(trackingNumber) : null
    updateData.carrier = trackingNumber ? 'Estafeta' : null
  }

  // Override manual de fecha estimada (ISO string o null para limpiar)
  if (estimatedDelivery !== undefined) {
    updateData.estimatedDelivery = estimatedDelivery ? new Date(estimatedDelivery) : null
  }

  const order = await prisma.order.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json({ ok: true, order })
}

// GET todos los pedidos (solo admin)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  // Ignoramos el [id] y devolvemos todos — el admin page llama a /api/admin/orders/all
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      status: true,
      boxType: true,
      categoria: true,
      talla: true,
      exclusiones: true,
      amountTotal: true,
      trackingNumber: true,
      trackingUrl: true,
      shippingName: true,
      shippingCity: true,
      shippingState: true,
      shippedAt: true,
      estimatedDelivery: true,
      createdAt: true,
    },
  })

  return NextResponse.json(orders)
}
