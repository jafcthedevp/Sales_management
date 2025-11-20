-- ====================================
-- SCRIPT DE REPARACIÓN: TRIGGER DE CREACIÓN DE PERFIL
-- Ejecuta este script en el SQL Editor de Supabase
-- ====================================

-- Paso 1: Eliminar trigger y función existentes (si existen)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Paso 2: Crear la función mejorada para crear perfiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    'contador',
    true
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Registrar el error pero no fallar la creación del usuario
    RAISE WARNING 'Error al crear perfil para usuario %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 3: Crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Paso 4: Dar permisos necesarios
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Paso 5: Crear perfiles para usuarios existentes que no tengan perfil
INSERT INTO public.profiles (id, email, full_name, role, is_active)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Usuario'),
  'contador',
  true
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Paso 6: Verificar que todo está correcto
DO $$
DECLARE
  trigger_count INTEGER;
  users_count INTEGER;
  profiles_count INTEGER;
  orphan_users INTEGER;
BEGIN
  -- Contar trigger
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_name = 'on_auth_user_created';

  -- Contar usuarios y perfiles
  SELECT COUNT(*) INTO users_count FROM auth.users;
  SELECT COUNT(*) INTO profiles_count FROM public.profiles;

  -- Contar usuarios sin perfil
  SELECT COUNT(*) INTO orphan_users
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL;

  -- Mostrar resultados
  RAISE NOTICE '================================';
  RAISE NOTICE 'RESULTADOS DE LA VERIFICACIÓN';
  RAISE NOTICE '================================';
  RAISE NOTICE 'Trigger creado: %', CASE WHEN trigger_count > 0 THEN 'SÍ ✓' ELSE 'NO ✗' END;
  RAISE NOTICE 'Total de usuarios: %', users_count;
  RAISE NOTICE 'Total de perfiles: %', profiles_count;
  RAISE NOTICE 'Usuarios sin perfil: %', orphan_users;

  IF orphan_users > 0 THEN
    RAISE WARNING 'Hay % usuario(s) sin perfil. Revisa manualmente.', orphan_users;
  ELSE
    RAISE NOTICE 'Todo está correcto ✓';
  END IF;
  RAISE NOTICE '================================';
END $$;

-- Paso 7: Mostrar información detallada
SELECT
  'Trigger configurado' as status,
  COUNT(*) as cantidad
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created'

UNION ALL

SELECT
  'Usuarios en auth.users',
  COUNT(*)
FROM auth.users

UNION ALL

SELECT
  'Perfiles en public.profiles',
  COUNT(*)
FROM public.profiles

UNION ALL

SELECT
  'Usuarios SIN perfil',
  COUNT(*)
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Si hay usuarios sin perfil, mostrarlos
SELECT
  u.id as user_id,
  u.email,
  u.created_at as registrado,
  'Sin perfil' as estado
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;
