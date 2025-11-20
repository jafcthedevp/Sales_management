import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react'

/**
 * Tarjetas de estadísticas del dashboard
 * Server Component que obtiene datos directamente
 */
export async function StatsCards() {
  const supabase = await createClient()

  // Obtener todas las estadísticas usando agregaciones SQL
  // Esto es más eficiente que traer todos los datos y calcular en el cliente
  const { data: statsData, error } = await supabase.rpc('get_sales_stats')

  // Logging para debugging (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Stats Debug:', {
      hasError: !!error,
      errorMessage: error?.message,
      hasData: !!statsData,
      statsData: statsData,
    })
  }

  // Si falla el RPC o no existe, usar método alternativo
  let totalSales = 0
  let totalRevenue = 0
  let averageSale = 0
  let uniqueSellers = 0

  if (!error && statsData) {
    totalSales = statsData.total_sales || 0
    totalRevenue = statsData.total_revenue || 0
    averageSale = statsData.average_sale || 0
    uniqueSellers = statsData.unique_sellers || 0

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Usando RPC get_sales_stats():', { totalSales, totalRevenue, averageSale, uniqueSellers })
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ RPC falló, usando fallback')
    }

    // Fallback: Obtener estadísticas usando consultas individuales
    const [
      { count },
      { data: revenueData },
      { data: sellersData },
    ] = await Promise.all([
      supabase.from('sales').select('*', { count: 'exact', head: true }),
      supabase.from('sales').select('monto'),
      supabase.from('sales').select('cel_vendedor'),
    ])

    totalSales = count || 0
    totalRevenue = revenueData?.reduce((acc, sale) => acc + Number(sale.monto || 0), 0) || 0
    averageSale = totalSales > 0 ? totalRevenue / totalSales : 0
    uniqueSellers = new Set(sellersData?.map((s) => s.cel_vendedor).filter(Boolean) || []).size

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Fallback completado:', {
        totalSales,
        totalRevenue,
        averageSale,
        uniqueSellers,
        revenueRecords: revenueData?.length,
        sellersRecords: sellersData?.length,
      })
    }
  }

  const stats = [
    {
      title: 'Total Ventas',
      value: totalSales?.toLocaleString() || '0',
      description: 'Registros en el sistema',
      icon: ShoppingCart,
      color: 'text-blue-600',
    },
    {
      title: 'Ingresos Totales',
      value: `S/ ${totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: 'Total acumulado',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Promedio por Venta',
      value: `S/ ${averageSale.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: 'Ticket promedio',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      title: 'Vendedores',
      value: uniqueSellers.toString(),
      description: 'Vendedores activos',
      icon: Users,
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
