'use server'

import { createClient } from '@/lib/supabase/server'

export interface DiagnosticResults {
  // Datos básicos
  totalSales: number
  totalRevenue: number
  averageSale: number
  uniqueSellers: number

  // Función RPC
  rpcResults: {
    success: boolean
    error?: string
    data?: {
      total_sales: number
      total_revenue: number
      average_sale: number
      unique_sellers: number
    }
  }

  // Comparación
  comparison: {
    totalSales: { manual: number; rpc: number; match: boolean }
    totalRevenue: { manual: number; rpc: number; match: boolean }
    averageSale: { manual: number; rpc: number; match: boolean }
    uniqueSellers: { manual: number; rpc: number; match: boolean }
  }

  // Problemas en datos
  problems: {
    montosNull: number
    montosZero: number
    vendedoresNull: number
    totalRecords: number
  }

  // Vendedores
  sellers: Array<{ cel_vendedor: string; count: number }>

  // Muestra de datos
  sampleSales: Array<{
    id: string
    cel_vendedor: string
    monto: number
    fecha_reporte: string | null
    created_at: string | null
  }>
}

export async function getDiagnosticData(): Promise<DiagnosticResults> {
  const supabase = await createClient()

  // 1. Obtener estadísticas manuales
  const { data: allSales, error: salesError } = await supabase
    .from('sales')
    .select('cel_vendedor, monto')

  if (salesError) throw salesError

  const totalSales = allSales?.length || 0
  const totalRevenue = allSales?.reduce((sum, sale) => sum + (sale.monto || 0), 0) || 0
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0
  const uniqueSellers = new Set(allSales?.map(s => s.cel_vendedor).filter(Boolean)).size

  // 2. Obtener estadísticas con función RPC
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_sales_stats')

  const rpcResults = {
    success: !rpcError,
    error: rpcError?.message,
    data: rpcData || undefined,
  }

  // 3. Comparación
  const comparison = {
    totalSales: {
      manual: totalSales,
      rpc: rpcData?.total_sales || 0,
      match: totalSales === (rpcData?.total_sales || 0),
    },
    totalRevenue: {
      manual: Number(totalRevenue.toFixed(2)),
      rpc: Number((rpcData?.total_revenue || 0)),
      match: Math.abs(totalRevenue - (rpcData?.total_revenue || 0)) < 0.01,
    },
    averageSale: {
      manual: Number(averageSale.toFixed(2)),
      rpc: Number((rpcData?.average_sale || 0)),
      match: Math.abs(averageSale - (rpcData?.average_sale || 0)) < 0.01,
    },
    uniqueSellers: {
      manual: uniqueSellers,
      rpc: rpcData?.unique_sellers || 0,
      match: uniqueSellers === (rpcData?.unique_sellers || 0),
    },
  }

  // 4. Problemas en datos
  const montosNull = allSales?.filter(s => s.monto === null).length || 0
  const montosZero = allSales?.filter(s => s.monto === 0).length || 0
  const vendedoresNull = allSales?.filter(s => !s.cel_vendedor).length || 0

  const problems = {
    montosNull,
    montosZero,
    vendedoresNull,
    totalRecords: totalSales,
  }

  // 5. Vendedores únicos con conteo
  const sellerCounts = allSales?.reduce((acc, sale) => {
    const vendor = sale.cel_vendedor || 'SIN VENDEDOR'
    acc[vendor] = (acc[vendor] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const sellers = Object.entries(sellerCounts)
    .map(([cel_vendedor, count]) => ({ cel_vendedor, count }))
    .sort((a, b) => b.count - a.count)

  // 6. Muestra de ventas recientes
  const { data: sampleData } = await supabase
    .from('sales')
    .select('id, cel_vendedor, monto, fecha_reporte, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  const sampleSales = sampleData || []

  return {
    totalSales,
    totalRevenue,
    averageSale,
    uniqueSellers,
    rpcResults,
    comparison,
    problems,
    sellers,
    sampleSales,
  }
}
