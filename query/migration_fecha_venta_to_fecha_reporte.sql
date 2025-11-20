-- ====================================
-- MIGRACIÓN: fecha_venta → fecha_reporte
-- ====================================
-- Este script migra la columna fecha_venta a fecha_reporte
-- para que coincida con el código de la aplicación
-- ====================================

-- Verificar si la columna fecha_venta existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'sales'
        AND column_name = 'fecha_venta'
    ) THEN
        -- Renombrar la columna
        ALTER TABLE public.sales
        RENAME COLUMN fecha_venta TO fecha_reporte;

        RAISE NOTICE 'Columna fecha_venta renombrada a fecha_reporte exitosamente';
    ELSE
        RAISE NOTICE 'La columna fecha_venta no existe o ya fue migrada';
    END IF;
END $$;

-- Verificar si el índice existe y renombrarlo
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'sales'
        AND indexname = 'idx_sales_fecha_venta'
    ) THEN
        -- Renombrar el índice
        ALTER INDEX public.idx_sales_fecha_venta
        RENAME TO idx_sales_fecha_reporte;

        RAISE NOTICE 'Índice renombrado exitosamente';
    ELSE
        RAISE NOTICE 'El índice ya fue renombrado o no existe';
    END IF;
END $$;

-- Actualizar comentario de la columna
COMMENT ON COLUMN public.sales.fecha_reporte IS 'Fecha del reporte de venta';

-- Verificación final
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'sales'
    AND column_name = 'fecha_reporte';

SELECT '✓ Migración completada! La columna fecha_reporte está lista.' as status;
