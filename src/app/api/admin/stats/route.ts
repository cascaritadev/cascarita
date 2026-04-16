import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

function isAdmin(email?: string | null) {
  return email && ADMIN_EMAIL && email === ADMIN_EMAIL
}

const PAID_STATUSES = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      status: true,
      boxType: true,
      talla: true,
      exclusiones: true,
      amountTotal: true,
      shippingCity: true,
      shippingState: true,
      shippedAt: true,
      createdAt: true,
    },
  })

  const usersCount = await prisma.user.count()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const paidOrders = orders.filter((o) => PAID_STATUSES.includes(o.status))
  const monthOrders = paidOrders.filter((o) => o.createdAt >= startOfMonth)
  const prevMonthOrders = paidOrders.filter(
    (o) => o.createdAt >= startOfPrevMonth && o.createdAt <= endOfPrevMonth
  )

  const totalRevenue = paidOrders.reduce((s, o) => s + o.amountTotal, 0)
  const monthRevenue = monthOrders.reduce((s, o) => s + o.amountTotal, 0)
  const prevMonthRevenue = prevMonthOrders.reduce((s, o) => s + o.amountTotal, 0)

  const avgTicket = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0

  const revenueGrowth =
    prevMonthRevenue > 0
      ? Math.round(((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
      : monthRevenue > 0
      ? 100
      : 0

  // Status distribution
  const statusCounts: Record<string, number> = {
    PENDING: 0, PAID: 0, PROCESSING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0,
  }
  for (const o of orders) statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1

  // Conversion: PAID → SHIPPED → DELIVERED
  const conversionPaid = paidOrders.length
  const conversionShipped = paidOrders.filter((o) => ['SHIPPED', 'DELIVERED'].includes(o.status)).length
  const conversionDelivered = paidOrders.filter((o) => o.status === 'DELIVERED').length

  // Rankings
  function ranking<T extends string>(items: T[]): { key: T; count: number }[] {
    const map = new Map<T, number>()
    for (const it of items) map.set(it, (map.get(it) ?? 0) + 1)
    return [...map.entries()]
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
  }

  const boxRanking = ranking(paidOrders.map((o) => o.boxType))
  const tallaRanking = ranking(paidOrders.map((o) => o.talla))
  const cityRanking = ranking(
    paidOrders
      .filter((o) => o.shippingCity)
      .map((o) => `${o.shippingCity}, ${o.shippingState ?? ''}`.trim())
  ).slice(0, 10)
  const stateRanking = ranking(
    paidOrders.filter((o) => o.shippingState).map((o) => o.shippingState as string)
  ).slice(0, 10)
  const exclusionRanking = ranking(paidOrders.flatMap((o) => o.exclusiones)).slice(0, 10)

  // Sales last 30 days (by day)
  const days = 30
  const salesByDay: { date: string; revenue: number; orders: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const next = new Date(day)
    next.setDate(next.getDate() + 1)
    const dayOrders = paidOrders.filter((o) => o.createdAt >= day && o.createdAt < next)
    salesByDay.push({
      date: day.toISOString().split('T')[0],
      revenue: dayOrders.reduce((s, o) => s + o.amountTotal, 0),
      orders: dayOrders.length,
    })
  }

  // Avg time to ship (days between createdAt and shippedAt)
  const shippedWithDates = paidOrders.filter((o) => o.shippedAt)
  const avgShipDays =
    shippedWithDates.length > 0
      ? shippedWithDates.reduce((s, o) => {
          const diff = (o.shippedAt!.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          return s + diff
        }, 0) / shippedWithDates.length
      : 0

  // Resumen ejecutivo (auto-generado)
  const insights: string[] = []
  if (boxRanking[0]) {
    insights.push(
      `La caja más vendida es "${boxRanking[0].key}" con ${boxRanking[0].count} pedido(s) — representa el ${
        Math.round((boxRanking[0].count / Math.max(paidOrders.length, 1)) * 100)
      }% de las ventas.`
    )
  }
  if (tallaRanking[0]) {
    insights.push(`La talla más pedida es "${tallaRanking[0].key.toUpperCase()}" — considera mantener stock prioritario.`)
  }
  if (cityRanking[0]) {
    insights.push(`${cityRanking[0].key} concentra el mayor número de pedidos (${cityRanking[0].count}).`)
  }
  if (exclusionRanking[0]) {
    insights.push(
      `El equipo más excluido es "${exclusionRanking[0].key}" (${exclusionRanking[0].count} clientes lo evitan) — evalúa reducir su inventario.`
    )
  }
  if (revenueGrowth !== 0) {
    insights.push(
      revenueGrowth > 0
        ? `Los ingresos del mes crecieron ${revenueGrowth}% vs. el mes anterior.`
        : `Los ingresos del mes bajaron ${Math.abs(revenueGrowth)}% vs. el mes anterior — revisa campañas activas.`
    )
  }
  if (statusCounts.PENDING > 0) {
    insights.push(`Hay ${statusCounts.PENDING} pedido(s) PENDIENTES sin pago confirmado.`)
  }
  if (statusCounts.PAID > 0) {
    insights.push(`Hay ${statusCounts.PAID} pedido(s) pagados pendientes de procesar.`)
  }
  if (avgShipDays > 0) {
    insights.push(`Tiempo promedio para enviar un pedido: ${avgShipDays.toFixed(1)} día(s).`)
  }

  return NextResponse.json({
    kpis: {
      totalRevenue,
      monthRevenue,
      prevMonthRevenue,
      revenueGrowth,
      totalOrders: orders.length,
      paidOrders: paidOrders.length,
      monthOrders: monthOrders.length,
      avgTicket,
      avgShipDays: Number(avgShipDays.toFixed(1)),
      usersCount,
    },
    statusCounts,
    conversion: {
      paid: conversionPaid,
      shipped: conversionShipped,
      delivered: conversionDelivered,
    },
    rankings: {
      boxes: boxRanking,
      tallas: tallaRanking,
      cities: cityRanking,
      states: stateRanking,
      exclusions: exclusionRanking,
    },
    salesByDay,
    insights,
  })
}
