import { getTopSellers } from '@/app/(dashboard)/dashboard/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, ShoppingCart } from 'lucide-react'

/**
 * Componente que muestra el ranking de vendedores
 */
export async function TopSellers() {
  const sellers = await getTopSellers(10)

  if (sellers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Vendedores</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const maxTotal = sellers[0]?.total || 1

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  const getMedalColor = (index: number) => {
    if (index === 0) return '#fbbf24' // gold
    if (index === 1) return '#9ca3af' // silver
    if (index === 2) return '#cd7f32' // bronze
    return '#6b7280' // gray
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <CardTitle>Ranking de Vendedores</CardTitle>
        </div>
        <CardDescription>
          Top 10 vendedores por ingresos generados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sellers.map((seller, index) => {
            const widthPercentage = (seller.total / maxTotal) * 100

            return (
              <div
                key={seller.seller}
                className="space-y-2 p-3 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm"
                      style={{
                        backgroundColor: `${getMedalColor(index)}20`,
                        color: getMedalColor(index)
                      }}
                    >
                      {index < 3 ? getMedalEmoji(index) : index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{seller.seller}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ShoppingCart className="h-3 w-3" />
                        <span>{seller.count} ventas</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      S/. {seller.total.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Prom: S/. {seller.average.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${widthPercentage}%`,
                      backgroundColor: getMedalColor(index)
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Total Top 10</span>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                {sellers.reduce((sum, s) => sum + s.count, 0).toLocaleString()} ventas
              </p>
              <p className="font-bold text-primary">
                S/. {sellers.reduce((sum, s) => sum + s.total, 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
