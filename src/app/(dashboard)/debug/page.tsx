import { getDiagnosticData } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Diagnóstico de Estadísticas - Dashboard',
  description: 'Página de diagnóstico para verificar las estadísticas del dashboard',
}

export default async function DiagnosticPage() {
  const diagnostics = await getDiagnosticData()

  const allMatch = Object.values(diagnostics.comparison).every(c => c.match)
  const hasProblems =
    diagnostics.problems.montosNull > 0 ||
    diagnostics.problems.montosZero > 0 ||
    diagnostics.problems.vendedoresNull > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Diagnóstico de Estadísticas</h1>
        <p className="text-muted-foreground mt-2">
          Verificación completa de las estadísticas del dashboard
        </p>
      </div>

      <Alert variant={allMatch && !hasProblems ? 'default' : 'destructive'}>
        {allMatch && !hasProblems ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <AlertTitle>
          {allMatch && !hasProblems ? 'Todo funciona correctamente' : 'Se encontraron problemas'}
        </AlertTitle>
        <AlertDescription>
          {allMatch && !hasProblems
            ? 'Las estadísticas están calculando correctamente.'
            : 'Revisa los detalles abajo para identificar el problema.'}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {diagnostics.rpcResults.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            Función RPC get_sales_stats()
          </CardTitle>
          <CardDescription>
            {diagnostics.rpcResults.success
              ? 'La función RPC está funcionando correctamente'
              : 'La función RPC tiene problemas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {diagnostics.rpcResults.success ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Resultados de la función:</p>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(diagnostics.rpcResults.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-sm text-red-600">
              <p className="font-semibold">Error:</p>
              <p>{diagnostics.rpcResults.error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comparación: Cálculo Manual vs Función RPC</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(diagnostics.comparison).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  {value.match ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">
                      {key === 'totalSales' && 'Total Ventas'}
                      {key === 'totalRevenue' && 'Ingresos Totales'}
                      {key === 'averageSale' && 'Promedio por Venta'}
                      {key === 'uniqueSellers' && 'Vendedores Únicos'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Manual: {value.manual.toLocaleString('es-PE')} | RPC: {value.rpc.toLocaleString('es-PE')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{diagnostics.totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Cálculo manual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              S/ {diagnostics.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Cálculo manual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Promedio por Venta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              S/ {diagnostics.averageSale.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Cálculo manual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Vendedores Únicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{diagnostics.uniqueSellers}</div>
            <p className="text-xs text-muted-foreground">Cálculo manual</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {hasProblems ? (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
            Calidad de Datos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total de registros:</span>
              <span className="font-semibold">{diagnostics.problems.totalRecords}</span>
            </div>
            <div className="flex justify-between">
              <span>Ventas con monto NULL:</span>
              <span className={diagnostics.problems.montosNull > 0 ? 'text-red-600' : 'text-green-600'}>
                {diagnostics.problems.montosNull}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Ventas con monto = 0:</span>
              <span className={diagnostics.problems.montosZero > 0 ? 'text-yellow-600' : 'text-green-600'}>
                {diagnostics.problems.montosZero}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Ventas sin vendedor:</span>
              <span className={diagnostics.problems.vendedoresNull > 0 ? 'text-yellow-600' : 'text-green-600'}>
                {diagnostics.problems.vendedoresNull}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendedores ({diagnostics.sellers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-auto">
            {diagnostics.sellers.map((seller, index) => (
              <div key={index} className="flex justify-between border-b pb-2">
                <span className="font-medium">{seller.cel_vendedor}</span>
                <span className="text-sm text-muted-foreground">{seller.count.toLocaleString()} ventas</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
