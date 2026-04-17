import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

const [, , oldNameRaw, newNameRaw] = process.argv
if (!oldNameRaw || !newNameRaw) {
  console.error('Uso: npm run promo:rename -- <VIEJO> <NUEVO>')
  console.error('Ejemplo: npm run promo:rename -- CHICHARITO MARE')
  process.exit(1)
}

const OLD = oldNameRaw.toUpperCase()
const NEW = newNameRaw.toUpperCase()

const VARIANTS = [
  { suffix: '100', type: 'vip', maxRedemptions: 1 as number | undefined },
  { suffix: '10', type: 'influencer', maxRedemptions: undefined as number | undefined },
]

async function renameOne(suffix: string, type: string, maxRedemptions: number | undefined) {
  const oldCode = `${OLD}${suffix}`
  const newCode = `${NEW}${suffix}`

  console.log(`\n→ ${oldCode}  →  ${newCode}`)

  const existing = await stripe.promotionCodes.list({ code: oldCode, active: true, limit: 1 })
  if (existing.data.length === 0) {
    console.log(`  ! No hay promotion code activo con código ${oldCode} — se salta`)
    return
  }

  const old = existing.data[0]
  const couponId = typeof old.coupon === 'string' ? old.coupon : old.coupon.id

  // Verifica que el nuevo no exista ya activo
  const newExisting = await stripe.promotionCodes.list({ code: newCode, active: true, limit: 1 })
  if (newExisting.data.length > 0) {
    console.log(`  ! ${newCode} ya existe activo — se salta (revísalo manualmente)`)
    return
  }

  await stripe.promotionCodes.update(old.id, { active: false })
  console.log(`  ✓ ${oldCode} desactivado (${old.id})`)

  const created = await stripe.promotionCodes.create({
    coupon: couponId,
    code: newCode,
    ...(maxRedemptions ? { max_redemptions: maxRedemptions } : {}),
    metadata: { person: NEW, type },
  })
  console.log(`  ✓ ${newCode} creado (${created.id})`)
}

async function main() {
  console.log(`Renombrando ${OLD} → ${NEW} en Stripe...`)
  for (const v of VARIANTS) {
    await renameOne(v.suffix, v.type, v.maxRedemptions)
  }
  console.log('\n¡Listo!')
  console.log(`Ya puedes actualizar el array PEOPLE en scripts/create-promo-codes.ts y scripts/migrate-vip-discount.ts para reflejar el nuevo nombre.`)
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
