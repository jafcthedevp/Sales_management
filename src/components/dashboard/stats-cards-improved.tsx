import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

/**
 * Tarjetas de estadísticas del dashboard - VERSIÓN MEJORADA
 *
 * Mejoras:
 * - Gradientes de fondo
 * - Animaciones hover
 * - Iconos más grandes
 * - Mejor contraste
 * - Efectos visuales
 */
export async function StatsCards() {
  const supabase = await createClient()

  // Obtener todas las estadísticas usando agregaciones SQL
  const { data: statsData, error } = await supabase.rpc('get_sales_stats')

  // Fallback si falla el RPC
  let totalSales = 0
  let totalRevenue = 0
  let averageSale = 0
  let uniqueSellers = 0

  if (!error && statsData) {
    totalSales = statsData.total_sales || 0
    totalRevenue = statsData.total_revenue || 0
    averageSale = statsData.average_sale || 0
    uniqueSellers = statsData.unique_sellers || 0
  } else {
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
  }

  const stats = [
    {
      title: 'Total Ventas',
      value: totalSales?.toLocaleString() || '0',
      description: 'Registros en el sistema',
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-600',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Ingresos Totales',
      value: `S/ ${totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: 'Total acumulado',
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-600',
      trend: '+8.2%',
      trendUp: true,
    },
    {
      title: 'Promedio por Venta',
      value: `S/ ${averageSale.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: 'Ticket promedio',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-pink-600',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-600',
      trend: '-2.4%',
      trendUp: false,
    },
    {
      title: 'Vendedores',
      value: uniqueSellers.toString(),
      description: 'Vendedores activos',
      icon: Users,
      gradient: 'from-orange-500 to-red-600',
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-600',
      trend: '+3.1%',
      trendUp: true,
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card
          key={stat.title}
          className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-transparent cursor-pointer"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          {/* Gradiente de fondo que aparece en hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

          {/* Contenido */}
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 transition-colors group-hover:text-white">
              {stat.title}
            </CardTitle>
            <div className={`${stat.iconBg} rounded-lg p-2 transition-all duration-300 group-hover:bg-white/20`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor} transition-colors group-hover:text-white`} />
            </div>
          </CardHeader>

          <CardContent className="relative">
            <div className="text-3xl font-bold transition-colors group-hover:text-white">
              {stat.value}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground transition-colors group-hover:text-white/80">
                {stat.description}
              </p>

              {/* Indicador de tendencia */}
              <div className={`flex items-center gap-1 text-xs font-semibold ${
                stat.trendUp ? 'text-green-600' : 'text-red-600'
              } transition-colors group-hover:text-white`}>
                {stat.trendUp ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span>{stat.trend}</span>
              </div>
            </div>

            {/* Barra de progreso decorativa */}
            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-full bg-gradient-to-r ${stat.gradient} transition-all duration-1000 ease-out`}
                style={{ width: '75%' }}
              />
            </div>
          </CardContent>

          {/* Efecto de brillo en hover */}
          <div className="absolute -inset-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 blur-xl" />
        </Card>
      ))}
    </div>
  )
}
