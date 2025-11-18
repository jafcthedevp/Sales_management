'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { resetPassword } from '@/app/(auth)/forgot-password/actions'

export function ResetPasswordForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setResult({
        success: false,
        message: 'Las contraseñas no coinciden',
      })
      return
    }

    startTransition(async () => {
      const response = await resetPassword(password)
      setResult(response)

      if (response.success) {
        setPassword('')
        setConfirmPassword('')
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    })
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Restablecer Contraseña</CardTitle>
        <CardDescription>
          Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result && (
          <Alert variant={result.success ? 'default' : 'destructive'} className="mb-4">
            {result.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>
              {result.message}
              {result.success && ' Redirigiendo al login...'}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                disabled={isPending}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                disabled={isPending}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                disabled={isPending}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                disabled={isPending}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
