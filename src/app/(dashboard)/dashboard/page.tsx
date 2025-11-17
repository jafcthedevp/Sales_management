import { Suspense } from 'react'
import { getUserProfile } from '@/lib/dal'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentSales } from '@/components/dashboard/recent-sales'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Página principal del Dashboard
 *
 * Muestra estadísticas y resumen de ventas
 */
export default async function DashboardPage() {
  const profile = await getUserProfile()

  return (
    <div className="space-y-6">
      {/* Header de la página */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Bienvenido de nuevo, {profile.full_name || profile.email}
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      {/* Ventas recientes */}
      <Suspense fallback={<RecentSalesSkeleton />}>
        <RecentSales />
      </Suspense>
    </div>
  )
}

// Skeletons para loading states
function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function RecentSalesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-40" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
