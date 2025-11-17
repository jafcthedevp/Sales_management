import { Suspense } from 'react'
import { ExportContent } from '@/components/export/export-content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Download } from 'lucide-react'

function ExportLoading() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ExportPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Download className="h-8 w-8" />
            Exportar Ventas
          </h2>
          <p className="text-muted-foreground mt-2">
            Exporta las ventas a Excel aplicando filtros personalizados
          </p>
        </div>
      </div>
      <Suspense fallback={<ExportLoading />}>
        <ExportContent />
      </Suspense>
    </div>
  )
}
