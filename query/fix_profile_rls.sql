-- ====================================
-- FIX: Permitir creación automática de perfiles
-- ====================================
-- Este script soluciona el error de RLS al crear perfiles

-- 1. Eliminar la política restrictiva actual
DROP POLICY IF EXISTS "Solo admins pueden crear perfiles" ON public.profiles;

-- 2. Crear nueva política que permite:
--    - Al trigger crear el perfil automáticamente (service_role)
--    - A los admins crear perfiles manualmente
CREATE POLICY "Permitir creación de perfiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    -- Permite al trigger (service_role) crear perfiles automáticamente
    -- O permite a admins crear perfiles manualmente
    auth.uid() = id  -- El trigger crea con el mismo ID del usuario
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ====================================
-- ALTERNATIVA: Si el problema persiste, usar esto
-- ====================================
-- Esta opción desactiva temporalmente RLS para INSERT
-- Solo úsala si la política de arriba no funciona

-- DROP POLICY IF EXISTS "Permitir creación de perfiles" ON public.profiles;

-- CREATE POLICY "Permitir creación automática de perfiles"
--   ON public.profiles
--   FOR INSERT
--   TO authenticated, anon
--   WITH CHECK (true);  -- Permite cualquier INSERT

-- NOTA: Después de crear tu primer admin, puedes volver a la política restrictiva

-- ====================================
-- VERIFICACIÓN: Comprobar que el trigger existe
-- ====================================

-- Ver el trigger actual
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth';

-- ====================================
-- PASOS DESPUÉS DE EJECUTAR ESTE SCRIPT:
-- ====================================
-- 1. Ejecutar este script en Supabase SQL Editor
-- 2. Ir a Authentication > Users
-- 3. Crear un nuevo usuario manualmente
-- 4. El trigger debería crear el perfil automáticamente
-- 5. Actualizar el rol a 'admin':
--
--    UPDATE public.profiles
--    SET role = 'admin'
--    WHERE email = 'tu-email@ejemplo.com';
--
-- 6. Ya puedes usar ese usuario para crear otros perfiles desde la app
-- ====================================
