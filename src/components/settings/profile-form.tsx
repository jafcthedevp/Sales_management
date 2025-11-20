'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertTriangle, User, Mail, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { updateProfile } from '@/app/(dashboard)/configuracion/actions'
import type { Profile } from '@/types/database.types'

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)

    startTransition(async () => {
      const response = await updateProfile(fullName)
      setResult(response)

      // Limpiar mensaje después de 5 segundos
      if (response.success) {
        setTimeout(() => setResult(null), 5000)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Personal</CardTitle>
        <CardDescription>
          Actualiza tu información de perfil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {result && (
          <Alert variant={result.success ? 'default' : 'destructive'}>
            {result.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre completo */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                placeholder="Tu nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10"
                required
                disabled={isPending}
                minLength={3}
              />
            </div>
          </div>

          {/* Email (solo lectura) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={profile.email}
                className="pl-10 bg-muted cursor-not-allowed"
                disabled
                readOnly
              />
            </div>
            <p className="text-xs text-muted-foreground">
              El email no se puede cambiar
            </p>
          </div>

          {/* Rol (solo lectura) */}
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                {profile.role === 'admin' ? 'Administrador' : 'Contador'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Contacta al administrador para cambiar tu rol
            </p>
          </div>

          {/* Fecha de creación */}
          <div className="space-y-2">
            <Label>Miembro desde</Label>
            <p className="text-sm text-muted-foreground">
              {profile.created_at
                ? new Date(profile.created_at).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'No disponible'}
            </p>
          </div>

          <Button type="submit" disabled={isPending || fullName === profile.full_name}>
            {isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
