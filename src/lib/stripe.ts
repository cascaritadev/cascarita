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
    price: 79900, // centavos MXN = $799.00 MXN
    description: '1 Jersey auténtico de élite · Envío gratis',
  },
  doble: {
    name: 'Mystery Box Doble',
    price: 158000, // $1,580.00 MXN
    description: '2 Jerseys auténticos · Envío gratis',
  },
  'hat-trick': {
    name: 'Mystery Box Hat-Trick',
    price: 224900, // $2,249.00 MXN
    description: '3 Jerseys auténticos · Envío gratis',
  },
  'jersey-club': {
    name: 'Mystery Box Jersey Club',
    price: 269900, // $2,699.00 MXN
    description: '4 Jerseys auténticos · Envío gratis · Mejor valor',
  },
}
