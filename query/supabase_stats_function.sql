-- Función para obtener estadísticas de ventas de manera eficiente
-- Esta función calcula todas las estadísticas en el servidor de base de datos
-- en lugar de traer todos los datos al cliente

CREATE OR REPLACE FUNCTION get_sales_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Comentario para documentación
COMMENT ON FUNCTION get_sales_stats() IS 'Retorna estadísticas agregadas de la tabla sales: total de ventas, ingresos totales, promedio por venta y vendedores únicos';
