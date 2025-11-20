-- Crear tabla de logs de exportación
CREATE TABLE IF NOT EXISTS public.export_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  records_count INTEGER NOT NULL,
  filters JSONB,
  columns TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_export_logs_exported_by ON public.export_logs(exported_by);
CREATE INDEX IF NOT EXISTS idx_export_logs_created_at ON public.export_logs(created_at DESC);

-- Políticas RLS
ALTER TABLE public.export_logs ENABLE ROW LEVEL SECURITY;

-- Los usuarios autenticados pueden ver sus propias exportaciones
CREATE POLICY "Los usuarios pueden ver sus propias exportaciones"
  ON public.export_logs FOR SELECT TO authenticated
  USING (exported_by = auth.uid());

-- Los usuarios autenticados pueden crear exportaciones
CREATE POLICY "Los usuarios pueden crear exportaciones"
  ON public.export_logs FOR INSERT TO authenticated
  WITH CHECK (exported_by = auth.uid());

-- Los administradores pueden ver todas las exportaciones
CREATE POLICY "Los admins pueden ver todas las exportaciones"
  ON public.export_logs FOR SELECT TO authenticated
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Comentarios
COMMENT ON TABLE public.export_logs IS 'Registro de exportaciones de datos a Excel';
COMMENT ON COLUMN public.export_logs.exported_by IS 'Usuario que realizó la exportación';
COMMENT ON COLUMN public.export_logs.records_count IS 'Número de registros exportados';
COMMENT ON COLUMN public.export_logs.filters IS 'Filtros aplicados en formato JSON';
COMMENT ON COLUMN public.export_logs.columns IS 'Columnas seleccionadas para la exportación';
