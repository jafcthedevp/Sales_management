import { getDashboardAnalytics } from '@/app/(dashboard)/dashboard/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getCompanyConfig } from '@/lib/companies'
import { TrendingUp, DollarSign, Building2 } from 'lucide-react'

/**
 * Componente de análisis por empresa
 */
export async function PaymentAnalytics() {
  const analytics = await getDashboardAnalytics()

  if (!analytics.totalSales) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Ventas por Empresa</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Filtrar OTROS si es muy pequeño
  const byCompanyFiltered = analytics.byCompany.filter(comp => comp.company !== 'OTROS' || comp.percentage > 5)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Distribución por Empresa */}
      <Card className="md:col-span-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Por Empresa</CardTitle>
          </div>
          <CardDescription>
            Distribución OVERSHARK vs BRAVO'S
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {byCompanyFiltered.map((comp) => {
              const maxAmount = Math.max(...analytics.byCompany.map(c => c.total))
              const widthPercentage = (comp.total / maxAmount) * 100
              const config = getCompanyConfig(comp.company)
              const displayName = config?.displayName || comp.company

              return (
                <div key={comp.company} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3
                      className="text-lg font-bold"
                      style={{ color: config?.color || '#6b7280' }}
                    >
                      {displayName}
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-base px-3"
                      style={{
                        borderColor: config?.color || '#6b7280',
                        color: config?.color || '#6b7280'
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
                          backgroundColor: config?.color || '#6b7280'
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{comp.count} ventas</span>
                      <span className="font-semibold text-foreground">
                        S/. {comp.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Sistema</p>
              <p className="text-2xl font-bold text-primary">
                S/. {analytics.totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Teléfonos / Cuentas */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Top 10 Teléfonos / Cuentas</CardTitle>
          </div>
          <CardDescription>
            Cuentas con mayor volumen de ingresos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {analytics.topMethods.map((method, index) => {
              const config = getCompanyConfig(method.company)
              const displayCompany = config?.displayName || method.company

              return (
                <Card key={method.code} className="border-2 hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge
                        variant="secondary"
                        className="text-xs font-bold"
                      >
                        #{index + 1}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: config?.color || '#6b7280',
                          color: config?.color || '#6b7280'
                        }}
                      >
                        {displayCompany}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <p className="font-bold text-sm truncate" title={method.code}>
                        {method.code}
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
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
