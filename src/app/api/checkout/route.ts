import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { getStripe, BOX_PRICES } from '@/lib/stripe'
import { getBoxPrice } from '@/lib/pricing'
import { authOptions } from '@/lib/auth'

const CartItemSchema = z.object({
  boxId: z.enum(['debutante', 'doble', 'hat-trick', 'jersey-club']),
  categoria: z.string().min(1),
  talla: z.string().min(1),
  tipo: z.string().min(1), // 'actual' | 'mundialista' | 'retro'
  exclusiones: z.array(z.string()).max(5).optional(),
})

const CheckoutSchema = z.object({
  items: z.array(CartItemSchema).min(1).max(10),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = CheckoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { items } = parsed.data
    const session = await getServerSession(authOptions)
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

    // Build Stripe line_items from cart
    const line_items = items.map((item) => {
      const boxInfo = BOX_PRICES[item.boxId]
      return {
        quantity: 1,
        price_data: {
          currency: 'mxn',
          unit_amount: getBoxPrice(item.boxId, item.tipo),
          product_data: {
            name: boxInfo.name,
            description: [
              boxInfo.description,
              `Tipo: ${item.tipo}`,
              `Categoría: ${item.categoria}`,
              `Talla: ${item.talla}`,
              item.exclusiones?.length ? `Sin: ${item.exclusiones.join(', ')}` : '',
            ]
              .filter(Boolean)
              .join(' · '),
            metadata: { boxId: item.boxId },
          },
        },
      }
    })

    // Summary metadata for webhook
    const metadata: Record<string, string> = {
      userId: session?.user?.id ?? '',
      userEmail: session?.user?.email ?? '',
      items: JSON.stringify(
        items.map((i) => ({
          boxId: i.boxId,
          categoria: i.categoria,
          talla: i.talla,
          tipo: i.tipo,
          exclusiones: (i.exclusiones ?? []).join(','),
        }))
      ),
    }

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: 'payment',
      currency: 'mxn',
      line_items,
      shipping_address_collection: {
        allowed_countries: ['MX'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'mxn' },
            display_name: 'Envío Express Gratis',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
      customer_email: session?.user?.email ?? undefined,
      metadata,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/carrito`,
      locale: 'es',
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error('[CHECKOUT]', err)
    return NextResponse.json({ error: 'Error al crear sesión de pago.' }, { status: 500 })
  }
}
