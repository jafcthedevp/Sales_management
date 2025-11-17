import { redirect } from 'next/navigation'
import { getOptionalUser } from '@/lib/dal'
import { RegisterForm } from '@/components/auth/register-form'

export default async function RegisterPage() {
  // Si el usuario ya está autenticado, redirigir al dashboard
  const user = await getOptionalUser()
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <RegisterForm />
    </div>
  )
}
