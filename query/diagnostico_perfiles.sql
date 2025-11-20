-- ====================================
-- DIAGNÓSTICO DE PERFILES Y RLS
-- ====================================

-- 1. Ver todos los usuarios de auth.users
SELECT
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 2. Ver todos los perfiles en public.profiles
SELECT
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- 3. Verificar usuarios que tienen auth pero NO tienen perfil
SELECT
  u.id,
  u.email,
  u.created_at as user_created_at,
  p.id as profile_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 4. Ver las políticas actuales de la tabla profiles
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 5. Ver el trigger handle_new_user
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth'
  AND trigger_name = 'on_auth_user_created';

-- ====================================
-- INSTRUCCIONES:
-- ====================================
-- 1. Ejecuta este script completo
-- 2. Revisa los resultados:
--    - Si hay usuarios sin perfil (consulta 3), necesitas crearlos
--    - Si no hay trigger (consulta 5), necesitas recrearlo
--    - Si las políticas están mal (consulta 4), verifica el script fix_rls
-- ====================================
