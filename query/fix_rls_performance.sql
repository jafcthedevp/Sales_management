-- ====================================
-- FIX RLS PERFORMANCE & SECURITY WARNINGS
-- Corrige los warnings del Database Linter de Supabase
-- ====================================
--
-- Problemas corregidos:
-- 1. Auth RLS Initialization Plan - Envuelve auth.uid() con (select ...)
-- 2. Multiple Permissive Policies - Consolida políticas duplicadas
-- 3. Function Search Path Mutable - Fija search_path en funciones
-- ====================================

-- NOTA: Este script elimina y recrea TODAS las políticas RLS
-- ====================================

-- ====================================
-- PARTE 1: CORREGIR FUNCIONES (SEGURIDAD)
-- ====================================

-- Fix handle_new_user function - Agregar search_path fijo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'contador',
    true
  );
  RETURN NEW;
END;
$$;

-- Fix update_updated_at_column function - Agregar search_path fijo
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix is_admin function - Agregar search_path fijo
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$;

-- Fix is_user_active function - Agregar search_path fijo
CREATE OR REPLACE FUNCTION public.is_user_active()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT is_active = true
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$;

-- Función para obtener estadísticas de ventas de manera eficiente
-- Calcula todas las estadísticas en el servidor de base de datos
CREATE OR REPLACE FUNCTION get_sales_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_sales', COUNT(*)::INTEGER,
    'total_revenue', COALESCE(SUM(monto), 0)::NUMERIC,
    'average_sale', COALESCE(AVG(monto), 0)::NUMERIC,
    'unique_sellers', COUNT(DISTINCT cel_vendedor)::INTEGER
  )
  INTO result
  FROM sales;

  RETURN result;
END;
$$;

-- Dar permisos para que usuarios autenticados puedan ejecutar la función
GRANT EXECUTE ON FUNCTION get_sales_stats() TO authenticated;

-- ====================================
-- PARTE 2: LIMPIAR POLÍTICAS EXISTENTES
-- ====================================

-- Eliminar TODAS las políticas de profiles (antiguas y nuevas)
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los admins pueden ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su perfil" ON public.profiles;
DROP POLICY IF EXISTS "Solo admins pueden crear perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Solo admins pueden eliminar perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Permitir creación de perfiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- Eliminar TODAS las políticas de sales (antiguas y nuevas)
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer ventas" ON public.sales;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver ventas" ON public.sales;
DROP POLICY IF EXISTS "Solo admins pueden insertar ventas" ON public.sales;
DROP POLICY IF EXISTS "Solo admins pueden actualizar ventas" ON public.sales;
DROP POLICY IF EXISTS "Solo admins pueden eliminar ventas" ON public.sales;
DROP POLICY IF EXISTS "sales_select_policy" ON public.sales;
DROP POLICY IF EXISTS "sales_insert_policy" ON public.sales;
DROP POLICY IF EXISTS "sales_update_policy" ON public.sales;
DROP POLICY IF EXISTS "sales_delete_policy" ON public.sales;

-- Eliminar TODAS las políticas de upload_logs (antiguas y nuevas)
DROP POLICY IF EXISTS "Los usuarios pueden ver sus logs de upload" ON public.upload_logs;
DROP POLICY IF EXISTS "Solo admins pueden crear logs de upload" ON public.upload_logs;
DROP POLICY IF EXISTS "Solo admins pueden actualizar logs de upload" ON public.upload_logs;
DROP POLICY IF EXISTS "upload_logs_select_policy" ON public.upload_logs;
DROP POLICY IF EXISTS "upload_logs_insert_policy" ON public.upload_logs;
DROP POLICY IF EXISTS "upload_logs_update_policy" ON public.upload_logs;

-- Eliminar TODAS las políticas de export_logs (antiguas y nuevas)
DROP POLICY IF EXISTS "Los usuarios pueden ver sus logs de exportación" ON public.export_logs;
DROP POLICY IF EXISTS "Usuarios pueden crear logs de exportación" ON public.export_logs;
DROP POLICY IF EXISTS "export_logs_select_policy" ON public.export_logs;
DROP POLICY IF EXISTS "export_logs_insert_policy" ON public.export_logs;

-- ====================================
-- POLÍTICAS PARA: profiles (OPTIMIZADAS)
-- ====================================

