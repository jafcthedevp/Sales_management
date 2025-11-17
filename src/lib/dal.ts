import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database.types'

/**
 * Data Access Layer (DAL) para Next.js 15/16
 *
 * Este archivo centraliza todas las verificaciones de autenticación
 * y acceso a datos del usuario. Usa React cache() para optimizar
 * múltiples llamadas durante el rendering.
 *
 * Referencia: https://nextjs.org/docs/app/building-your-application/authentication
 */

/**
 * Verificar la sesión del usuario
 * Usa cache() para que múltiples componentes puedan llamarlo sin overhead
 */
export const verifySession = cache(async () => {
  const supabase = await createClient()

  // Usar getUser() que valida el JWT en el servidor
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return { user }
})

/**
 * Obtener el perfil completo del usuario autenticado
 * Incluye rol y estado activo
 */
export const getUserProfile = cache(async (): Promise<Profile> => {
  const { user } = await verifySession()

  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (error || !profile) {
    // Si no tiene perfil, cerrar sesión y redirigir
    await supabase.auth.signOut()
    redirect('/login')
  }

  // Verificar que el usuario esté activo
  if (!profile.is_active) {
    redirect('/cuenta-inactiva')
  }

  return profile
})

/**
 * Verificar que el usuario sea Admin
 * Lanza error si no es admin
 */
export const verifyAdmin = cache(async () => {
  const profile = await getUserProfile()

  if (profile.role !== 'admin') {
    redirect('/dashboard') // O mostrar error 403
  }

  return profile
})

/**
 * Obtener datos del usuario (sin redirección)
 * Útil para casos donde necesitas verificar auth opcionalmente
 */
export const getOptionalUser = cache(async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
})

/**
 * Verificar si el usuario actual es admin (retorna boolean)
 */
export const isUserAdmin = cache(async (): Promise<boolean> => {
  try {
    const profile = await getUserProfile()
    return profile.role === 'admin'
  } catch {
    return false
  }
})

/**
 * Verificar permisos para una acción específica
 */
export async function checkPermission(action: 'upload' | 'delete' | 'manage_users') {
  const profile = await getUserProfile()

  const permissions = {
    upload: profile.role === 'admin',
    delete: profile.role === 'admin',
    manage_users: profile.role === 'admin',
  }

  if (!permissions[action]) {
    throw new Error('No tienes permisos para realizar esta acción')
  }

  return true
}
