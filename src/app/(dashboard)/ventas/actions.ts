'use server'

import { createClient } from '@/lib/supabase/server'
import type { Sale } from '@/types/database.types'
import { type Company, getPaymentMethodsByCompany, COMPANY_OPTIONS } from '@/lib/companies'

export interface SalesFilters {
  search?: string
  cel_vendedor?: string
  numero_cliente?: string
  metodo_pago?: string
  metodo_pago_1?: string
  empresa?: Company | '' | null // Nuevo filtro por empresa
  region?: 'LIMA' | 'PROVINCIA' | null
  fecha_desde?: string
  fecha_hasta?: string
  monto_min?: number
  monto_max?: number
}

export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SalesResponse {
  sales: Sale[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Obtener ventas con filtros y paginación
 */
export async function getSales(
  filters: SalesFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: 10 }
): Promise<SalesResponse> {
  const supabase = await createClient()

  // Construir query base
  let query = supabase
    .from('sales')
    .select('*', { count: 'exact' })

  // Aplicar filtros
  if (filters.search) {
    // Búsqueda global en múltiples campos
    query = query.or(
      `cel_vendedor.ilike.%${filters.search}%,` +
      `numero_cliente.ilike.%${filters.search}%,` +
      `nombre_cliente.ilike.%${filters.search}%,` +
      `metodo_pago.ilike.%${filters.search}%`
    )
  }

  if (filters.cel_vendedor) {
    query = query.ilike('cel_vendedor', `%${filters.cel_vendedor}%`)
  }

  if (filters.numero_cliente) {
    query = query.ilike('numero_cliente', `%${filters.numero_cliente}%`)
  }

  if (filters.metodo_pago) {
    query = query.ilike('metodo_pago', `%${filters.metodo_pago}%`)
  }

  if (filters.metodo_pago_1) {
    query = query.ilike('metodo_pago_1', `%${filters.metodo_pago_1}%`)
  }

  // Filtro por empresa (OVERSHARK, BRAVO'S, OTROS)
  if (filters.empresa !== undefined && filters.empresa !== null && filters.empresa !== '') {
    const paymentMethods = getPaymentMethodsByCompany(filters.empresa)

    if (paymentMethods.length > 0) {
      // Filtrar por los métodos de pago de la empresa
      query = query.in('metodo_pago_1', paymentMethods)
    } else if (filters.empresa === 'OTROS') {
      // Para "OTROS", excluir todos los métodos conocidos de OVERSHARK y BRAVO'S
      const oversharkMethods = getPaymentMethodsByCompany('OVERSHARK')
      const bravosMethods = getPaymentMethodsByCompany('BRAVOS')
      const allKnownMethods = [...oversharkMethods, ...bravosMethods]

      query = query.not('metodo_pago_1', 'in', `(${allKnownMethods.map(m => `"${m}"`).join(',')})`)
    }
  }

  if (filters.region) {
    query = query.eq('region', filters.region)
  }

  if (filters.fecha_desde) {
    query = query.gte('fecha_reporte', filters.fecha_desde)
  }

  if (filters.fecha_hasta) {
    query = query.lte('fecha_reporte', filters.fecha_hasta)
  }

  if (filters.monto_min !== undefined) {
    query = query.gte('monto', filters.monto_min)
  }

  if (filters.monto_max !== undefined) {
    query = query.lte('monto', filters.monto_max)
  }

  // Aplicar ordenamiento
  const sortBy = pagination.sortBy || 'created_at'
  const sortOrder = pagination.sortOrder || 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Aplicar paginación
  const from = (pagination.page - 1) * pagination.pageSize
  const to = from + pagination.pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching sales:', error)
    throw new Error('Error al cargar las ventas')
  }

  const total = count || 0
  const totalPages = Math.ceil(total / pagination.pageSize)

  return {
    sales: data || [],
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages,
  }
}

/**
 * Obtener valores únicos para filtros
 */
export async function getFilterOptions() {
  const supabase = await createClient()

  // Lista completa de vendedores (hardcodeada)
  const vendedores = [
    'P1',
    'P2',
    'P4',
    'P5',
    'P6',
    'TK1',
    'TK2',
    'TK3',
    'LIVE OVER',
    'LIVE BRAVOS',
    'ZAZU-385',
    'OVER-016',
    'ZAZU-839',
    'LIVEX-602',
    'BRAVOS-376',
  ]

  // Lista completa de teléfonos que reciben dinero (hardcodeada)
  // OVERSHARK
  const metodosPago1 = [
    'L1-000',
    'L2-378',
    'L3-711',
    'L4-138',
    'P1/556',
    'P1-A/375',
    'P2/576',
    'P3/825',
    'P4/101',
    'P4-A/262',
    'P5/795',
    'TK1/320',
    'TK2/505',
    'TK3/016',
    'TK6/600',
    'TRANSF. 0102 Cuenta bancaria',
    'TRANSF. 5094 Cuenta bancaria',
    // BRAVO'S
    'LIVE BRAV/402',
    'PUB BRAV/829',
    'TRANSF. 4006 Cuenta bancaria',
    'TRANSF. 0040 Cuenta bancaria',
  ]

  // Obtener métodos de pago únicos desde la BD (estos sí pueden variar)
  const { data: metodosPago } = await supabase
    .from('sales')
    .select('metodo_pago')
    .not('metodo_pago', 'is', null)
    .order('metodo_pago')
    .limit(10000)
    .returns<{ metodo_pago: string }[]>()

  // Extraer valores únicos de métodos de pago
  const metodosPagoUnicos = [...new Set(metodosPago?.map(m => m.metodo_pago) || [])]

  return {
    vendedores,
    metodosPago: metodosPagoUnicos,
    metodosPago1,
    regiones: ['LIMA', 'PROVINCIA'] as const,
    empresas: COMPANY_OPTIONS, // Nuevo: opciones de empresa
  }
}

/**
 * Obtener estadísticas de ventas
 */
export async function getSalesStats() {
  const supabase = await createClient()

  const { count } = await supabase
    .from('sales')
    .select('*', { count: 'exact', head: true })

  const { data: sumData } = await supabase
    .from('sales')
    .select('monto')
    .returns<{ monto: number }[]>()

  const totalMonto = sumData?.reduce((acc, sale) => acc + (sale.monto || 0), 0) || 0

  return {
    totalVentas: count || 0,
    totalMonto,
  }
}
