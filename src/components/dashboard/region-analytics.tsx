import { getSalesByRegion } from '@/app/(dashboard)/dashboard/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin } from 'lucide-react'

/**
 * Componente de análisis de ventas por región
 */
export async function RegionAnalytics() {
  const regionStats = await getSalesByRegion()

  const regions = [
    {
      name: 'LIMA',
      data: regionStats.lima,
      color: '#3b82f6', // blue
      icon: '🏙️'
    },
    {
      name: 'PROVINCIA',
      data: regionStats.provincia,
      color: '#10b981', // green
      icon: '🏞️'
    },
    {
      name: 'SIN REGIÓN',
      data: regionStats.otros,
      color: '#6b7280', // gray
      icon: '❓'
    }
  ]

  const maxTotal = Math.max(...regions.map(r => r.data.total))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <CardTitle>Ventas por Región</CardTitle>
        </div>
        <CardDescription>
          Distribución geográfica de ventas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {regions.map((region) => {
            const widthPercentage = maxTotal > 0 ? (region.data.total / maxTotal) * 100 : 0

            return (
              <div key={region.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{region.icon}</span>
                    <h3 className="text-base font-bold">{region.name}</h3>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-sm px-3"
                    style={{
                      borderColor: region.color,
                      color: region.color
                    }}
                  >
                    {region.data.percentage.toFixed(1)}%
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${widthPercentage}%`,
                        backgroundColor: region.color
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Ventas</p>
                      <p className="font-semibold">{region.data.count.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-xs">Total</p>
                      <p className="font-semibold text-foreground">
                        S/. {region.data.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Total Ventas</p>
              <p className="font-bold text-lg">
                {(regionStats.lima.count + regionStats.provincia.count + regionStats.otros.count).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs">Total Ingresos</p>
              <p className="font-bold text-lg">
                S/. {(regionStats.lima.total + regionStats.provincia.total + regionStats.otros.total).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
