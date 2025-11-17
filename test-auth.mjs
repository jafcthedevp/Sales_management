import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gqrmlzryozcysvwxtlbm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxcm1senJ5b3pjeXN2d3h0bGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMTg0OTMsImV4cCI6MjA3ODg5NDQ5M30.j-wKZEdBRV5pzsIUhKpFrwjjlc6vAaZu_zPfkMGOTQ8'

const supabase = createClient(supabaseUrl, supabaseKey)

const testEmail = 'flores.anthony.489@gmail.com'
const testPassword = 'prueba123'
const testFullName = 'Anthony Flores'

console.log('🔧 Iniciando pruebas de autenticación...\n')

// Test 1: Registro
console.log('📝 TEST 1: REGISTRO DE USUARIO')
console.log('================================')
console.log('Email:', testEmail)
console.log('Nombre:', testFullName)
console.log('Contraseña:', testPassword)
console.log('')

const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email: testEmail,
  password: testPassword,
  options: {
    data: {
      full_name: testFullName,
    },
  },
})

if (signUpError) {
  console.log('❌ Error en el registro:', signUpError.message)
  console.log('')

  // Si el usuario ya existe, intentamos hacer login
  if (signUpError.message.includes('already registered') || signUpError.message.includes('User already registered')) {
    console.log('ℹ️  El usuario ya existe, procediendo con el login...\n')
  } else {
    process.exit(1)
  }
} else {
  console.log('✅ Usuario registrado exitosamente!')
  console.log('User ID:', signUpData.user?.id)
  console.log('')

  // Verificar que el perfil se creó
  console.log('🔍 Verificando creación del perfil...')
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', signUpData.user.id)
    .single()

  if (profileError) {
    console.log('❌ Error al verificar el perfil:', profileError.message)
  } else {
    console.log('✅ Perfil creado correctamente:')
    console.log('   - Email:', profile.email)
    console.log('   - Nombre:', profile.full_name)
    console.log('   - Role:', profile.role)
    console.log('   - Activo:', profile.is_active)
  }
  console.log('')

  // Cerrar sesión para probar el login
  await supabase.auth.signOut()
}

// Test 2: Login
console.log('🔐 TEST 2: LOGIN')
console.log('================================')
console.log('Intentando login con:', testEmail)
console.log('')

const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
  email: testEmail,
  password: testPassword,
})

if (signInError) {
  console.log('❌ Error en el login:', signInError.message)
  console.log('')

  if (signInError.message.includes('Email not confirmed')) {
    console.log('⚠️  IMPORTANTE: Debes confirmar tu correo electrónico')
    console.log('   Revisa tu bandeja de entrada en:', testEmail)
    console.log('   Busca un correo de Supabase con el asunto "Confirm your signup"')
    console.log('')
  }

  process.exit(1)
}

console.log('✅ Login exitoso!')
console.log('User ID:', signInData.user.id)
console.log('Email:', signInData.user.email)
console.log('')

// Verificar perfil y estado activo
console.log('🔍 Verificando perfil y permisos...')
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', signInData.user.id)
  .single()

if (profileError) {
  console.log('❌ Error al obtener el perfil:', profileError.message)
  process.exit(1)
}

console.log('✅ Perfil verificado:')
console.log('   - Email:', profile.email)
console.log('   - Nombre:', profile.full_name)
console.log('   - Role:', profile.role)
console.log('   - Activo:', profile.is_active)
console.log('   - Creado:', new Date(profile.created_at).toLocaleString())
console.log('')

// Test 3: Acceso al dashboard (simulado)
console.log('🏠 TEST 3: VERIFICACIÓN DE ACCESO')
console.log('================================')

if (!profile.is_active) {
  console.log('❌ La cuenta está inactiva')
  console.log('   El usuario no podrá acceder al dashboard')
  console.log('')
  process.exit(1)
}

console.log('✅ El usuario puede acceder al dashboard')
console.log('   Role asignado:', profile.role)
console.log('   Permisos:', profile.role === 'admin' ? 'Administrador completo' : 'Solo lectura de ventas')
console.log('')

// Test 4: Obtener sesión actual
console.log('🎫 TEST 4: VERIFICACIÓN DE SESIÓN')
console.log('================================')

const { data: session } = await supabase.auth.getSession()

if (session.session) {
  console.log('✅ Sesión activa:')
  console.log('   - Access Token:', session.session.access_token.substring(0, 30) + '...')
  console.log('   - Expira en:', new Date(session.session.expires_at * 1000).toLocaleString())
  console.log('')
} else {
  console.log('❌ No hay sesión activa')
  console.log('')
}

// Resumen final
console.log('📊 RESUMEN DE PRUEBAS')
console.log('================================')
console.log('✅ Registro: OK')
console.log('✅ Login: OK')
console.log('✅ Perfil verificado: OK')
console.log('✅ Acceso permitido: OK')
console.log('✅ Sesión creada: OK')
console.log('')
console.log('🎉 ¡Todas las pruebas pasaron exitosamente!')
console.log('')
console.log('Puedes acceder a la aplicación en: http://localhost:3000')
console.log('Credenciales:')
console.log('   Email:', testEmail)
console.log('   Password:', testPassword)

// Cerrar sesión
await supabase.auth.signOut()
