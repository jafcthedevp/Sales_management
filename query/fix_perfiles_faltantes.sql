-- ====================================
-- CORREGIR PERFILES FALTANTES
-- ====================================
-- Este script crea perfiles para usuarios que no los tienen

-- 1. Crear perfiles para usuarios que no los tienen
INSERT INTO public.profiles (id, email, full_name, role, is_active)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  'contador', -- Rol por defecto
  true        -- Activo por defecto
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 2. Verificar que todos los usuarios ahora tengan perfil
SELECT
  COUNT(*) as usuarios_sin_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 3. Si necesitas hacer admin a algún usuario específico, descomenta y modifica:
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'tu-email@ejemplo.com';

SELECT '✓ Perfiles creados o actualizados exitosamente' as status;
