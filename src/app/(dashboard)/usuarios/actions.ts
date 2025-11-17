'use server'

import { createClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/dal'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { UserRole } from '@/types/database.types'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  email: string
  password: string
  full_name: string
  role: UserRole
}

export interface UpdateUserData {
  full_name?: string
  role?: UserRole
  is_active?: boolean
}

/**
 * Obtener todos los usuarios (solo admin)
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  const admin = await verifyAdmin()
  if (!admin) {
    redirect('/dashboard')
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    throw new Error('Error al cargar usuarios')
  }

  return data || []
}

/**
 * Crear un nuevo usuario (solo admin)
 */
export async function createUser(userData: CreateUserData) {
  const admin = await verifyAdmin()
  if (!admin) {
    return {
      success: false,
      error: 'No tienes permisos para crear usuarios',
    }
  }

  const supabase = await createClient()

  try {
    // Crear usuario en auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        full_name: userData.full_name,
        role: userData.role,
      },
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return {
        success: false,
        error: authError.message || 'Error al crear el usuario',
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'No se pudo crear el usuario',
      }
    }

    // El perfil se crea automáticamente con el trigger
    // Verificar que se haya creado
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile not created automatically:', profileError)
      // Intentar crear manualmente
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role as 'admin' | 'contador',
          is_active: true,
        } as any)

      if (insertError) {
        console.error('Error creating profile manually:', insertError)
        return {
          success: false,
          error: 'Usuario creado pero fallo al crear perfil',
        }
      }
    }

    revalidatePath('/usuarios')
    return {
      success: true,
      message: 'Usuario creado exitosamente',
    }
  } catch (err) {
    console.error('Error in createUser:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
    }
  }
}

/**
 * Actualizar un usuario (solo admin)
 */
export async function updateUser(userId: string, userData: UpdateUserData) {
  const admin = await verifyAdmin()
  if (!admin) {
    return {
      success: false,
      error: 'No tienes permisos para actualizar usuarios',
    }
  }

  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('profiles')
      // @ts-ignore - Supabase typing issue with update
      .update({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user:', error)
      return {
        success: false,
        error: error.message || 'Error al actualizar el usuario',
      }
    }

    revalidatePath('/usuarios')
    return {
      success: true,
      message: 'Usuario actualizado exitosamente',
    }
  } catch (err) {
    console.error('Error in updateUser:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
    }
  }
}

/**
 * Eliminar un usuario (solo admin)
 */
export async function deleteUser(userId: string) {
  const admin = await verifyAdmin()
  if (!admin) {
    return {
      success: false,
      error: 'No tienes permisos para eliminar usuarios',
    }
  }

  // Verificar que no sea el usuario actual
  if (admin.id === userId) {
    return {
      success: false,
      error: 'No puedes eliminar tu propio usuario',
    }
  }

  const supabase = await createClient()

  try {
    // Eliminar usuario de auth (esto también eliminará el perfil por CASCADE)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      return {
        success: false,
        error: authError.message || 'Error al eliminar el usuario',
      }
    }

    revalidatePath('/usuarios')
    return {
      success: true,
      message: 'Usuario eliminado exitosamente',
    }
  } catch (err) {
    console.error('Error in deleteUser:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
    }
  }
}

/**
 * Alternar estado activo de un usuario (solo admin)
 */
export async function toggleUserActive(userId: string, isActive: boolean) {
  const admin = await verifyAdmin()
  if (!admin) {
    return {
      success: false,
      error: 'No tienes permisos para modificar usuarios',
    }
  }

  // Verificar que no sea el usuario actual
  if (admin.id === userId) {
    return {
      success: false,
      error: 'No puedes desactivar tu propio usuario',
    }
  }

  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('profiles')
      // @ts-ignore - Supabase typing issue with update
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) {
      console.error('Error toggling user active:', error)
      return {
        success: false,
        error: error.message || 'Error al cambiar estado del usuario',
      }
    }

    revalidatePath('/usuarios')
    return {
      success: true,
      message: `Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`,
    }
  } catch (err) {
    console.error('Error in toggleUserActive:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
    }
  }
}
