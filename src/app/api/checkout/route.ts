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
  tipo: z.string().min(1), // 'ligamx' | 'internacional' | 'selecciones' | 'retro'
  exclusiones: z.array(z.string()).max(5).optional(),
})

const CheckoutSchema = z.object({
  items: z.array(CartItemSchema).min(1).max(10),
  promoCode: z.string().trim().min(1).max(40).optional(),
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

    const { items, promoCode } = parsed.data
    const session = await getServerSession(authOptions)
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

    // Resolver promotion code (si lo hay) a su ID de Stripe
    let discounts: { promotion_code: string }[] | undefined
    let promoMetadata: { code?: string; person?: string; type?: string } = {}
    let isFreePromo = false
    if (promoCode) {
      const list = await getStripe().promotionCodes.list({
        code: promoCode.toUpperCase(),
        active: true,
        limit: 1,
        expand: ['data.coupon'],
      })
      const promo = list.data[0]
      if (!promo) {
        return NextResponse.json({ error: 'Código promocional inválido.' }, { status: 400 })
      }
      if (promo.max_redemptions && promo.times_redeemed >= promo.max_redemptions) {
        return NextResponse.json({ error: 'Este código ya fue utilizado.' }, { status: 400 })
      }
      promoMetadata = {
        code: promo.code,
        person: (promo.metadata?.person as string) ?? '',
        type: (promo.metadata?.type as string) ?? '',
      }
      // Calcular total después del descuento para verificar mínimo de Stripe ($10 MXN)
      const subtotal = items.reduce((sum, item) => sum + getBoxPrice(item.boxId, item.tipo), 0)
      const coupon = promo.coupon
      let totalAfterDiscount = subtotal
      if (coupon.percent_off) {
        totalAfterDiscount = Math.round(subtotal * (1 - coupon.percent_off / 100))
      } else if (coupon.amount_off) {
        totalAfterDiscount = Math.max(0, subtotal - coupon.amount_off)
      }
      // $15 mínimo solo aplica si TODAS las cajas son individuales (debutante)
      const soloIndividuales = items.every((i) => i.boxId === 'debutante')
      if (totalAfterDiscount < 1500 && soloIndividuales) {
        isFreePromo = true
      } else {
        discounts = [{ promotion_code: promo.id }]
      }
    }

    // Build Stripe line_items from cart
    // Código 100% off → cobrar $15 MXN fijos por caja (Stripe requiere mínimo $10 MXN)
    const FREE_PROMO_AMOUNT = 1500 // centavos = $15.00 MXN
    const line_items = items.map((item) => {
      const boxInfo = BOX_PRICES[item.boxId]
      return {
        quantity: 1,
        price_data: {
          currency: 'mxn',
          unit_amount: isFreePromo ? FREE_PROMO_AMOUNT : getBoxPrice(item.boxId, item.tipo),
          product_data: {
            name: boxInfo.name,
            description: [
              isFreePromo ? 'Precio especial con código 100% de descuento' : boxInfo.description,
              `Tipo: ${item.tipo}`,
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
      promoCode: promoMetadata.code ?? '',
      promoPerson: promoMetadata.person ?? '',
      promoType: promoMetadata.type ?? '',
    }

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: 'payment',
      currency: 'mxn',
      line_items,
      ...(discounts ? { discounts } : { allow_promotion_codes: true }),
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
