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

  // Obtener estadísticas en paralelo
  const [
    { count: totalSales },
    { data: salesData },
    { data: topSellers },
  ] = await Promise.all([
    supabase.from('sales').select('*', { count: 'exact', head: true }),
    supabase.from('sales').select('monto').returns<{ monto: number }[]>(),
    supabase
      .from('sales')
      .select('cel_vendedor')
      .limit(1000)
      .returns<{ cel_vendedor: string }[]>(),
  ])

  // Calcular total de ingresos
  const totalRevenue = salesData?.reduce((acc, sale) => acc + Number(sale.monto), 0) || 0

  // Calcular promedio de venta
  const averageSale = totalSales && totalSales > 0 ? totalRevenue / totalSales : 0

  // Contar vendedores únicos
  const uniqueSellers = new Set(topSellers?.map((s) => s.cel_vendedor) || []).size

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
