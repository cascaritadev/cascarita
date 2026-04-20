import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getEstafetaTracking, getEstafetaTrackingUrl } from '@/lib/estafeta'

function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from)
  let added = 0
  while (added < days) {
    d.setDate(d.getDate() + 1)
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) added++ // skip Sunday=0, Saturday=6
  }
  return d
}

const STATUS_MAP: Record<string, { label: string; stepIndex: number }> = {
  PENDING:    { label: 'Pedido Confirmado',  stepIndex: 0 },
  PAID:       { label: 'En Preparación',     stepIndex: 1 },
  PROCESSING: { label: 'En Preparación',     stepIndex: 1 },
  SHIPPED:    { label: 'En Camino',          stepIndex: 2 },
  DELIVERED:  { label: 'Entregado',          stepIndex: 3 },
  CANCELLED:  { label: 'Cancelado',          stepIndex: 0 },
}

const BOX_DISPLAY: Record<string, string> = {
  debutante:     'La Inicial (1 Jersey)',
  doble:         'Doblete (2 Jerseys)',
  'hat-trick':   'Hat-Trick (3 Jerseys)',
  'jersey-club': 'Poker (4 Jerseys)',
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()

  if (!q) {
    return NextResponse.json({ error: 'Falta el parámetro de búsqueda.' }, { status: 400 })
  }

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: q },
        { trackingNumber: q },
        { email: { equals: q, mode: 'insensitive' } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!order) {
    return NextResponse.json(
      {
        error: 'No encontramos ninguna orden con ese dato.',
        hint: 'Verifica tu número de guía, ID de orden o correo. Si crees que es un error, escríbenos a contacto@lacascarita.mx',
      },
      { status: 404 }
    )
  }

  const statusInfo = STATUS_MAP[order.status] ?? { label: 'En proceso', stepIndex: 1 }
  let stepIndex = statusInfo.stepIndex

  let liveTracking = null
  let liveEvents: { date: string; desc: string; location: string }[] = []
  let trackingUrl: string | null = order.trackingUrl ?? null

  if (order.trackingNumber) {
    trackingUrl = trackingUrl ?? getEstafetaTrackingUrl(order.trackingNumber)
    liveTracking = await getEstafetaTracking(order.trackingNumber)

    if (liveTracking.events.length > 0) {
      liveEvents = liveTracking.events.map((e) => ({
        date: e.date,
        desc: e.description,
        location: e.location,
      }))
    }

    if (liveTracking.status === 'D') stepIndex = 3
  }

  const steps = [
    { icon: 'check_circle',   label: 'Pedido Confirmado', done: stepIndex > 0, active: stepIndex === 0 },
    { icon: 'package_2',      label: 'En Preparación',    done: stepIndex > 1, active: stepIndex === 1 },
    { icon: 'local_shipping', label: 'En Camino',         done: stepIndex > 2, active: stepIndex === 2 },
    { icon: 'home',           label: 'Entregado',         done: stepIndex > 3, active: stepIndex === 3 },
  ]

  const address = [
    order.shippingLine1,
    order.shippingLine2,
    order.shippingCity,
    order.shippingState,
    `CP ${order.shippingZip}`,
  ].filter(Boolean).join(', ')

  const etaLabel = (() => {
    // 1. Estafeta API en tiempo real
    if (liveTracking?.estimatedDelivery) {
      return new Date(liveTracking.estimatedDelivery).toLocaleDateString('es-MX', {
        weekday: 'long', day: 'numeric', month: 'long',
      })
    }
    // 2. Override manual del admin
    if (order.estimatedDelivery) {
      return new Date(order.estimatedDelivery).toLocaleDateString('es-MX', {
        weekday: 'long', day: 'numeric', month: 'long',
      })
    }
    // 3. Calcular automáticamente: shippedAt + 5 días hábiles
    if (order.shippedAt) {
      const eta = addBusinessDays(order.shippedAt, 5)
      return eta.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
    }
    if (order.status === 'DELIVERED') return 'Entregado'
    if (order.status === 'SHIPPED') return 'Próximos 3-5 días hábiles'
    return 'Pendiente de envío'
  })()

  return NextResponse.json({
    orderId:        order.id,
    status:         order.status,
    statusLabel:    liveTracking?.statusLabel ?? statusInfo.label,
    eta:            etaLabel,
    etaWindow:      order.status === 'SHIPPED' ? '09:00 – 18:00 hrs' : '',
    trackingNumber: order.trackingNumber ?? null,
    trackingUrl,
    carrier:        'Estafeta',
    product:        BOX_DISPLAY[order.boxType] ?? order.boxType,
    total:          `$${(order.amountTotal / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
    address:        address || 'Dirección en proceso',
    steps,
    events:         liveEvents,
  })
}
