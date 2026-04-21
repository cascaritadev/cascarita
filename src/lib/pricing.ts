// Precios en centavos MXN

const BASE_PRICES: Record<string, number> = {
  debutante: 79900,
  doble: 158000,
  'hat-trick': 224900,
  'jersey-club': 269900,
}

const BOX_JERSEY_COUNT: Record<string, number> = {
  debutante: 1,
  doble: 2,
  'hat-trick': 3,
  'jersey-club': 4,
}

const RETRO_SURCHARGE_PER_JERSEY = 20000 // $200 MXN

export const RETRO_SURCHARGE = RETRO_SURCHARGE_PER_JERSEY

export function getBoxPrice(boxId: string, tipo: string): number {
  const base = BASE_PRICES[boxId] ?? BASE_PRICES.debutante
  if (tipo === 'retro') {
    const count = BOX_JERSEY_COUNT[boxId] ?? 1
    return base + count * RETRO_SURCHARGE_PER_JERSEY
  }
  return base
}

// Para modo "Configurar": base + retro surcharge por slot retro
export function getMixBoxPrice(boxId: string, slots: { tipo: string }[]): number {
  const base = BASE_PRICES[boxId] ?? BASE_PRICES.debutante
  const retroCount = slots.filter((s) => s.tipo === 'retro').length
  return base + retroCount * RETRO_SURCHARGE_PER_JERSEY
}

export function formatMXN(centavos: number): string {
  return '$' + (centavos / 100).toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}
