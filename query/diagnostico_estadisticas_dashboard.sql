-- ====================================
-- DIAGNÓSTICO DE ESTADÍSTICAS DEL DASHBOARD
-- ====================================
-- Este script verifica los datos y cálculos de las estadísticas
-- ====================================

-- 1. VERIFICAR DATOS BÁSICOS
SELECT '=== VERIFICACIÓN DE DATOS BÁSICOS ===' as seccion;

-- Total de registros
SELECT
    'Total de ventas' as metrica,
    COUNT(*) as valor,
    'Debe mostrar este número en el dashboard' as nota
FROM sales;

-- 2. VERIFICAR MONTOS
SELECT '=== VERIFICACIÓN DE MONTOS ===' as seccion;

-- Ingresos totales
SELECT
    'Ingresos totales' as metrica,
    COALESCE(SUM(monto), 0) as valor,
    'Suma de todos los montos' as nota
FROM sales;

-- Promedio por venta
SELECT
    'Promedio por venta' as metrica,
    COALESCE(AVG(monto), 0) as valor,
    'Promedio de todos los montos' as nota
FROM sales;

-- 3. VERIFICAR VENDEDORES ÚNICOS
SELECT '=== VERIFICACIÓN DE VENDEDORES ===' as seccion;

SELECT
    'Vendedores únicos' as metrica,
    COUNT(DISTINCT cel_vendedor) as valor,
    'Total de vendedores diferentes' as nota
FROM sales;

-- Listar vendedores únicos
SELECT
    'Lista de vendedores' as info,
    cel_vendedor,
    COUNT(*) as ventas_por_vendedor
FROM sales
WHERE cel_vendedor IS NOT NULL
GROUP BY cel_vendedor
ORDER BY ventas_por_vendedor DESC;

-- 4. VERIFICAR PROBLEMAS EN LOS DATOS
SELECT '=== VERIFICACIÓN DE DATOS PROBLEMÁTICOS ===' as seccion;

-- Ventas con monto NULL o 0
SELECT
    'Ventas con monto NULL' as problema,
    COUNT(*) as cantidad
FROM sales
WHERE monto IS NULL;

SELECT
    'Ventas con monto = 0' as problema,
    COUNT(*) as cantidad
FROM sales
WHERE monto = 0;

-- Ventas con cel_vendedor NULL
SELECT
    'Ventas sin vendedor (NULL)' as problema,
    COUNT(*) as cantidad
FROM sales
WHERE cel_vendedor IS NULL;

-- Distribución de montos (para detectar valores atípicos)
SELECT
    'Distribución de montos' as info,
    MIN(monto) as monto_minimo,
    MAX(monto) as monto_maximo,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY monto) as mediana
FROM sales
WHERE monto IS NOT NULL;

-- 5. PROBAR LA FUNCIÓN RPC
SELECT '=== PRUEBA DE FUNCIÓN get_sales_stats() ===' as seccion;

-- Ejecutar la función directamente
SELECT get_sales_stats() as resultado_funcion;

-- 6. COMPARAR RESULTADOS
SELECT '=== COMPARACIÓN: MANUAL vs FUNCIÓN ===' as seccion;

-- Cálculo manual
WITH manual AS (
    SELECT
        COUNT(*)::INTEGER as total_sales,
        COALESCE(SUM(monto), 0)::NUMERIC as total_revenue,
        COALESCE(AVG(monto), 0)::NUMERIC as average_sale,
        COUNT(DISTINCT cel_vendedor)::INTEGER as unique_sellers
    FROM sales
),
funcion AS (
    SELECT
        (get_sales_stats()->>'total_sales')::INTEGER as total_sales,
        (get_sales_stats()->>'total_revenue')::NUMERIC as total_revenue,
        (get_sales_stats()->>'average_sale')::NUMERIC as average_sale,
        (get_sales_stats()->>'unique_sellers')::INTEGER as unique_sellers
)
SELECT
    'Total Ventas' as metrica,
    m.total_sales as calculo_manual,
    f.total_sales as funcion_rpc,
    CASE WHEN m.total_sales = f.total_sales THEN '✓ OK' ELSE '✗ DIFERENTE' END as estado
FROM manual m, funcion f

UNION ALL

SELECT
    'Ingresos Totales' as metrica,
    m.total_revenue as calculo_manual,
    f.total_revenue as funcion_rpc,
    CASE WHEN m.total_revenue = f.total_revenue THEN '✓ OK' ELSE '✗ DIFERENTE' END as estado
FROM manual m, funcion f

UNION ALL

SELECT
    'Promedio por Venta' as metrica,
    m.average_sale as calculo_manual,
    f.average_sale as funcion_rpc,
    CASE WHEN m.average_sale = f.average_sale THEN '✓ OK' ELSE '✗ DIFERENTE' END as estado
FROM manual m, funcion f

UNION ALL

SELECT
    'Vendedores Únicos' as metrica,
    m.unique_sellers as calculo_manual,
    f.unique_sellers as funcion_rpc,
    CASE WHEN m.unique_sellers = f.unique_sellers THEN '✓ OK' ELSE '✗ DIFERENTE' END as estado
FROM manual m, funcion f;

-- 7. VERIFICAR PERMISOS Y POLÍTICAS RLS
SELECT '=== VERIFICACIÓN DE PERMISOS Y RLS ===' as seccion;

-- Ver si RLS está habilitado
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'sales';

-- Ver políticas RLS activas
SELECT
    schemaname,
    tablename,
    policyname,
    cmd as operacion,
    qual as condicion
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'sales';

-- 8. MUESTRA DE DATOS
SELECT '=== MUESTRA DE 10 VENTAS ===' as seccion;

SELECT
    id,
    cel_vendedor,
    monto,
    fecha_reporte,
    created_at
FROM sales
ORDER BY created_at DESC
LIMIT 10;

-- ====================================
-- RESUMEN Y RECOMENDACIONES
-- ====================================
SELECT '=== RESUMEN ===' as seccion;

SELECT
    '✓ Script de diagnóstico completado' as mensaje,
    'Revisa los resultados arriba para identificar el problema' as accion;
