'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { createUser, updateUser } from '@/app/(dashboard)/usuarios/actions'
import type { UserProfile } from '@/app/(dashboard)/usuarios/actions'
import type { UserRole } from '@/types/database.types'

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  user?: UserProfile
}

export function UserFormDialog({ open, onOpenChange, mode, user }: UserFormDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [role, setRole] = useState<UserRole>(user?.role || 'contador')
  const [isActive, setIsActive] = useState(user?.is_active ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === 'create' && !password) {
      setError('La contraseña es requerida')
      return
    }

    startTransition(async () => {
      try {
        let result

        if (mode === 'create') {
          result = await createUser({
            email,
            password,
            full_name: fullName,
            role,
          })
        } else if (user) {
          result = await updateUser(user.id, {
            full_name: fullName,
            role,
            is_active: isActive,
          })
        }

        if (result?.success) {
          onOpenChange(false)
          router.refresh()
        } else {
          setError(result?.error || 'Error al procesar la solicitud')
        }
      } catch (err) {
        console.error('Error in handleSubmit:', err)
        setError('Error inesperado al procesar la solicitud')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Completa los datos para crear un nuevo usuario en el sistema'
              : 'Modifica los datos del usuario'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={mode === 'edit'}
              placeholder="usuario@ejemplo.com"
            />
            {mode === 'edit' && (
              <p className="text-xs text-muted-foreground">
                El email no puede ser modificado
              </p>
            )}
          </div>

          {/* Password (solo en creación) */}
          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          )}

          {/* Nombre Completo */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre Completo</Label>
            <Input
              id="full_name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Juan Pérez"
            />
          </div>

          {/* Rol */}
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contador">Contador</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estado (solo en edición) */}
          {mode === 'edit' && (
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Estado del Usuario</Label>
                <p className="text-sm text-muted-foreground">
                  {isActive ? 'Usuario activo en el sistema' : 'Usuario desactivado'}
                </p>
              </div>
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? 'Procesando...'
                : mode === 'create'
                ? 'Crear Usuario'
                : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
