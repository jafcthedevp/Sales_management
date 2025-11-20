'use server'

import { createClient } from '@/lib/supabase/server'
import { categorizePaymentMethod, PaymentCategory, PaymentCompany } from '@/lib/payment-methods'
import { getCompanyFromPaymentMethod, type Company } from '@/lib/companies'
import type { Database } from '@/types/database.types'

type Sale = Database['public']['Tables']['sales']['Row']

export interface CategoryStats {
  category: PaymentCategory
  count: number
  total: number
  percentage: number
}

export interface CompanyStats {
  company: Company
  count: number
  total: number
  percentage: number
}

export interface PaymentMethodStats {
  code: string
  company: Company
  count: number
  total: number
}

export interface DashboardAnalytics {
  byCompany: CompanyStats[]
  topMethods: PaymentMethodStats[]
  totalSales: number
  totalAmount: number
}

/**
 * Obtiene análisis completo de ventas por empresa
 * Enfocado en OVERSHARK vs BRAVO'S usando metodo_pago_1
 */
export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const supabase = await createClient()

  // Obtener todas las ventas (solo necesitamos metodo_pago_1 para determinar empresa)
  const { data: sales, error } = await supabase
    .from('sales')
    .select('metodo_pago_1, monto')
    .returns<{ metodo_pago_1: string | null; monto: number }[]>()

  if (error || !sales) {
    console.error('Error fetching sales:', error)
    return {
      byCompany: [],
      topMethods: [],
      totalSales: 0,
      totalAmount: 0
    }
  }

  // Mapas para acumular estadísticas
  const companyMap = new Map<Company, { count: number; total: number }>()
  const methodMap = new Map<string, { company: Company; count: number; total: number }>()

  let totalSales = 0
  let totalAmount = 0

  // Procesar cada venta
  for (const sale of sales) {
    if (!sale.metodo_pago_1) continue

    const company = getCompanyFromPaymentMethod(sale.metodo_pago_1)
    const amount = sale.monto || 0

    totalSales++
    totalAmount += amount

    // Acumular por empresa
    const compStats = companyMap.get(company) || { count: 0, total: 0 }
    compStats.count++
    compStats.total += amount
    companyMap.set(company, compStats)

    // Acumular por método específico (teléfono)
    const methodKey = sale.metodo_pago_1.toUpperCase().trim()
    const methodStats = methodMap.get(methodKey) || {
      company,
      count: 0,
      total: 0
    }
    methodStats.count++
    methodStats.total += amount
    methodMap.set(methodKey, methodStats)
  }

  // Convertir a arrays y calcular porcentajes
  const byCompany: CompanyStats[] = Array.from(companyMap.entries()).map(([company, stats]) => ({
    company,
    count: stats.count,
    total: stats.total,
    percentage: totalAmount > 0 ? (stats.total / totalAmount) * 100 : 0
  }))

  // Top 10 teléfonos por monto
  const topMethods: PaymentMethodStats[] = Array.from(methodMap.entries())
    .map(([code, stats]) => ({
      code,
      company: stats.company,
      count: stats.count,
      total: stats.total
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  return {
    byCompany: byCompany.sort((a, b) => b.total - a.total),
    topMethods,
    totalSales,
    totalAmount
  }
}

/**
 * Obtiene estadísticas de ventas por región
 */
export async function getSalesByRegion() {
  const supabase = await createClient()

  const { data: sales, error } = await supabase
    .from('sales')
    .select('region, monto')
    .returns<{ region: string | null; monto: number }[]>()

  if (error || !sales) {
    return {
      lima: { count: 0, total: 0, percentage: 0 },
      provincia: { count: 0, total: 0, percentage: 0 },
      otros: { count: 0, total: 0, percentage: 0 }
    }
  }

  const stats = {
    lima: { count: 0, total: 0 },
    provincia: { count: 0, total: 0 },
    otros: { count: 0, total: 0 }
  }

  let totalAmount = 0

  for (const sale of sales) {
    const amount = sale.monto || 0
    totalAmount += amount

    if (sale.region === 'LIMA') {
      stats.lima.count++
      stats.lima.total += amount
    } else if (sale.region === 'PROVINCIA') {
      stats.provincia.count++
      stats.provincia.total += amount
    } else {
      stats.otros.count++
      stats.otros.total += amount
    }
  }

  return {
    lima: {
      ...stats.lima,
      percentage: totalAmount > 0 ? (stats.lima.total / totalAmount) * 100 : 0
    },
    provincia: {
      ...stats.provincia,
      percentage: totalAmount > 0 ? (stats.provincia.total / totalAmount) * 100 : 0
    },
    otros: {
      ...stats.otros,
      percentage: totalAmount > 0 ? (stats.otros.total / totalAmount) * 100 : 0
    }
  }
}

/**
 * Obtiene ranking de vendedores
 */
export async function getTopSellers(limit: number = 10) {
  const supabase = await createClient()

  const { data: sales, error } = await supabase
    .from('sales')
    .select('cel_vendedor, monto')
    .returns<{ cel_vendedor: string; monto: number }[]>()

  if (error || !sales) {
    return []
  }

  const sellerMap = new Map<string, { count: number; total: number }>()

  for (const sale of sales) {
    if (!sale.cel_vendedor) continue

    const stats = sellerMap.get(sale.cel_vendedor) || { count: 0, total: 0 }
    stats.count++
    stats.total += sale.monto || 0
    sellerMap.set(sale.cel_vendedor, stats)
  }

  return Array.from(sellerMap.entries())
    .map(([seller, stats]) => ({
      seller,
      count: stats.count,
      total: stats.total,
      average: stats.count > 0 ? stats.total / stats.count : 0
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
}

/**
 * Obtiene ventas por día (últimos 30 días)
 */
export async function getSalesTimeline(days: number = 30) {
  const supabase = await createClient()

  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - days)

  const { data: sales, error } = await supabase
    .from('sales')
    .select('fecha_reporte, monto')
    .gte('fecha_reporte', startDate.toISOString().split('T')[0])
    .returns<{ fecha_reporte: string; monto: number }[]>()

  if (error || !sales) {
    return []
  }

  const dateMap = new Map<string, { count: number; total: number }>()

  for (const sale of sales) {
    if (!sale.fecha_reporte) continue

    const stats = dateMap.get(sale.fecha_reporte) || { count: 0, total: 0 }
    stats.count++
    stats.total += sale.monto || 0
    dateMap.set(sale.fecha_reporte, stats)
  }

  return Array.from(dateMap.entries())
    .map(([date, stats]) => ({
      date,
      count: stats.count,
      total: stats.total,
      average: stats.count > 0 ? stats.total / stats.count : 0
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
