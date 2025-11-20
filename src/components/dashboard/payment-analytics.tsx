import { getDashboardAnalytics } from '@/app/(dashboard)/dashboard/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getCategoryName, getCategoryColor, getCompanyColor } from '@/lib/payment-methods'
import { TrendingUp, DollarSign, Layers, Building2 } from 'lucide-react'

/**
 * Componente de análisis de métodos de pago
 */
export async function PaymentAnalytics() {
  const analytics = await getDashboardAnalytics()

  if (!analytics.totalSales) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Métodos de Pago</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Distribución por Categoría */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <CardTitle>Distribución por Tipo de Pago</CardTitle>
          </div>
          <CardDescription>
            Análisis por categoría de métodos de pago
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.byCategory.map((cat) => {
              const maxAmount = Math.max(...analytics.byCategory.map(c => c.total))
              const widthPercentage = (cat.total / maxAmount) * 100

              return (
                <div key={cat.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: getCategoryColor(cat.category) }}
                      />
                      <span className="font-medium">{getCategoryName(cat.category)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">
                        {cat.count} ventas
                      </span>
                      <span className="font-bold min-w-[100px] text-right">
                        S/. {cat.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                      <Badge variant="secondary" className="min-w-[60px] justify-center">
                        {cat.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${widthPercentage}%`,
                        backgroundColor: getCategoryColor(cat.category)
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Total</span>
              <div className="flex items-center gap-3">
                <span>{analytics.totalSales} ventas</span>
                <span className="min-w-[100px] text-right">
                  S/. {analytics.totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
                <span className="min-w-[60px] text-right">100%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribución por Empresa */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Por Empresa</CardTitle>
          </div>
          <CardDescription>
            Comparación OVERSHARK vs BRAVO'S
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analytics.byCompany.map((comp) => {
              const maxAmount = Math.max(...analytics.byCompany.map(c => c.total))
              const widthPercentage = (comp.total / maxAmount) * 100

              return (
                <div key={comp.company} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3
                      className="text-lg font-bold"
                      style={{ color: getCompanyColor(comp.company) }}
                    >
                      {comp.company}
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-base px-3"
                      style={{
                        borderColor: getCompanyColor(comp.company),
                        color: getCompanyColor(comp.company)
                      }}
                    >
                      {comp.percentage.toFixed(1)}%
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${widthPercentage}%`,
                          backgroundColor: getCompanyColor(comp.company)
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{comp.count} transacciones</span>
                      <span className="font-semibold text-foreground">
                        S/. {comp.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Métodos de Pago */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Top 10 Métodos de Pago</CardTitle>
          </div>
          <CardDescription>
            Métodos de pago con mayor volumen de ventas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {analytics.topMethods.map((method, index) => (
              <Card key={method.code} className="border-2 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: `${getCategoryColor(method.category)}20`,
                        color: getCategoryColor(method.category),
                        borderColor: getCategoryColor(method.category)
                      }}
                    >
                      #{index + 1}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: getCompanyColor(method.company),
                        color: getCompanyColor(method.company)
                      }}
                    >
                      {method.company}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-sm truncate" title={method.code}>
                      {method.code}
                    </p>
                    <p className="text-xs text-muted-foreground truncate" title={method.description}>
                      {method.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Ventas:</span>
                      <span className="font-semibold">{method.count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span className="font-bold text-sm">
                        S/. {method.total.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
