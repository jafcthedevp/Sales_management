'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/dal'
import { revalidatePath } from 'next/cache'

export interface UpdateProfileResult {
  success: boolean
  message: string
}

/**
 * Actualizar nombre completo del usuario
 */
export async function updateProfile(fullName: string): Promise<UpdateProfileResult> {
  try {
    const profile = await getUserProfile()
    const supabase = await createClient()

    // Validar nombre
    if (!fullName || fullName.trim().length === 0) {
      return {
        success: false,
        message: 'El nombre no puede estar vacío',
      }
    }

    if (fullName.trim().length < 3) {
      return {
        success: false,
        message: 'El nombre debe tener al menos 3 caracteres',
      }
    }

    // Actualizar perfil
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', profile.id)

    if (error) {
      console.error('Error updating profile:', error)
      return {
        success: false,
        message: 'Error al actualizar el perfil',
      }
    }

    // Revalidar rutas que usan el perfil
    revalidatePath('/dashboard')
    revalidatePath('/configuracion')

    return {
      success: true,
      message: 'Perfil actualizado exitosamente',
    }
  } catch (err) {
    console.error('Unexpected error in updateProfile:', err)
    return {
      success: false,
      message: 'Error inesperado al actualizar el perfil',
    }
  }
}

/**
 * Cambiar contraseña del usuario
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<UpdateProfileResult> {
  try {
    const profile = await getUserProfile()
    const supabase = await createClient()

    // Validar contraseña actual
    if (!currentPassword || currentPassword.length === 0) {
      return {
        success: false,
        message: 'Debes ingresar tu contraseña actual',
      }
    }

    // Validar nueva contraseña
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres',
      }
    }

    if (currentPassword === newPassword) {
      return {
        success: false,
        message: 'La nueva contraseña debe ser diferente a la actual',
      }
    }

    // Verificar contraseña actual intentando re-autenticar
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: currentPassword,
    })

    if (signInError) {
      return {
        success: false,
        message: 'La contraseña actual es incorrecta',
      }
    }

    // Actualizar contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error('Error updating password:', updateError)
      return {
        success: false,
        message: 'Error al cambiar la contraseña',
      }
    }

    return {
      success: true,
      message: 'Contraseña cambiada exitosamente',
    }
  } catch (err) {
    console.error('Unexpected error in changePassword:', err)
    return {
      success: false,
      message: 'Error inesperado al cambiar la contraseña',
    }
  }
}
