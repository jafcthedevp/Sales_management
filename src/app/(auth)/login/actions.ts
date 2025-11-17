'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Esquema de validación para login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type LoginState = {
  error?: string
  success?: boolean
}

/**
 * Server Action para iniciar sesión
 */
export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  // Validar datos del formulario
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.issues[0].message,
    }
  }

  const { email, password } = validatedFields.data

  const supabase = await createClient()

  // Intentar iniciar sesión
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: 'Credenciales inválidas. Por favor verifica tu email y contraseña.',
    }
  }

  // Verificar que el usuario tenga perfil y esté activo
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      await supabase.auth.signOut()
      return {
        error: 'No se encontró el perfil del usuario. Por favor contacta al administrador.',
      }
    }

    // TypeScript assertion para el tipo de profile
    const userProfile = profile as { is_active: boolean }

    if (!userProfile.is_active) {
      await supabase.auth.signOut()
      return {
        error: 'Tu cuenta está inactiva. Contacta al administrador.',
      }
    }
  }

  // Redirigir al dashboard
  redirect('/dashboard')
}

/**
 * Server Action para cerrar sesión
 */
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
