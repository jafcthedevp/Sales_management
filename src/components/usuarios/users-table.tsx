'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { UserPlus, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { UserFormDialog } from './user-form-dialog'
import { DeleteUserDialog } from './delete-user-dialog'
import { toggleUserActive } from '@/app/(dashboard)/usuarios/actions'
import type { UserProfile } from '@/app/(dashboard)/usuarios/actions'
import { useRouter } from 'next/navigation'

interface UsersTableProps {
  users: UserProfile[]
  currentUserId: string
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const router = useRouter()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null)

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    const result = await toggleUserActive(userId, !currentStatus)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Error al cambiar estado del usuario')
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default'
      case 'user':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'user':
        return 'Usuario'
      default:
        return role
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuarios del Sistema</CardTitle>
              <CardDescription>
                Total: {users.length} usuario(s) registrado(s)
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay usuarios registrados
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const isCurrentUser = user.id === currentUserId

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-medium">
                            {user.full_name}
                            {isCurrentUser && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Tú
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.is_active}
                              onCheckedChange={() => handleToggleActive(user.id, user.is_active)}
                              disabled={isCurrentUser}
                            />
                            <span className="text-sm">
                              {user.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: es })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingUser(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingUser(user)}
                              disabled={isCurrentUser}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para crear usuario */}
      <UserFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
      />

      {/* Dialog para editar usuario */}
      {editingUser && (
        <UserFormDialog
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          mode="edit"
          user={editingUser}
        />
      )}

      {/* Dialog para eliminar usuario */}
      {deletingUser && (
        <DeleteUserDialog
          open={!!deletingUser}
          onOpenChange={(open) => !open && setDeletingUser(null)}
          user={deletingUser}
        />
      )}
    </>
  )
}