-- CONSOLIDADA: Ver perfiles (usuarios ven el suyo, admins ven todos)
CREATE POLICY "profiles_select_policy"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = (select auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- Actualizar perfiles (usuarios actualizan el suyo, no pueden cambiar rol)
CREATE POLICY "profiles_update_policy"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (
    id = (select auth.uid())
    AND (
      -- Si es admin, puede cambiar cualquier cosa
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (select auth.uid())
        AND role = 'admin'
      )
      OR
      -- Si no es admin, no puede cambiar su propio rol
      role = (SELECT role FROM public.profiles WHERE id = (select auth.uid()))
    )
  );

-- Solo admins pueden crear perfiles
CREATE POLICY "profiles_insert_policy"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- Solo admins pueden eliminar perfiles
CREATE POLICY "profiles_delete_policy"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- ====================================
-- POLÍTICAS PARA: sales (OPTIMIZADAS)
-- ====================================

-- CONSOLIDADA: Usuarios autenticados activos pueden ver ventas
CREATE POLICY "sales_select_policy"
  ON public.sales
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND is_active = true
    )
  );

-- Solo admins activos pueden insertar ventas
CREATE POLICY "sales_insert_policy"
  ON public.sales
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Solo admins activos pueden actualizar ventas
CREATE POLICY "sales_update_policy"
  ON public.sales
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Solo admins activos pueden eliminar ventas
CREATE POLICY "sales_delete_policy"
  ON public.sales
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
      AND is_active = true
    )
  );

-- ====================================
-- POLÍTICAS PARA: upload_logs (OPTIMIZADAS)
-- ====================================

-- Los usuarios ven sus propios logs, admins ven todos
CREATE POLICY "upload_logs_select_policy"
  ON public.upload_logs
  FOR SELECT
  TO authenticated
  USING (
    uploaded_by = (select auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- Solo admins activos pueden crear logs de upload
CREATE POLICY "upload_logs_insert_policy"
  ON public.upload_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Solo admins pueden actualizar logs de upload
CREATE POLICY "upload_logs_update_policy"
  ON public.upload_logs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- ====================================
-- POLÍTICAS PARA: export_logs (OPTIMIZADAS)
-- ====================================

-- Los usuarios ven sus propios logs, admins ven todos
CREATE POLICY "export_logs_select_policy"
  ON public.export_logs
  FOR SELECT
  TO authenticated
  USING (
    exported_by = (select auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- Todos los usuarios activos pueden crear logs de exportación
CREATE POLICY "export_logs_insert_policy"
  ON public.export_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND is_active = true
    )
  );

-- ====================================
-- VERIFICACIÓN
-- ====================================

-- Ver todas las políticas creadas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- ====================================
-- RESUMEN DE CAMBIOS
-- ====================================
--
-- ✅ FUNCIONES (SEGURIDAD):
--    - handle_new_user() - Agregado SET search_path = public
--    - update_updated_at_column() - Agregado SET search_path = public
--    - is_admin() - Agregado SET search_path = public
--    - is_user_active() - Agregado SET search_path = public
--    - get_sales_stats() - Nueva función con search_path fijo
--
-- ✅ PERFILES:
--    - Consolidadas políticas SELECT en una sola política
--    - Todas las referencias a auth.uid() envueltas con (select ...)
--    - Eliminadas políticas duplicadas
--
-- ✅ SALES:
--    - Consolidadas políticas SELECT duplicadas
--    - Optimizadas todas las políticas con (select auth.uid())
--
-- ✅ UPLOAD_LOGS:
--    - Optimizadas todas las políticas
--
-- ✅ EXPORT_LOGS:
--    - Optimizadas todas las políticas
--
-- ✅ PERFORMANCE:
--    - auth.uid() ya no se re-evalúa por cada fila
--    - Eliminadas políticas permisivas múltiples
--    - Nombres de políticas simplificados y consistentes
--
-- ✅ SEGURIDAD:
--    - Todas las funciones tienen search_path fijo
--    - Previene ataques de SQL injection via search_path
--
-- ✅ DASHBOARD:
--    - Función get_sales_stats() para cálculos eficientes
--    - Estadísticas correctas (Total ventas, Ingresos, Promedio, Vendedores)
-- ====================================

SELECT '✓ All RLS Performance & Security Optimizations Applied Successfully!' as status;
