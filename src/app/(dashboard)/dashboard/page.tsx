import { Suspense } from 'react'
import { getUserProfile } from '@/lib/dal'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentSales } from '@/components/dashboard/recent-sales'
import { PaymentAnalytics } from '@/components/dashboard/payment-analytics'
import { RegionAnalytics } from '@/components/dashboard/region-analytics'
import { TopSellers } from '@/components/dashboard/top-sellers'
import { SalesTimeline } from '@/components/dashboard/sales-timeline'
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

      {/* Tarjetas de estadísticas principales */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      {/* Análisis por Empresa y Top Teléfonos */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <PaymentAnalytics />
      </Suspense>

      {/* Grid: Región, Timeline, Top Sellers */}
      <div className="grid gap-6 md:grid-cols-3">
        <Suspense fallback={<CardSkeleton />}>
          <RegionAnalytics />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <SalesTimeline />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <TopSellers />
        </Suspense>
      </div>

      {/* Ventas Recientes */}
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

function AnalyticsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
