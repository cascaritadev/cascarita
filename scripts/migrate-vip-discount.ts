import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

const PEOPLE = ['SAUL', 'MARE', 'MESSI', 'CR7']
const OLD_COUPON_ID = 'vip_free_jersey'
const NEW_COUPON_ID = 'vip_free_jersey_v2'
const NEW_AMOUNT_OFF = 79800 // $798

async function main() {
  console.log('1. Desactivando códigos VIP antiguos...')
  for (const name of PEOPLE) {
    const code = `${name}100`
    const list = await stripe.promotionCodes.list({ code, limit: 10 })
    for (const pc of list.data) {
      if (pc.coupon.id === OLD_COUPON_ID && pc.active) {
        await stripe.promotionCodes.update(pc.id, { active: false })
        console.log(`   ✓ ${code} desactivado (${pc.id})`)
      }
    }
  }

  console.log('\n2. Eliminando cupón viejo...')
  try {
    await stripe.coupons.del(OLD_COUPON_ID)
    console.log(`   ✓ Cupón ${OLD_COUPON_ID} eliminado`)
  } catch {
    console.log(`   = Cupón ${OLD_COUPON_ID} ya no existe (ok)`)
  }

  console.log('\n3. Creando cupón nuevo con $798 off...')
  let newCoupon: Stripe.Coupon
  try {
    newCoupon = await stripe.coupons.retrieve(NEW_COUPON_ID)
    console.log(`   = ${NEW_COUPON_ID} ya existía`)
  } catch {
    newCoupon = await stripe.coupons.create({
      id: NEW_COUPON_ID,
      name: 'VIP – Jersey Gratis',
      amount_off: NEW_AMOUNT_OFF,
      currency: 'mxn',
      duration: 'once',
    })
    console.log(`   ✓ ${newCoupon.id} creado`)
  }

  console.log('\n4. Recreando códigos VIP apuntando al cupón nuevo...')
  for (const name of PEOPLE) {
    const code = `${name}100`
    const existing = await stripe.promotionCodes.list({ code, active: true, limit: 1 })
    if (existing.data.length > 0 && existing.data[0].coupon.id === NEW_COUPON_ID) {
      console.log(`   = ${code} ya apunta al cupón nuevo`)
      continue
    }
    const pc = await stripe.promotionCodes.create({
      coupon: NEW_COUPON_ID,
      code,
      max_redemptions: 1,
      metadata: { person: name, type: 'vip' },
    })
    console.log(`   ✓ ${code} recreado (${pc.id})`)
  }

  console.log('\n¡Listo! Ahora los códigos VIP dan $798 off — el cliente paga mínimo $1.')
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
