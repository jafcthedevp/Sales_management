import { redirect } from 'next/navigation'
import { getOptionalUser } from '@/lib/dal'

/**
 * Página raíz
 * Redirige al dashboard si está autenticado, o al login si no lo está
 */
export default async function Home() {
  const user = await getOptionalUser()

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
