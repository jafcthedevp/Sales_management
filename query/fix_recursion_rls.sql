-- ====================================
-- FIX: RECURSIÓN INFINITA EN POLÍTICAS RLS
-- ====================================
-- Este script corrige el error: "infinite recursion detected in policy"
--
-- PROBLEMA: Las políticas consultaban la tabla profiles dentro de las
-- políticas de profiles, causando recursión infinita.
--
-- SOLUCIÓN: Usar funciones con SECURITY DEFINER que bypasean RLS
-- ====================================

-- ====================================
-- PASO 1: ELIMINAR TODAS LAS POLÍTICAS ACTUALES
-- ====================================

-- Profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- Sales
DROP POLICY IF EXISTS "sales_select_policy" ON public.sales;
DROP POLICY IF EXISTS "sales_insert_policy" ON public.sales;
DROP POLICY IF EXISTS "sales_update_policy" ON public.sales;
DROP POLICY IF EXISTS "sales_delete_policy" ON public.sales;

-- Upload logs
DROP POLICY IF EXISTS "upload_logs_select_policy" ON public.upload_logs;
DROP POLICY IF EXISTS "upload_logs_insert_policy" ON public.upload_logs;
DROP POLICY IF EXISTS "upload_logs_update_policy" ON public.upload_logs;

-- Export logs
DROP POLICY IF EXISTS "export_logs_select_policy" ON public.export_logs;
DROP POLICY IF EXISTS "export_logs_insert_policy" ON public.export_logs;

-- ====================================
-- PASO 2: CREAR FUNCIONES AUXILIARES (SECURITY DEFINER)
-- ====================================
-- Estas funciones bypasean RLS porque usan SECURITY DEFINER

-- Función: Obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT role
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- Función: Verificar si el usuario está activo
CREATE OR REPLACE FUNCTION public.is_user_active_rls()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE(
    (
      SELECT is_active
      FROM public.profiles
      WHERE id = auth.uid()
      LIMIT 1
    ),
    false
  );
END;
$$;

-- ====================================
-- PASO 3: CREAR POLÍTICAS SIN RECURSIÓN
-- ====================================

-- ====================================
-- PROFILES - Sin recursión
-- ====================================

-- SELECT: Los usuarios ven su perfil, admins ven todos
CREATE POLICY "profiles_select_policy"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    -- El usuario puede ver su propio perfil
    id = (select auth.uid())
    OR
    -- O si es admin (usando función que bypasea RLS)
    public.get_user_role() = 'admin'
  );

-- UPDATE: Los usuarios pueden actualizar su perfil
CREATE POLICY "profiles_update_policy"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (
    id = (select auth.uid())
    AND (
      -- Si es admin, puede cambiar todo
      public.get_user_role() = 'admin'
      OR
      -- Si no es admin, no puede cambiar su rol
      role = (SELECT role FROM public.profiles WHERE id = (select auth.uid()) LIMIT 1)
    )
  );

-- INSERT: Solo admins pueden crear perfiles
CREATE POLICY "profiles_insert_policy"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role() = 'admin'
  );

-- DELETE: Solo admins pueden eliminar perfiles
CREATE POLICY "profiles_delete_policy"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    public.get_user_role() = 'admin'
  );

-- ====================================
-- SALES - Sin recursión
-- ====================================

-- SELECT: Usuarios activos pueden ver ventas
CREATE POLICY "sales_select_policy"
  ON public.sales
  FOR SELECT
  TO authenticated
  USING (
    public.is_user_active_rls() = true
  );

-- INSERT: Solo admins activos pueden insertar
CREATE POLICY "sales_insert_policy"
  ON public.sales
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role() = 'admin'
    AND public.is_user_active_rls() = true
  );

-- UPDATE: Solo admins activos pueden actualizar
CREATE POLICY "sales_update_policy"
  ON public.sales
  FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role() = 'admin'
    AND public.is_user_active_rls() = true
  );

-- DELETE: Solo admins activos pueden eliminar
CREATE POLICY "sales_delete_policy"
  ON public.sales
  FOR DELETE
  TO authenticated
  USING (
    public.get_user_role() = 'admin'
    AND public.is_user_active_rls() = true
  );

-- ====================================
-- UPLOAD_LOGS - Sin recursión
-- ====================================

-- SELECT: Usuarios ven sus logs, admins ven todos
CREATE POLICY "upload_logs_select_policy"
  ON public.upload_logs
  FOR SELECT
  TO authenticated
  USING (
    uploaded_by = (select auth.uid())
    OR
    public.get_user_role() = 'admin'
  );

-- INSERT: Solo admins activos pueden crear
CREATE POLICY "upload_logs_insert_policy"
  ON public.upload_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role() = 'admin'
    AND public.is_user_active_rls() = true
  );

-- UPDATE: Solo admins pueden actualizar
CREATE POLICY "upload_logs_update_policy"
  ON public.upload_logs
  FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role() = 'admin'
  );

-- ====================================
-- EXPORT_LOGS - Sin recursión
-- ====================================

-- SELECT: Usuarios ven sus logs, admins ven todos
CREATE POLICY "export_logs_select_policy"
  ON public.export_logs
  FOR SELECT
  TO authenticated
  USING (
    exported_by = (select auth.uid())
    OR
    public.get_user_role() = 'admin'
  );

-- INSERT: Usuarios activos pueden crear logs de exportación
CREATE POLICY "export_logs_insert_policy"
  ON public.export_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_user_active_rls() = true
  );

-- ====================================
-- PASO 4: DAR PERMISOS A LAS FUNCIONES
-- ====================================

GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_active_rls() TO authenticated;

-- ====================================
-- VERIFICACIÓN
-- ====================================

-- Ver todas las políticas creadas
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Ver las funciones creadas
SELECT
  routine_schema,
  routine_name,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_user_role', 'is_user_active_rls');

-- ====================================
-- RESUMEN DE CAMBIOS
-- ====================================
--
-- ✅ FUNCIONES AUXILIARES (public schema):
--    - public.get_user_role() - Retorna el rol sin causar recursión
--    - public.is_user_active_rls() - Verifica si está activo sin recursión
--    - Ambas usan SECURITY DEFINER para bypassear RLS
--
-- ✅ POLÍTICAS SIN RECURSIÓN:
--    - profiles: 4 políticas (select, update, insert, delete)
--    - sales: 4 políticas (select, insert, update, delete)
--    - upload_logs: 3 políticas (select, insert, update)
--    - export_logs: 2 políticas (select, insert)
--
-- ✅ OPTIMIZACIÓN:
--    - Todas usan (select auth.uid()) en lugar de auth.uid()
--    - Las funciones auxiliares evitan la recursión infinita
--    - SECURITY DEFINER permite consultar profiles sin activar RLS
--    - Funciones en schema public (no auth) para evitar permisos
--
-- ✅ SEGURIDAD:
--    - SET search_path = public en todas las funciones
--    - Previene SQL injection y ataques de schema hijacking
-- ====================================

SELECT '✓ Recursión infinita corregida! Políticas RLS aplicadas exitosamente.' as status;
