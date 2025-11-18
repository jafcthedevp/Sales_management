import { redirect } from 'next/navigation'
import { getOptionalUser } from '@/lib/dal'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

/**
 * Página de Recuperación de Contraseña
 *
 * Si el usuario ya está autenticado, redirige al dashboard
 */
export default async function ForgotPasswordPage() {
  // Verificar si ya está autenticado
  const user = await getOptionalUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Sistema de Gestión de Ventas
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Recupera el acceso a tu cuenta
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  )
}
