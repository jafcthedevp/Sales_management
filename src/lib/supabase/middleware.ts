import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware para refrescar tokens de Supabase
 *
 * IMPORTANTE: En Next.js 15/16, el middleware SOLO debe:
 * 1. Refrescar tokens de autenticación
 * 2. Actualizar cookies
 * 3. Manejar intercambio de código de autenticación (para recuperación de contraseña)
 *
 * NO debe hacer validaciones de base de datos o redirecciones complejas.
 * La protección de rutas se hace en Server Components usando el DAL.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Manejar intercambio de código de autenticación (para recuperación de contraseña y magic links)
  // Supabase envía un código en el URL que debe ser intercambiado por una sesión
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')

  if (code) {
    // Intercambiar el código por una sesión
    await supabase.auth.exchangeCodeForSession(code)
  }

  // IMPORTANTE: No usar getUser() o getSession() aquí
  // Usar getClaims() que es más ligero y diseñado para middleware
  await supabase.auth.getClaims()

  return supabaseResponse
}
