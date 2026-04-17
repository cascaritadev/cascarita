// Precios en centavos MXN, organizados por tipo de jersey y por caja

export const PRICES_BY_TIPO: Record<string, Record<string, number>> = {
  actual: {
    debutante: 79900,    // $799
    doble: 158000,       // $1,580
    'hat-trick': 224900, // $2,249
    'jersey-club': 269900, // $2,699
  },
  mundialista: {
    debutante: 79900,    // $799
    doble: 158000,       // $1,580
    'hat-trick': 224900, // $2,249
    'jersey-club': 269900, // $2,699
  },
  retro: {
    debutante: 79900,    // $799
    doble: 158000,       // $1,580
    'hat-trick': 224900, // $2,249
    'jersey-club': 269900, // $2,699
  },
}

export function getBoxPrice(boxId: string, tipo: string): number {
  const tipoKey = PRICES_BY_TIPO[tipo] ? tipo : 'actual'
  return PRICES_BY_TIPO[tipoKey][boxId] ?? PRICES_BY_TIPO.actual.debutante
}

export function formatMXN(centavos: number): string {
  return '$' + (centavos / 100).toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}
