'use server'

import { createClient } from '@/lib/supabase/server'
import type { Sale } from '@/types/database.types'

export interface SalesFilters {
  search?: string
  cel_vendedor?: string
  numero_cliente?: string
  metodo_pago?: string
  metodo_pago_1?: string
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

  if (filters.region) {
    query = query.eq('region', filters.region)
  }

  if (filters.fecha_desde) {
    query = query.gte('fecha_venta', filters.fecha_desde)
  }

  if (filters.fecha_hasta) {
    query = query.lte('fecha_venta', filters.fecha_hasta)
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

  // Obtener vendedores únicos
  const { data: vendedores } = await supabase
    .from('sales')
    .select('cel_vendedor')
    .not('cel_vendedor', 'is', null)
    .order('cel_vendedor')
    .returns<{ cel_vendedor: string }[]>()

  // Obtener métodos de pago únicos
  const { data: metodosPago } = await supabase
    .from('sales')
    .select('metodo_pago')
    .not('metodo_pago', 'is', null)
    .order('metodo_pago')
    .returns<{ metodo_pago: string }[]>()

  // Obtener métodos de pago 2 únicos
  const { data: metodosPago1 } = await supabase
    .from('sales')
    .select('metodo_pago_1')
    .not('metodo_pago_1', 'is', null)
    .order('metodo_pago_1')
    .returns<{ metodo_pago_1: string }[]>()

  // Extraer valores únicos
  const vendedoresUnicos = [...new Set(vendedores?.map(v => v.cel_vendedor) || [])]
  const metodosPagoUnicos = [...new Set(metodosPago?.map(m => m.metodo_pago) || [])]
  const metodosPago1Unicos = [...new Set(metodosPago1?.map(m => m.metodo_pago_1) || [])]

  return {
    vendedores: vendedoresUnicos,
    metodosPago: metodosPagoUnicos,
    metodosPago1: metodosPago1Unicos,
    regiones: ['LIMA', 'PROVINCIA'] as const,
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
