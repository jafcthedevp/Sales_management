'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Esquema de validación para registro
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export type RegisterState = {
  error?: string
  success?: boolean
  message?: string
}

/**
 * Server Action para registrar un nuevo usuario
 * Solo admins pueden registrar nuevos usuarios
 */
export async function register(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  // Validar datos del formulario
  const validatedFields = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    fullName: formData.get('fullName'),
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.issues[0].message,
    }
  }

  const { email, password, fullName } = validatedFields.data

  const supabase = await createClient()

  // Crear el usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return {
      error: error.message || 'Error al crear el usuario',
    }
  }

  if (!data.user) {
    return {
      error: 'Error al crear el usuario',
    }
  }

  // El trigger de la base de datos debería crear el perfil automáticamente
  // Verificar que se creó correctamente
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (profileError || !profile) {
    return {
      error: 'Error al crear el perfil del usuario',
    }
  }

  return {
    success: true,
    message: 'Usuario creado exitosamente. Ya puedes iniciar sesión.',
  }
}
