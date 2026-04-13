import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      boxType: true,
      categoria: true,
      talla: true,
      status: true,
      amountTotal: true,
      currency: true,
      trackingNumber: true,
      trackingUrl: true,
      carrier: true,
      createdAt: true,
    },
  })

  return NextResponse.json(orders)
}
