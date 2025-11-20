import { Suspense } from 'react'
import { getSales, getFilterOptions, getSalesStats } from './actions'
import { SalesDataTable } from '@/components/dashboard/sales-data-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign, TrendingUp } from 'lucide-react'

async function SalesContent() {
  // Fetch inicial de datos
  const [salesResponse, filterOptions, stats] = await Promise.all([
    getSales({}, { page: 1, pageSize: 10 }),
    getFilterOptions(),
    getSalesStats(),
  ])

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Ventas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalVentas.toLocaleString('es-PE')}
            </div>
            <p className="text-xs text-muted-foreground">
              Registros en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('es-PE', {
                style: 'currency',
                currency: 'PEN',
              }).format(stats.totalMonto)}
            </div>
            <p className="text-xs text-muted-foreground">
              Suma total de todas las ventas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Ventas */}
      <SalesDataTable
        initialSales={salesResponse.sales}
        initialTotal={salesResponse.total}
        initialPage={salesResponse.page}
        initialPageSize={salesResponse.pageSize}
        initialTotalPages={salesResponse.totalPages}
        vendedores={filterOptions.vendedores}
        metodosPago={filterOptions.metodosPago}
        metodosPago1={filterOptions.metodosPago1}
        empresas={filterOptions.empresas}
      />
    </div>
  )
}

function SalesLoading() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VentasPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Ventas</h2>
      </div>
      <Suspense fallback={<SalesLoading />}>
        <SalesContent />
      </Suspense>
    </div>
  )
}
