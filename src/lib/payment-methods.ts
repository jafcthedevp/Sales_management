/**
 * Definición y categorización de métodos de pago
 */

export type PaymentCategory =
  | 'LIVE'
  | 'PUBLICIDAD'
  | 'TIKTOK'
  | 'TRANSFERENCIA'
  | 'OTROS'

export type PaymentCompany = 'OVERSHARK' | 'BRAVOS' | 'OTROS'

export interface PaymentMethod {
  code: string
  description: string
  category: PaymentCategory
  company: PaymentCompany
  bank?: string // Para transferencias
}

// Base de datos de métodos de pago
export const PAYMENT_METHODS: PaymentMethod[] = [
  // OVERSHARK - Lives
  { code: 'L1-000', description: 'Live Overshark 1 (000)', category: 'LIVE', company: 'OVERSHARK' },
  { code: 'L2-378', description: 'Live Overshark 2 (378)', category: 'LIVE', company: 'OVERSHARK' },
  { code: 'L3-711', description: 'Live Overshark 3 (711)', category: 'LIVE', company: 'OVERSHARK' },
  { code: 'L4-138', description: 'Live Overshark 4 (138)', category: 'LIVE', company: 'OVERSHARK' },

  // OVERSHARK - Publicidad
  { code: 'P1/556', description: 'Publicidad Overshark 1 (556)', category: 'PUBLICIDAD', company: 'OVERSHARK' },
  { code: 'P1-A/375', description: 'Publicidad Overshark 1-A (375)', category: 'PUBLICIDAD', company: 'OVERSHARK' },
  { code: 'P2/576', description: 'Publicidad Overshark 2 (576)', category: 'PUBLICIDAD', company: 'OVERSHARK' },
  { code: 'P3/825', description: 'Publicidad Overshark 3 (825)', category: 'PUBLICIDAD', company: 'OVERSHARK' },
  { code: 'P4/101', description: 'Publicidad Overshark 4 (101)', category: 'PUBLICIDAD', company: 'OVERSHARK' },
  { code: 'P4-A/262', description: 'Publicidad Overshark 4-A (262)', category: 'PUBLICIDAD', company: 'OVERSHARK' },
  { code: 'P5/795', description: 'Publicidad Overshark 5 (795)', category: 'PUBLICIDAD', company: 'OVERSHARK' },

  // OVERSHARK - TikTok
  { code: 'TK1/320', description: 'TikTok Overshark 1 (320)', category: 'TIKTOK', company: 'OVERSHARK' },
  { code: 'TK2/505', description: 'TikTok Overshark 2 (505)', category: 'TIKTOK', company: 'OVERSHARK' },
  { code: 'TK3/016', description: 'TikTok Overshark 3 (016)', category: 'TIKTOK', company: 'OVERSHARK' },
  { code: 'TK6/600', description: 'TikTok Overshark 6 (600)', category: 'TIKTOK', company: 'OVERSHARK' },

  // OVERSHARK - Transferencias
  { code: 'TRANSF. 0102', description: 'Transferencia Interbank (0102)', category: 'TRANSFERENCIA', company: 'OVERSHARK', bank: 'Interbank' },
  { code: 'TRANSF. 5094', description: 'Transferencia BCP (5094)', category: 'TRANSFERENCIA', company: 'OVERSHARK', bank: 'BCP' },

  // BRAVO'S - Transferencias
  { code: 'TRANSF. 4006', description: 'Transferencia Interbank (4006)', category: 'TRANSFERENCIA', company: 'BRAVOS', bank: 'Interbank' },
  { code: 'TRANSF. 0040', description: 'Transferencia BCP (0040)', category: 'TRANSFERENCIA', company: 'BRAVOS', bank: 'BCP' },

  // BRAVO'S - Publicidad y Live
  { code: 'PUB BRAV/829', description: 'Publicidad Bravo\'s (829)', category: 'PUBLICIDAD', company: 'BRAVOS' },
  { code: 'LIVE BRAV/402', description: 'Live Bravo\'s (402)', category: 'LIVE', company: 'BRAVOS' },
]

// Mapa para búsqueda rápida
const PAYMENT_MAP = new Map(PAYMENT_METHODS.map(pm => [pm.code.toUpperCase(), pm]))

/**
 * Categoriza un método de pago
 */
export function categorizePaymentMethod(methodCode: string): PaymentMethod | null {
  if (!methodCode) return null

  const normalized = methodCode.trim().toUpperCase()

  // Búsqueda exacta
  const exact = PAYMENT_MAP.get(normalized)
  if (exact) return exact

  // Búsqueda parcial (para casos donde el código no coincida exactamente)
  for (const [code, method] of PAYMENT_MAP.entries()) {
    if (normalized.includes(code) || code.includes(normalized)) {
      return method
    }
  }

  return {
    code: methodCode,
    description: methodCode,
    category: 'OTROS',
    company: 'OTROS'
  }
}

/**
 * Obtiene el nombre amigable de una categoría
 */
export function getCategoryName(category: PaymentCategory): string {
  const names: Record<PaymentCategory, string> = {
    'LIVE': 'Lives',
    'PUBLICIDAD': 'Publicidad',
    'TIKTOK': 'TikTok',
    'TRANSFERENCIA': 'Transferencias Bancarias',
    'OTROS': 'Otros'
  }
  return names[category]
}

/**
 * Obtiene el color asociado a una categoría
 */
export function getCategoryColor(category: PaymentCategory): string {
  const colors: Record<PaymentCategory, string> = {
    'LIVE': '#db2777',           // Rosa
    'PUBLICIDAD': '#ea580c',     // Naranja
    'TIKTOK': '#6366f1',         // Índigo
    'TRANSFERENCIA': '#059669',  // Verde
    'OTROS': '#6b7280'           // Gris
  }
  return colors[category]
}

/**
 * Obtiene el color asociado a una empresa
 */
export function getCompanyColor(company: PaymentCompany): string {
  const colors: Record<PaymentCompany, string> = {
    'OVERSHARK': '#0ea5e9', // Cyan
    'BRAVOS': '#f59e0b',    // Amber
    'OTROS': '#6b7280'      // Gris
  }
  return colors[company]
}

/**
 * Agrupa métodos de pago por categoría
 */
export function groupByCategory(): Map<PaymentCategory, PaymentMethod[]> {
  const groups = new Map<PaymentCategory, PaymentMethod[]>()

  for (const method of PAYMENT_METHODS) {
    const existing = groups.get(method.category) || []
    existing.push(method)
    groups.set(method.category, existing)
  }

  return groups
}

/**
 * Agrupa métodos de pago por empresa
 */
export function groupByCompany(): Map<PaymentCompany, PaymentMethod[]> {
  const groups = new Map<PaymentCompany, PaymentMethod[]>()

  for (const method of PAYMENT_METHODS) {
    const existing = groups.get(method.company) || []
    existing.push(method)
    groups.set(method.company, existing)
  }

  return groups
}
