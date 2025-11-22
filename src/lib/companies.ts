/**
 * Librería central de empresas y métodos de pago
 *
 * Define la estructura de empresas (OVERSHARK y BRAVO'S) y
 * sus respectivos teléfonos/cuentas que reciben dinero
 */

export type Company = 'OVERSHARK' | 'BRAVOS' | 'OTROS'

export interface CompanyConfig {
  name: Company
  displayName: string
  color: string
  paymentMethods: string[]
}

/**
 * Configuración de OVERSHARK
 */
export const OVERSHARK_CONFIG: CompanyConfig = {
  name: 'OVERSHARK',
  displayName: 'OVERSHARK',
  color: '#0ea5e9', // Cyan
  paymentMethods: [
    // LIVE OVERSHARK
    'L1/000',
    'L2-X378',
    'L3-711',
    'L4-138',
    // PUBLICIDAD OVERSHARK
    'P1/556',
    'P1-A/375',
    'P2/576',
    'P3/825',
    'P4/101',
    'P4-A/262',
    'P5/795',
    // TIKTOK OVERSHARK
    'TK1/320',
    'TK2/505',
    'TK3/016',
    'TK6/600',
    // TRANSFERENCIAS BANCARIAS OVERSHARK
    'TRANSF. 0102 Cuenta bancaria', // Interbank
    'TRANSF. 5094 Cuenta bancaria', // BCP
  ],
}

/**
 * Configuración de BRAVO'S
 */
export const BRAVOS_CONFIG: CompanyConfig = {
  name: 'BRAVOS',
  displayName: "BRAVO'S",
  color: '#f59e0b', // Amber
  paymentMethods: [
    // TRANSFERENCIAS BANCARIAS BRAVO'S
    'TRANSF. 4006 Cuenta bancaria', // Interbank (corregido de "INTERBANK" a formato consistente)
    'TRANSF. 0040 Cuenta bancaria', // BCP (corregido de "BCP" a formato consistente)
    // OTROS BRAVO'S
    'PUB BRAV/829',
    'LIVE BRAV/402',
  ],
}

/**
 * Todas las empresas configuradas
 */
export const COMPANIES: CompanyConfig[] = [OVERSHARK_CONFIG, BRAVOS_CONFIG]

/**
 * Mapa rápido de método de pago -> empresa
 */
const PAYMENT_METHOD_TO_COMPANY_MAP = new Map<string, Company>()

// Inicializar mapa
COMPANIES.forEach((company) => {
  company.paymentMethods.forEach((method) => {
    PAYMENT_METHOD_TO_COMPANY_MAP.set(method, company.name)
  })
})

/**
 * Determina la empresa basándose en el método de pago 1
 * @param metodoPago1 El método de pago 1 (teléfono/cuenta que recibe dinero)
 * @returns La empresa a la que pertenece o 'OTROS' si no se encuentra
 */
export function getCompanyFromPaymentMethod(metodoPago1: string | null): Company {
  if (!metodoPago1) return 'OTROS'

  // Buscar coincidencia exacta
  const company = PAYMENT_METHOD_TO_COMPANY_MAP.get(metodoPago1)
  if (company) return company

  // Si no hay coincidencia exacta, intentar con variaciones comunes
  // Normalizar: quitar espacios extras, convertir a mayúsculas
  const normalized = metodoPago1.trim().toUpperCase()

  // Buscar en el mapa con normalización
  for (const [method, comp] of PAYMENT_METHOD_TO_COMPANY_MAP.entries()) {
    if (method.toUpperCase() === normalized) {
      return comp
    }
  }

  // Si aún no se encuentra, buscar por patrones
  // OVERSHARK: L1-XXX, L2-XXX, P1/XXX, TK1/XXX, TRANSF. 0102, TRANSF. 5094
  if (
    /^L\d+-\d{3}$/i.test(metodoPago1) ||
    /^P\d+(-[A-Z])?\/\d{3}$/i.test(metodoPago1) ||
    /^TK\d+\/\d{3}$/i.test(metodoPago1) ||
    metodoPago1.includes('0102') ||
    metodoPago1.includes('5094')
  ) {
    return 'OVERSHARK'
  }

  // BRAVO'S: BRAV, 4006, 0040
  if (
    metodoPago1.toUpperCase().includes('BRAV') ||
    metodoPago1.includes('4006') ||
    metodoPago1.includes('0040')
  ) {
    return 'BRAVOS'
  }

  return 'OTROS'
}

/**
 * Obtiene todos los métodos de pago de una empresa
 * @param company La empresa
 * @returns Array de métodos de pago
 */
export function getPaymentMethodsByCompany(company: Company): string[] {
  if (company === 'OTROS') return []

  const config = COMPANIES.find((c) => c.name === company)
  return config?.paymentMethods || []
}

/**
 * Obtiene la configuración de una empresa
 * @param company La empresa
 * @returns Configuración de la empresa o undefined
 */
export function getCompanyConfig(company: Company): CompanyConfig | undefined {
  return COMPANIES.find((c) => c.name === company)
}

/**
 * Lista de todas las empresas disponibles para filtros
 */
export const COMPANY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Todas las empresas' },
  { value: 'OVERSHARK', label: 'OVERSHARK' },
  { value: 'BRAVOS', label: "BRAVO'S" },
  { value: 'OTROS', label: 'Otros' },
]

/**
 * Valida si una empresa es válida
 */
export function isValidCompany(value: string): value is Company {
  return value === 'OVERSHARK' || value === 'BRAVOS' || value === 'OTROS'
}
