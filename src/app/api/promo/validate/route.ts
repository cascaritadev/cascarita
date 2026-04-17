import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getStripe } from '@/lib/stripe'

const Schema = z.object({
  code: z.string().trim().min(1).max(40),
})

export async function POST(req: NextRequest) {
  try {
    const parsed = Schema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ valid: false, error: 'Código inválido.' }, { status: 400 })
    }

    const code = parsed.data.code.toUpperCase()

    const list = await getStripe().promotionCodes.list({
      code,
      active: true,
      limit: 1,
      expand: ['data.coupon'],
    })

    if (list.data.length === 0) {
      return NextResponse.json({ valid: false, error: 'Código no encontrado o inactivo.' }, { status: 404 })
    }

    const promo = list.data[0]
    const coupon = promo.coupon

    if (promo.max_redemptions && promo.times_redeemed >= promo.max_redemptions) {
      return NextResponse.json({ valid: false, error: 'Este código ya fue utilizado.' }, { status: 410 })
    }

    const person = (promo.metadata?.person as string | undefined) ?? null
    const type = (promo.metadata?.type as string | undefined) ?? null

    return NextResponse.json({
      valid: true,
      promotionCodeId: promo.id,
      code: promo.code,
      amountOff: coupon.amount_off ?? null,
      percentOff: coupon.percent_off ?? null,
      person,
      type,
    })
  } catch (err) {
    console.error('[PROMO_VALIDATE]', err)
    return NextResponse.json({ valid: false, error: 'Error al validar.' }, { status: 500 })
  }
}
