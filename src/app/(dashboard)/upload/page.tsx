import { Suspense } from 'react'
import { verifyAdmin } from '@/lib/dal'
import { redirect } from 'next/navigation'
import { UploadContent } from '@/components/upload/upload-content'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

async function UploadPageContent() {
  // Verificar que el usuario sea admin
  const user = await verifyAdmin()

  if (!user) {
    redirect('/dashboard')
  }

  return <UploadContent />
}

function UploadLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  )
}

export default function UploadPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Carga de Datos</h2>
          <p className="text-muted-foreground">
            Importa ventas desde archivos Excel (XLSX)
          </p>
        </div>
      </div>
      <Suspense fallback={<UploadLoading />}>
        <UploadPageContent />
      </Suspense>
    </div>
  )
}
