'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface ForgotPasswordResult {
  success: boolean
  message: string
}

/**
 * Enviar email de recuperación de contraseña
 */
export async function sendPasswordResetEmail(email: string): Promise<ForgotPasswordResult> {
  try {
    const supabase = await createClient()

    // Validar email
    if (!email || !email.includes('@')) {
      return {
        success: false,
        message: 'Por favor ingresa un email válido',
      }
    }

    // Construir URL de redirección correcta
    const redirectUrl = new URL('/reset-password', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')

    // Enviar email de recuperación
    // IMPORTANTE: Supabase enviará un enlace con un código que será interceptado por el middleware
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl.toString(),
    })

    if (error) {
      console.error('Error sending password reset email:', error)
      return {
        success: false,
        message: 'Error al enviar el email de recuperación',
      }
    }

    return {
      success: true,
      message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación. Revisa tu bandeja de entrada y spam.',
    }
  } catch (err) {
    console.error('Unexpected error in sendPasswordResetEmail:', err)
    return {
      success: false,
      message: 'Error inesperado al enviar el email',
    }
  }
}

/**
 * Resetear contraseña con el token
 */
export async function resetPassword(newPassword: string): Promise<ForgotPasswordResult> {
  try {
    const supabase = await createClient()

    // Validar contraseña
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
      }
    }

    // Actualizar contraseña
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error('Error resetting password:', error)
      return {
        success: false,
        message: 'Error al restablecer la contraseña. El enlace puede haber expirado.',
      }
    }

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
    }
  } catch (err) {
    console.error('Unexpected error in resetPassword:', err)
    return {
      success: false,
      message: 'Error inesperado al restablecer la contraseña',
    }
  }
}
