-- ====================================
-- FIX: Función get_sales_stats()
-- ====================================
-- Versión mejorada con:
-- - SET search_path = public (seguridad)
-- - Mejor manejo de casos edge
-- - Tipos correctos de retorno
-- ====================================

-- Eliminar función anterior si existe
DROP FUNCTION IF EXISTS get_sales_stats();

-- Crear función mejorada
CREATE OR REPLACE FUNCTION get_sales_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  v_total_sales INTEGER;
  v_total_revenue NUMERIC;
  v_average_sale NUMERIC;
  v_unique_sellers INTEGER;
BEGIN
  -- Calcular estadísticas
  SELECT
    COUNT(*)::INTEGER,
    COALESCE(SUM(monto), 0)::NUMERIC,
    COALESCE(AVG(monto), 0)::NUMERIC,
    COUNT(DISTINCT cel_vendedor)::INTEGER
  INTO
    v_total_sales,
    v_total_revenue,
    v_average_sale,
    v_unique_sellers
  FROM public.sales;

  -- Construir objeto JSON
  result := json_build_object(
    'total_sales', v_total_sales,
    'total_revenue', ROUND(v_total_revenue, 2),
    'average_sale', ROUND(v_average_sale, 2),
    'unique_sellers', v_unique_sellers
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- En caso de error, retornar valores en 0
    RETURN json_build_object(
      'total_sales', 0,
      'total_revenue', 0,
      'average_sale', 0,
      'unique_sellers', 0,
      'error', SQLERRM
    );
END;
$$;

-- Dar permisos
GRANT EXECUTE ON FUNCTION get_sales_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_sales_stats() TO anon;

-- Comentario
COMMENT ON FUNCTION get_sales_stats() IS 'Retorna estadísticas agregadas de la tabla sales con manejo de errores mejorado';

-- ====================================
-- VERIFICACIÓN
-- ====================================

-- Probar la función
SELECT '=== PRUEBA DE FUNCIÓN ACTUALIZADA ===' as test;

SELECT get_sales_stats() as resultado;

-- Extraer valores individuales
SELECT
    'Total Ventas' as metrica,
    (get_sales_stats()->>'total_sales')::INTEGER as valor
UNION ALL
SELECT
    'Ingresos Totales' as metrica,
    (get_sales_stats()->>'total_revenue')::NUMERIC as valor
UNION ALL
SELECT
    'Promedio por Venta' as metrica,
    (get_sales_stats()->>'average_sale')::NUMERIC as valor
UNION ALL
SELECT
    'Vendedores Únicos' as metrica,
    (get_sales_stats()->>'unique_sellers')::INTEGER as valor;

SELECT '✓ Función get_sales_stats() actualizada exitosamente' as status;
