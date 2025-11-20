'use server'

import { createClient } from '@/lib/supabase/server'
import { categorizePaymentMethod, PaymentCategory, PaymentCompany } from '@/lib/payment-methods'
import type { Database } from '@/types/database.types'

type Sale = Database['public']['Tables']['sales']['Row']

export interface CategoryStats {
  category: PaymentCategory
  count: number
  total: number
  percentage: number
}

export interface CompanyStats {
  company: PaymentCompany
  count: number
  total: number
  percentage: number
}

export interface PaymentMethodStats {
  code: string
  description: string
  category: PaymentCategory
  company: PaymentCompany
  count: number
  total: number
}

export interface DashboardAnalytics {
  byCategory: CategoryStats[]
  byCompany: CompanyStats[]
  topMethods: PaymentMethodStats[]
  totalSales: number
  totalAmount: number
}

/**
 * Obtiene análisis completo de ventas por categoría y empresa
 */
export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const supabase = await createClient()

  // Obtener todas las ventas
  const { data: sales, error } = await supabase
    .from('sales')
    .select('metodo_pago, metodo_pago_1, monto')
    .limit(100000)
    .returns<{ metodo_pago: string; metodo_pago_1: string | null; monto: number }[]>()

  if (error || !sales) {
    console.error('Error fetching sales:', error)
    return {
      byCategory: [],
      byCompany: [],
      topMethods: [],
      totalSales: 0,
      totalAmount: 0
    }
  }

  // Aplanar métodos de pago (cada venta puede tener hasta 2 métodos)
  const paymentEntries: Array<{ method: string; amount: number }> = []

  for (const sale of sales) {
    if (sale.metodo_pago) {
      paymentEntries.push({ method: sale.metodo_pago, amount: sale.monto || 0 })
    }
    if (sale.metodo_pago_1) {
      paymentEntries.push({ method: sale.metodo_pago_1, amount: sale.monto || 0 })
    }
  }

  // Mapas para acumular estadísticas
  const categoryMap = new Map<PaymentCategory, { count: number; total: number }>()
  const companyMap = new Map<PaymentCompany, { count: number; total: number }>()
  const methodMap = new Map<string, PaymentMethodStats>()

  let totalSales = 0
  let totalAmount = 0

  // Procesar cada entrada de pago
  for (const entry of paymentEntries) {
    const categorized = categorizePaymentMethod(entry.method)
    if (!categorized) continue

    totalSales++
    totalAmount += entry.amount

    // Acumular por categoría
    const catStats = categoryMap.get(categorized.category) || { count: 0, total: 0 }
    catStats.count++
    catStats.total += entry.amount
    categoryMap.set(categorized.category, catStats)

    // Acumular por empresa
    const compStats = companyMap.get(categorized.company) || { count: 0, total: 0 }
    compStats.count++
    compStats.total += entry.amount
    companyMap.set(categorized.company, compStats)

    // Acumular por método específico
    const methodKey = categorized.code.toUpperCase()
    const methodStats = methodMap.get(methodKey) || {
      code: categorized.code,
      description: categorized.description,
      category: categorized.category,
      company: categorized.company,
      count: 0,
      total: 0
    }
    methodStats.count++
    methodStats.total += entry.amount
    methodMap.set(methodKey, methodStats)
  }

  // Convertir a arrays y calcular porcentajes
  const byCategory: CategoryStats[] = Array.from(categoryMap.entries()).map(([category, stats]) => ({
    category,
    count: stats.count,
    total: stats.total,
    percentage: totalAmount > 0 ? (stats.total / totalAmount) * 100 : 0
  }))

  const byCompany: CompanyStats[] = Array.from(companyMap.entries()).map(([company, stats]) => ({
    company,
    count: stats.count,
    total: stats.total,
    percentage: totalAmount > 0 ? (stats.total / totalAmount) * 100 : 0
  }))

  // Top 10 métodos de pago por monto
  const topMethods = Array.from(methodMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  return {
    byCategory: byCategory.sort((a, b) => b.total - a.total),
    byCompany: byCompany.sort((a, b) => b.total - a.total),
    topMethods,
    totalSales,
    totalAmount
  }
}
