import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTracking } from '@/lib/skydropx'

const STATUS_MAP: Record<string, { label: string; stepIndex: number }> = {
  PENDING: { label: 'Pedido Confirmado', stepIndex: 0 },
  PAID: { label: 'En Preparación', stepIndex: 1 },
  PROCESSING: { label: 'En Preparación', stepIndex: 1 },
  SHIPPED: { label: 'En Camino', stepIndex: 2 },
  DELIVERED: { label: 'Entregado', stepIndex: 3 },
  CANCELLED: { label: 'Cancelado', stepIndex: 0 },
}

const BOX_DISPLAY: Record<string, string> = {
  debutante: 'Debutante (1 Jersey)',
  doble: 'Doble (2 Jerseys)',
  'hat-trick': 'Hat-Trick (3 Jerseys)',
  'jersey-club': 'Jersey Club (4 Jerseys)',
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { trackingNumber: id }],
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 })
  }

  const statusInfo = STATUS_MAP[order.status] ?? { label: 'En proceso', stepIndex: 1 }
  const stepIndex = statusInfo.stepIndex

  // Si ya tiene envío en SkyDropX, obtener tracking en tiempo real
  let liveTracking = null
  if (order.skydropxShipmentId) {
    liveTracking = await getTracking(order.skydropxShipmentId)
  }

  const steps = [
    { icon: 'check_circle', label: 'Pedido Confirmado', done: stepIndex > 0, active: stepIndex === 0 },
    { icon: 'package_2', label: 'En Preparación', done: stepIndex > 1, active: stepIndex === 1 },
    { icon: 'local_shipping', label: 'En Camino', done: stepIndex > 2, active: stepIndex === 2 },
    { icon: 'home', label: 'Entregado', done: stepIndex > 3, active: stepIndex === 3 },
  ]

  const address = [
    order.shippingLine1,
    order.shippingLine2,
    order.shippingCity,
    `CP ${order.shippingZip}`,
    order.shippingCountry,
  ]
    .filter(Boolean)
    .join(', ')

  return NextResponse.json({
    orderId: order.id,
    status: order.status,
    statusLabel: statusInfo.label,
    eta: liveTracking?.estimated_delivery ?? 'Por confirmar',
    etaWindow: 'Ventana: 09:00 - 18:00',
    trackingNumber: order.trackingNumber ?? '—',
    trackingUrl: order.trackingUrl ?? null,
    carrier: order.carrier ?? 'SkyDropX',
    product: BOX_DISPLAY[order.boxType] ?? order.boxType,
    total: `$${(order.amountTotal / 100).toFixed(2)} MXN`,
    address: address || 'Dirección en proceso',
    steps,
    events: liveTracking?.events?.map((e) => ({
      date: new Date(e.occurred_at).toLocaleDateString('es-MX'),
      desc: e.description,
      location: e.location,
    })) ?? [],
  })
}
