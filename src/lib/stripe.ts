import Stripe from 'stripe'

// Lazy initialization — prevents build-time errors when env vars are not set
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  })
}

export const BOX_PRICES: Record<string, { name: string; price: number; description: string }> = {
  debutante: {
    name: 'Mystery Box Debutante',
    price: 119900, // centavos MXN = $1,199.00 MXN
    description: '1 Jersey auténtico de élite · Envío gratis',
  },
  doble: {
    name: 'Mystery Box Doble',
    price: 219900,
    description: '2 Jerseys auténticos · Envío gratis',
  },
  'hat-trick': {
    name: 'Mystery Box Hat-Trick',
    price: 329900,
    description: '3 Jerseys auténticos · Envío gratis',
  },
  'jersey-club': {
    name: 'Mystery Box Jersey Club',
    price: 349900,
    description: '4 Jerseys auténticos · Envío gratis · Mejor valor',
  },
}
