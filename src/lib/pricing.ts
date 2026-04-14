// Precios en centavos MXN, organizados por tipo de jersey y por caja

export const PRICES_BY_TIPO: Record<string, Record<string, number>> = {
  actual: {
    debutante: 89900,    // $899
    doble: 159900,       // $1,599
    'hat-trick': 259900, // $2,599
    'jersey-club': 339900, // $3,399
  },
  mundialista: {
    debutante: 89900,    // $899
    doble: 159900,       // $1,599
    'hat-trick': 259900, // $2,599
    'jersey-club': 339900, // $3,399
  },
  retro: {
    debutante: 99900,    // $999
    doble: 199800,       // $1,998
    'hat-trick': 299700, // $2,997
    'jersey-club': 399600, // $3,996
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
