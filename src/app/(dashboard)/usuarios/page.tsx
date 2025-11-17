import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { verifyAdmin } from '@/lib/dal'
import { getAllUsers } from './actions'
import { UsersTable } from '@/components/usuarios/users-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users } from 'lucide-react'

async function UsersContent() {
  const admin = await verifyAdmin()
  if (!admin) {
    redirect('/dashboard')
  }

  const users = await getAllUsers()

  return <UsersTable users={users} currentUserId={admin.id} />
}

function UsersLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function UsuariosPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gestión de Usuarios
          </h2>
          <p className="text-muted-foreground mt-2">
            Administra los usuarios del sistema
          </p>
        </div>
      </div>
      <Suspense fallback={<UsersLoading />}>
        <UsersContent />
      </Suspense>
    </div>
  )
}
