import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

const PEOPLE = ['SAUL', 'MARE', 'MESSI', 'CR7']

const VIP_AMOUNT_OFF = 79800 // $798 MXN — deja $1 mínimo para no romper Stripe Checkout
const INFLUENCER_PERCENT_OFF = 10

async function ensureCoupon(params: Stripe.CouponCreateParams & { id: string }): Promise<Stripe.Coupon> {
  try {
    return await stripe.coupons.retrieve(params.id)
  } catch {
    return await stripe.coupons.create(params)
  }
}

async function ensurePromotionCode(params: Stripe.PromotionCodeCreateParams): Promise<Stripe.PromotionCode> {
  const existing = await stripe.promotionCodes.list({ code: params.code, limit: 1 })
  if (existing.data.length > 0) return existing.data[0]
  return await stripe.promotionCodes.create(params)
}

async function main() {
  console.log('Creando cupones...')

  const vipCoupon = await ensureCoupon({
    id: 'vip_free_jersey',
    name: 'VIP – Jersey Gratis',
    amount_off: VIP_AMOUNT_OFF,
    currency: 'mxn',
    duration: 'once',
  })
  console.log(`✓ Cupón VIP listo: ${vipCoupon.id}`)

  const influencerCoupon = await ensureCoupon({
    id: 'influencer_10',
    name: 'Influencer – 10% off',
    percent_off: INFLUENCER_PERCENT_OFF,
    duration: 'once',
  })
  console.log(`✓ Cupón Influencer listo: ${influencerCoupon.id}`)

  console.log('\nCreando códigos promocionales...')

  for (const name of PEOPLE) {
    const vipCode = `${name}100`
    const pubCode = `${name}10`

    const vip = await ensurePromotionCode({
      coupon: vipCoupon.id,
      code: vipCode,
      max_redemptions: 1,
      metadata: { person: name, type: 'vip' },
    })
    console.log(`✓ ${vipCode.padEnd(14)} → VIP 1-uso · $799 off · id=${vip.id}`)

    const pub = await ensurePromotionCode({
      coupon: influencerCoupon.id,
      code: pubCode,
      metadata: { person: name, type: 'influencer' },
    })
    console.log(`✓ ${pubCode.padEnd(14)} → 10% off multi-uso · id=${pub.id}`)
  }

  console.log('\n¡Listo! Los 8 códigos están activos en Stripe.')
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
