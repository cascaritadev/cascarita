import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { getStripe, BOX_PRICES } from '@/lib/stripe'
import { authOptions } from '@/lib/auth'

const CheckoutSchema = z.object({
  boxId: z.enum(['debutante', 'doble', 'hat-trick', 'jersey-club']),
  categoria: z.string().min(1),
  talla: z.string().min(1),
  exclusiones: z.array(z.string()).max(5).optional(),
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

    const { boxId, categoria, talla, exclusiones = [] } = parsed.data
    const session = await getServerSession(authOptions)
    const boxInfo = BOX_PRICES[boxId]
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

    // Metadata que viajará con la sesión de Stripe
    const metadata: Record<string, string> = {
      boxId,
      categoria,
      talla,
      exclusiones: exclusiones.join(','),
      userId: session?.user?.id ?? '',
      userEmail: session?.user?.email ?? '',
    }

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: 'payment',
      currency: 'mxn',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'mxn',
            unit_amount: boxInfo.price,
            product_data: {
              name: boxInfo.name,
              description: `${boxInfo.description} · Categoría: ${categoria} · Talla: ${talla}`,
              metadata: { boxId },
            },
          },
        },
      ],
      // Stripe recopila la dirección de envío
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
      cancel_url: `${baseUrl}/cajas`,
      locale: 'es',
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error('[CHECKOUT]', err)
    return NextResponse.json({ error: 'Error al crear sesión de pago.' }, { status: 500 })
  }
}
