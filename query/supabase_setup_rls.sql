-- ====================================
-- SALES MANAGEMENT SYSTEM - ROW LEVEL SECURITY (RLS)
-- Script para configurar todas las políticas de seguridad
-- ====================================

-- IMPORTANTE: Ejecutar este script DESPUÉS de supabase_setup_tables.sql

-- ====================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ====================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_logs ENABLE ROW LEVEL SECURITY;

-- ====================================
-- POLÍTICAS PARA: profiles
-- ====================================

-- Permitir que los usuarios vean su propio perfil
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Permitir que los admins vean todos los perfiles
DROP POLICY IF EXISTS "Los admins pueden ver todos los perfiles" ON public.profiles;
CREATE POLICY "Los admins pueden ver todos los perfiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Permitir que los usuarios actualicen su propio perfil (excepto el rol)
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su perfil" ON public.profiles;
CREATE POLICY "Los usuarios pueden actualizar su perfil"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Si es admin, puede cambiar cualquier cosa
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      OR
      -- Si no es admin, no puede cambiar su propio rol
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = role
    )
  );

-- Solo admins pueden crear nuevos perfiles
DROP POLICY IF EXISTS "Solo admins pueden crear perfiles" ON public.profiles;
CREATE POLICY "Solo admins pueden crear perfiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Solo admins pueden eliminar perfiles
DROP POLICY IF EXISTS "Solo admins pueden eliminar perfiles" ON public.profiles;
CREATE POLICY "Solo admins pueden eliminar perfiles"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ====================================
-- POLÍTICAS PARA: sales
-- ====================================

-- Todos los usuarios autenticados pueden ver las ventas
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer ventas" ON public.sales;
CREATE POLICY "Usuarios autenticados pueden leer ventas"
  ON public.sales
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- Solo admins pueden insertar ventas
DROP POLICY IF EXISTS "Solo admins pueden insertar ventas" ON public.sales;
CREATE POLICY "Solo admins pueden insertar ventas"
  ON public.sales
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Solo admins pueden actualizar ventas
DROP POLICY IF EXISTS "Solo admins pueden actualizar ventas" ON public.sales;
CREATE POLICY "Solo admins pueden actualizar ventas"
  ON public.sales
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Solo admins pueden eliminar ventas
DROP POLICY IF EXISTS "Solo admins pueden eliminar ventas" ON public.sales;
CREATE POLICY "Solo admins pueden eliminar ventas"
  ON public.sales
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- ====================================
-- POLÍTICAS PARA: upload_logs
-- ====================================

-- Los usuarios pueden ver sus propios logs de upload
DROP POLICY IF EXISTS "Los usuarios pueden ver sus logs de upload" ON public.upload_logs;
CREATE POLICY "Los usuarios pueden ver sus logs de upload"
  ON public.upload_logs
  FOR SELECT
  TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Solo admins pueden crear logs de upload
DROP POLICY IF EXISTS "Solo admins pueden crear logs de upload" ON public.upload_logs;
CREATE POLICY "Solo admins pueden crear logs de upload"
  ON public.upload_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Solo admins pueden actualizar logs de upload
DROP POLICY IF EXISTS "Solo admins pueden actualizar logs de upload" ON public.upload_logs;
CREATE POLICY "Solo admins pueden actualizar logs de upload"
  ON public.upload_logs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ====================================
-- POLÍTICAS PARA: export_logs
-- ====================================

-- Los usuarios pueden ver sus propios logs de exportación
DROP POLICY IF EXISTS "Los usuarios pueden ver sus logs de exportación" ON public.export_logs;
CREATE POLICY "Los usuarios pueden ver sus logs de exportación"
  ON public.export_logs
  FOR SELECT
  TO authenticated
  USING (
    exported_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Todos los usuarios autenticados pueden crear logs de exportación
DROP POLICY IF EXISTS "Usuarios pueden crear logs de exportación" ON public.export_logs;
CREATE POLICY "Usuarios pueden crear logs de exportación"
  ON public.export_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND is_active = true
    )
  );

-- ====================================
-- FUNCIÓN AUXILIAR: Verificar si es admin
-- (Útil para usar en la aplicación)
-- ====================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- FUNCIÓN AUXILIAR: Verificar si usuario está activo
-- ====================================

CREATE OR REPLACE FUNCTION public.is_user_active()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- GRANTS - Permisos básicos
-- ====================================

-- Permitir a usuarios autenticados usar las secuencias
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Permitir operaciones básicas a usuarios autenticados
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- ====================================
-- RESUMEN DE POLÍTICAS RLS
-- ====================================
--
-- PROFILES:
-- ✓ Los usuarios pueden ver su propio perfil
-- ✓ Los admins pueden ver todos los perfiles
-- ✓ Los usuarios pueden actualizar su perfil (excepto rol)
-- ✓ Solo admins pueden crear/eliminar perfiles
--
-- SALES:
-- ✓ Todos pueden leer ventas (si están activos)
-- ✓ Solo admins pueden insertar/actualizar/eliminar ventas
--
-- UPLOAD_LOGS:
-- ✓ Los usuarios ven sus propios logs, admins ven todos
-- ✓ Solo admins pueden crear/actualizar logs
--
-- EXPORT_LOGS:
-- ✓ Los usuarios ven sus propios logs, admins ven todos
-- ✓ Todos los usuarios activos pueden crear logs de exportación
--
-- FUNCIONES AUXILIARES:
-- ✓ is_admin() - Verifica si el usuario es admin
-- ✓ is_user_active() - Verifica si el usuario está activo
-- ====================================
