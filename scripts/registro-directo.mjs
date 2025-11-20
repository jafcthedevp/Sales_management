import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gqrmlzryozcysvwxtlbm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxcm1senJ5b3pjeXN2d3h0bGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMTg0OTMsImV4cCI6MjA3ODg5NDQ5M30.j-wKZEdBRV5pzsIUhKpFrwjjlc6vAaZu_zPfkMGOTQ8'

const supabase = createClient(supabaseUrl, supabaseKey)

const testEmail = 'flores.anthony.489@gmail.com'
const testPassword = 'prueba123'
const testFullName = 'Anthony Flores'

console.log('🔧 Intentando registrar usuario en Supabase...')
console.log('Email:', testEmail)
console.log('Nombre:', testFullName)
console.log('')

try {
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: testFullName,
      },
      emailRedirectTo: 'http://localhost:3000/dashboard',
    },
  })

  if (error) {
    console.log('❌ Error al registrar:', error.message)
    console.log('Código de error:', error.status)
    console.log('')

    if (error.message.includes('already registered') || error.message.includes('User already registered')) {
      console.log('ℹ️  El usuario ya existe. Intentando verificar el estado...')
      console.log('')

      // Intentar login para verificar si el email está confirmado
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      })

      if (loginError) {
        if (loginError.message.includes('Email not confirmed')) {
          console.log('⚠️  IMPORTANTE: El usuario existe pero el email NO está confirmado')
          console.log('   Opciones:')
          console.log('   1. Revisa tu correo (incluyendo spam) para el email de confirmación')
          console.log('   2. O puedes deshabilitar la confirmación de email en Supabase')
          console.log('')
          console.log('   Para deshabilitar la confirmación de email:')
          console.log('   - Ve a: https://gqrmlzryozcysvwxtlbm.supabase.co/project/_/auth/providers')
          console.log('   - En "Email Auth" desactiva "Confirm email"')
          console.log('')
        } else {
          console.log('❌ Error al hacer login:', loginError.message)
        }
      } else {
        console.log('✅ El usuario ya existe y está confirmado')
        console.log('✅ Puedes hacer login directamente en: http://localhost:3000/login')
        console.log('')

        // Verificar perfil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', loginData.user.id)
          .single()

        if (!profileError && profile) {
          console.log('📋 Información del perfil:')
          console.log('   - Email:', profile.email)
          console.log('   - Nombre:', profile.full_name)
          console.log('   - Rol:', profile.role)
          console.log('   - Activo:', profile.is_active)
          console.log('')
        }

        await supabase.auth.signOut()
      }
    }
    process.exit(1)
  }

  console.log('✅ Registro exitoso!')
  console.log('')
  console.log('📧 Información de confirmación:')
  console.log('   - User ID:', data.user?.id)
  console.log('   - Email:', data.user?.email)
  console.log('   - Email confirmado:', data.user?.email_confirmed_at ? 'SÍ' : 'NO')
  console.log('   - Identidades:', data.user?.identities?.length || 0)
  console.log('')

  if (!data.user?.email_confirmed_at) {
    console.log('⚠️  El email NO está confirmado')
    console.log('')
    console.log('Opciones:')
    console.log('1. Revisa tu correo: ' + testEmail)
    console.log('   - Busca en spam también')
    console.log('   - Asunto: "Confirm your signup" o similar')
    console.log('')
    console.log('2. Si no llega el correo, puede ser que:')
    console.log('   a) Supabase no tenga configurado un proveedor de email SMTP')
    console.log('   b) La confirmación de email esté habilitada pero sin configuración')
    console.log('')
    console.log('3. SOLUCIÓN: Deshabilitar la confirmación de email en Supabase:')
    console.log('   - Ve a: https://gqrmlzryozcysvwxtlbm.supabase.co/project/_/auth/providers')
    console.log('   - Busca "Email Auth"')
    console.log('   - Desactiva "Confirm email"')
    console.log('   - Guarda cambios')
    console.log('   - Luego elimina el usuario actual y regístralo de nuevo')
    console.log('')
  } else {
    console.log('✅ ¡Email confirmado automáticamente!')
    console.log('   Puedes hacer login en: http://localhost:3000/login')
    console.log('')
  }

  // Verificar si el perfil se creó
  if (data.user) {
    console.log('🔍 Verificando creación del perfil...')

    // Esperar un momento para que el trigger se ejecute
    await new Promise(resolve => setTimeout(resolve, 2000))

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.log('❌ Error al verificar perfil:', profileError.message)
      console.log('   Esto puede significar que el trigger de base de datos no se ejecutó')
      console.log('')
    } else if (profile) {
      console.log('✅ Perfil creado correctamente:')
      console.log('   - Email:', profile.email)
      console.log('   - Nombre:', profile.full_name)
      console.log('   - Rol:', profile.role)
      console.log('   - Activo:', profile.is_active)
      console.log('   - Creado:', new Date(profile.created_at).toLocaleString())
      console.log('')
    }
  }

  console.log('─'.repeat(60))
  console.log('📊 RESUMEN:')
  console.log('─'.repeat(60))
  console.log('✅ Usuario registrado en Supabase Auth')
  if (data.user?.email_confirmed_at) {
    console.log('✅ Email confirmado automáticamente')
    console.log('✅ Perfil creado')
    console.log('✅ PUEDES HACER LOGIN AHORA: http://localhost:3000/login')
  } else {
    console.log('⚠️  Email pendiente de confirmación')
    console.log('   Revisa tu correo o deshabilita la confirmación en Supabase')
  }
  console.log('─'.repeat(60))

} catch (err) {
  console.log('❌ Error inesperado:', err.message)
  process.exit(1)
}
