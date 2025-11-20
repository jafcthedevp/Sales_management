import { getSalesTimeline } from '@/app/(dashboard)/dashboard/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, TrendingUp, TrendingDown } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Componente de timeline de ventas (últimos 30 días)
 */
export async function SalesTimeline() {
  const timeline = await getSalesTimeline(30)

  if (timeline.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline de Ventas</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const maxTotal = Math.max(...timeline.map(t => t.total))
  const totalSales = timeline.reduce((sum, t) => sum + t.count, 0)
  const totalRevenue = timeline.reduce((sum, t) => sum + t.total, 0)

  // Calcular tendencia (comparar primera y segunda mitad)
  const midPoint = Math.floor(timeline.length / 2)
  const firstHalfAvg = timeline.slice(0, midPoint).reduce((sum, t) => sum + t.total, 0) / midPoint
  const secondHalfAvg = timeline.slice(midPoint).reduce((sum, t) => sum + t.total, 0) / (timeline.length - midPoint)
  const trend = secondHalfAvg > firstHalfAvg ? 'up' : 'down'
  const trendPercentage = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <CardTitle>Timeline de Ventas</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trendPercentage > 0 ? '+' : ''}{trendPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
        <CardDescription>
          Últimos {timeline.length} días con ventas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Gráfica de barras simple */}
        <div className="space-y-1">
          {timeline.slice(-15).map((day) => {
            const widthPercentage = (day.total / maxTotal) * 100
            const date = parseISO(day.date)

            return (
              <div
                key={day.date}
                className="group hover:bg-muted/50 p-2 rounded transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-20 text-xs text-muted-foreground font-medium">
                    {format(date, 'd MMM', { locale: es })}
                  </div>
                  <div className="flex-1">
                    <div className="h-6 bg-muted rounded overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${widthPercentage}%` }}
                      >
                        {widthPercentage > 20 && (
                          <span className="text-xs font-semibold text-white">
                            {day.count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-28 text-right text-xs font-semibold">
                    S/. {day.total.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Días con ventas</p>
            <p className="text-lg font-bold">{timeline.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total ventas</p>
            <p className="text-lg font-bold">{totalSales.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ingresos</p>
            <p className="text-lg font-bold text-primary">
              S/. {totalRevenue.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        <div className="mt-4 text-xs text-center text-muted-foreground">
          Mostrando los últimos 15 días con actividad
        </div>
      </CardContent>
    </Card>
  )
}
