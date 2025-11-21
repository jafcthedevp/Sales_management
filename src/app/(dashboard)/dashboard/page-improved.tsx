import { Suspense } from 'react'
import { getUserProfile } from '@/lib/dal'
import { StatsCards } from '@/components/dashboard/stats-cards-improved'
import { RecentSales } from '@/components/dashboard/recent-sales-improved'
import { PaymentAnalytics } from '@/components/dashboard/payment-analytics'
import { RegionAnalytics } from '@/components/dashboard/region-analytics'
import { TopSellers } from '@/components/dashboard/top-sellers'
import { SalesTimeline } from '@/components/dashboard/sales-timeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Página principal del Dashboard - VERSIÓN MEJORADA
 *
 * Mejoras implementadas:
 * - Header con gradiente y fecha
 * - Stats cards con gradientes y animaciones
 * - Recent sales rediseñado
 * - Mejor spacing y organización
 */
export default async function DashboardPageImproved() {
  const profile = await getUserProfile()

  return (
    <div className="space-y-8">
      {/* Header mejorado con gradiente */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 p-8 text-white shadow-xl">
        {/* Patrón de fondo decorativo */}
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 animate-pulse" />
                <h1 className="text-4xl font-bold tracking-tight">
                  Dashboard
                </h1>
              </div>
              <p className="text-lg text-blue-100">
                ¡Bienvenido de nuevo, <span className="font-semibold">{profile.full_name || profile.email}</span>!
              </p>
              <p className="text-sm text-blue-200">
                Aquí está el resumen de tu negocio
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 text-blue-100">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </span>
              </div>
              <p className="mt-1 text-2xl font-bold">
                {format(new Date(), 'HH:mm')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas principales - MEJORADAS */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      {/* Sección de Análisis */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Análisis de Ventas
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700" />
        </div>

        {/* Análisis por Empresa y Top Teléfonos */}
        <Suspense fallback={<AnalyticsSkeleton />}>
          <PaymentAnalytics />
        </Suspense>
      </div>

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

      {/* Ventas Recientes - MEJORADO */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-gradient-to-r from-green-600 to-emerald-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Actividad Reciente
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700" />
        </div>

        <Suspense fallback={<RecentSalesSkeleton />}>
          <RecentSales />
        </Suspense>
      </div>
    </div>
  )
}

// Skeletons para loading states
function StatsCardsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="border-2">
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
    <Card className="border-2">
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
      <Card className="md:col-span-1 border-2">
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
      <Card className="md:col-span-2 border-2">
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
    <Card className="border-2">
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
