-- ====================================
-- SALES MANAGEMENT SYSTEM - SETUP DATABASE
-- Script para crear todas las tablas necesarias
-- ====================================

-- Habilitar extensión UUID (si no está habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- 1. TABLA: profiles
-- Extiende los usuarios de auth.users
-- ====================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'contador')) DEFAULT 'contador',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Comentarios de documentación
COMMENT ON TABLE public.profiles IS 'Perfiles de usuarios del sistema';
COMMENT ON COLUMN public.profiles.role IS 'Rol del usuario: admin o contador';
COMMENT ON COLUMN public.profiles.is_active IS 'Indica si el usuario está activo en el sistema';

-- ====================================
-- 2. TABLA: sales
-- Almacena todas las transacciones de ventas
-- ====================================
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Información del vendedor
  cel_vendedor TEXT NOT NULL,

  -- Información del cliente
  numero_cliente TEXT NOT NULL,
  nombre_cliente TEXT,

  -- Información de pago
  metodo_pago TEXT NOT NULL,
  metodo_pago_1 TEXT,
  monto DECIMAL(10,2) NOT NULL,

  -- Ubicación
  region TEXT CHECK (region IN ('LIMA', 'PROVINCIA')),

  -- Metadata
  fecha_reporte DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint de validación
  CONSTRAINT valid_monto CHECK (monto >= 0)
);

-- Índices para optimización de búsquedas
CREATE INDEX IF NOT EXISTS idx_sales_cel_vendedor ON public.sales(cel_vendedor);
CREATE INDEX IF NOT EXISTS idx_sales_numero_cliente ON public.sales(numero_cliente);
CREATE INDEX IF NOT EXISTS idx_sales_fecha_reporte ON public.sales(fecha_reporte);
CREATE INDEX IF NOT EXISTS idx_sales_region ON public.sales(region);
CREATE INDEX IF NOT EXISTS idx_sales_metodo_pago ON public.sales(metodo_pago);
CREATE INDEX IF NOT EXISTS idx_sales_created_by ON public.sales(created_by);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);

-- Comentarios de documentación
COMMENT ON TABLE public.sales IS 'Registro de todas las ventas del sistema';
COMMENT ON COLUMN public.sales.cel_vendedor IS 'Identificador del vendedor (ej: ZAZU-385)';
COMMENT ON COLUMN public.sales.numero_cliente IS 'Número de teléfono o ID del cliente';
COMMENT ON COLUMN public.sales.metodo_pago IS 'Método de pago principal';
COMMENT ON COLUMN public.sales.metodo_pago_1 IS 'Método de pago secundario (opcional)';
COMMENT ON COLUMN public.sales.region IS 'Región de la venta: LIMA o PROVINCIA';

-- ====================================
-- 3. TABLA: upload_logs
-- Registro de cargas de archivos Excel
-- ====================================
CREATE TABLE IF NOT EXISTS public.upload_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id),
  records_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  errors_detail JSONB,
  status TEXT CHECK (status IN ('processing', 'completed', 'failed', 'partial')) DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_upload_logs_uploaded_by ON public.upload_logs(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_upload_logs_status ON public.upload_logs(status);
CREATE INDEX IF NOT EXISTS idx_upload_logs_created_at ON public.upload_logs(created_at);

-- Comentarios
COMMENT ON TABLE public.upload_logs IS 'Registro de cargas de archivos Excel';
COMMENT ON COLUMN public.upload_logs.status IS 'Estado: processing, completed, failed, partial';

-- ====================================
-- 4. TABLA: export_logs
-- Registro de exportaciones realizadas
-- ====================================
CREATE TABLE IF NOT EXISTS public.export_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exported_by UUID REFERENCES public.profiles(id),
  filters_applied JSONB,
  records_count INTEGER DEFAULT 0,
  filename TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_export_logs_exported_by ON public.export_logs(exported_by);
CREATE INDEX IF NOT EXISTS idx_export_logs_created_at ON public.export_logs(created_at);

-- Comentarios
COMMENT ON TABLE public.export_logs IS 'Registro de exportaciones de datos a Excel';
COMMENT ON COLUMN public.export_logs.filters_applied IS 'JSON con los filtros aplicados en la exportación';

-- ====================================
-- 5. FUNCIÓN: Actualizar timestamp updated_at
-- ====================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ====================================
-- 6. TRIGGERS para updated_at
-- ====================================

-- Trigger para profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para sales
DROP TRIGGER IF EXISTS update_sales_updated_at ON public.sales;
CREATE TRIGGER update_sales_updated_at
    BEFORE UPDATE ON public.sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- 7. FUNCIÓN: Crear perfil automáticamente al registrar usuario
-- ====================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ====================================
-- RESUMEN
-- ====================================
-- Tablas creadas:
-- ✓ profiles - Perfiles de usuarios
-- ✓ sales - Registro de ventas
-- ✓ upload_logs - Log de cargas
-- ✓ export_logs - Log de exportaciones
--
-- Funciones creadas:
-- ✓ update_updated_at_column() - Actualiza timestamp
-- ✓ handle_new_user() - Crea perfil automáticamente
--
-- Triggers creados:
-- ✓ Actualización automática de updated_at
-- ✓ Creación automática de perfil al registrar usuario
-- ====================================
