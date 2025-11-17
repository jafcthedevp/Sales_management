import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

/**
 * Cliente de Supabase para el servidor (Server Side)
 *
 * Usar en:
 * - Server Components
 * - Route Handlers
 * - Server Actions
 *
 * Para verificaciones de autenticación, usar el DAL (lib/dal.ts)
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // La función `setAll` se llama desde un Server Component.
            // Esto puede ser ignorado si tiene middleware refrescando
            // las cookies del usuario.
          }
        },
      },
    }
  )
}
