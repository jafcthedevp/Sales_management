import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

/**
 * Página de Reseteo de Contraseña
 *
 * Esta página se accede mediante el enlace enviado por email
 * Verifica que haya una sesión válida de recuperación
 */
export default async function ResetPasswordPage() {
  const supabase = await createClient()

  // Verificar si hay una sesión activa (usuario accedió desde el enlace del email)
  const { data: { session }, error } = await supabase.auth.getSession()

  // Si hay error o no hay sesión, mostrar error
  const hasValidSession = !error && session !== null

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Sistema de Gestión de Ventas
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Establece una nueva contraseña segura
          </p>
        </div>

        {!hasValidSession ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="mb-2">
                El enlace de recuperación ha expirado o no es válido.
              </p>
              <p className="text-sm">
                Los enlaces de recuperación expiran después de 1 hora. Por favor,{' '}
                <Link href="/forgot-password" className="underline font-semibold">
                  solicita un nuevo enlace
                </Link>
                .
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <ResetPasswordForm />
        )}
      </div>
    </div>
  )
}
