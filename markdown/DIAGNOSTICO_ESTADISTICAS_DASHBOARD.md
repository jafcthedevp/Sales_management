# 🔍 Diagnóstico de Estadísticas del Dashboard

**Fecha:** 20 de Noviembre 2024
**Problema Reportado:** Las estadísticas del dashboard no muestran datos correctos
- Total ventas: 4,481 ✅ (parece correcto)
- Ingresos totales: ❌ (incorrecto)
- Promedio por venta: ❌ (incorrecto)
- Vendedores: ❌ (incorrecto)

---

## 🎯 OBJETIVO

Identificar por qué las estadísticas del dashboard no son correctas y corregirlas.

---

## 📋 POSIBLES CAUSAS

### 1. **Función RPC devuelve datos incorrectos**
- La función `get_sales_stats()` calcula mal
- Problemas con NULL values en la tabla
- Tipo de datos incorrecto

### 2. **Función RPC no existe o da error**
- El componente usa fallback incorrecto
- El fallback tenía límite de 100,000 registros (ahora corregido)

### 3. **Políticas RLS filtran datos**
- El usuario no ve todas las ventas por RLS
- La función no usa `SECURITY DEFINER` correctamente

### 4. **Datos problemáticos en la tabla**
- Montos NULL o 0
- cel_vendedor NULL
- Duplicados

---

## 🔧 PASOS DE DIAGNÓSTICO

### Paso 1: Ejecutar Script de Diagnóstico SQL

**Archivo:** `query/diagnostico_estadisticas_dashboard.sql`

1. Abrir Supabase Dashboard → SQL Editor
2. Copiar y pegar el contenido del archivo
3. Ejecutar script completo
4. Revisar los resultados:

#### Qué buscar en los resultados:

**Sección 1: Datos Básicos**
```sql
-- ¿Coincide el total de ventas con lo que muestra el dashboard?
Total de ventas: 4,481 (debe coincidir)
```

**Sección 2: Montos**
```sql
-- ¿Los ingresos totales y promedio son razonables?
Ingresos totales: S/ XXXXX.XX
Promedio por venta: S/ XXX.XX
```

**Sección 3: Vendedores**
```sql
-- ¿Cuántos vendedores únicos hay?
Vendedores únicos: XX
-- ¿La lista de vendedores tiene sentido?
```

**Sección 4: Datos Problemáticos**
```sql
-- ¿Hay ventas con monto NULL o 0?
Ventas con monto NULL: X
Ventas con monto = 0: X
-- ¿Hay ventas sin vendedor?
Ventas sin vendedor: X
```

**Sección 6: Comparación**
```sql
-- ¿Los cálculos manuales coinciden con la función RPC?
Total Ventas: manual vs función → ✓ OK o ✗ DIFERENTE
Ingresos Totales: manual vs función → ✓ OK o ✗ DIFERENTE
```

---

### Paso 2: Actualizar Función SQL (Si es necesario)

**Archivo:** `query/fix_get_sales_stats_function.sql`

Si el diagnóstico muestra que la función RPC tiene problemas:

1. Ejecutar el script `fix_get_sales_stats_function.sql` en Supabase
2. Este script:
   - Agrega `SET search_path = public` para seguridad
   - Mejora el manejo de errores
   - Redondea los valores a 2 decimales
   - Incluye pruebas de verificación

**Verificación después de ejecutar:**
```sql
SELECT get_sales_stats();
```

Deberías ver algo como:
```json
{
  "total_sales": 4481,
  "total_revenue": 123456.78,
  "average_sale": 27.54,
  "unique_sellers": 15
}
```

---

### Paso 3: Verificar Logging en el Componente

El componente `src/components/dashboard/stats-cards.tsx` ahora incluye logging.

1. Ejecutar el proyecto en modo desarrollo:
   ```bash
   npm run dev
   ```

2. Abrir el dashboard en el navegador: `http://localhost:3000/dashboard`

3. Abrir la consola del servidor (terminal donde corre `npm run dev`)

4. Buscar los logs:
   ```
   📊 Stats Debug: { hasError: false, hasData: true, statsData: {...} }
   ✅ Usando RPC get_sales_stats(): { totalSales: 4481, ... }
   ```

**O si está usando fallback:**
   ```
   ⚠️ RPC falló, usando fallback
   ✅ Fallback completado: { totalSales: 4481, ... }
   ```

---

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: Total de ventas correcto pero otros datos incorrectos

**Causa probable:** La función RPC funciona para COUNT pero falla en SUM/AVG

**Solución:**
1. Verificar si hay montos NULL: `SELECT COUNT(*) FROM sales WHERE monto IS NULL;`
2. Si hay NULLs, la función usa `COALESCE` que debería manejarlos
3. Ejecutar `fix_get_sales_stats_function.sql`

---

### Problema 2: Fallback se ejecuta en lugar de RPC

**Causa probable:** La función RPC no existe o da error

**Verificar:**
```sql
-- Ver si la función existe
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'get_sales_stats';
```

**Solución:**
1. Si no existe, ejecutar `fix_get_sales_stats_function.sql`
2. Si existe pero da error, revisar permisos:
   ```sql
   GRANT EXECUTE ON FUNCTION get_sales_stats() TO authenticated;
   ```

---

### Problema 3: RLS está filtrando ventas

**Causa probable:** El usuario no tiene permiso para ver todas las ventas

**Verificar:**
```sql
-- Como usuario admin, verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'sales';
```

**Solución:**
La función debe usar `SECURITY DEFINER` (ya incluido en el fix) para bypassear RLS.

---

### Problema 4: Datos con valores NULL o extraños

**Identificar:**
```sql
-- Ventas con problemas
SELECT COUNT(*) FROM sales WHERE monto IS NULL OR monto <= 0;
SELECT COUNT(*) FROM sales WHERE cel_vendedor IS NULL OR cel_vendedor = '';
```

**Solución (opcional - solo si hay muchos registros problemáticos):**
```sql
-- Limpiar datos (CUIDADO: revisar antes de ejecutar)
-- UPDATE sales SET monto = 0 WHERE monto IS NULL;
-- UPDATE sales SET cel_vendedor = 'DESCONOCIDO' WHERE cel_vendedor IS NULL;
```

---

## 📊 CAMBIOS REALIZADOS

### 1. ✅ Componente stats-cards.tsx
**Archivo:** `src/components/dashboard/stats-cards.tsx`

**Cambios:**
- ✅ Agregado logging para debugging
- ✅ Removido límite de 100,000 en fallback (ahora trae todos los registros)
- ✅ Mejor manejo de errores

**Impacto:**
- Ahora puedes ver exactamente qué datos recibe el componente
- El fallback funciona correctamente para cualquier número de registros

---

### 2. ✅ Función SQL mejorada
**Archivo:** `query/fix_get_sales_stats_function.sql`

**Mejoras:**
- ✅ `SET search_path = public` para seguridad
- ✅ Manejo de excepciones con `EXCEPTION WHEN OTHERS`
- ✅ Redondeo a 2 decimales para montos
- ✅ Retorna error en JSON si falla
- ✅ Permisos para `authenticated` y `anon`

---

### 3. ✅ Script de diagnóstico completo
**Archivo:** `query/diagnostico_estadisticas_dashboard.sql`

**Incluye:**
- ✅ Verificación de datos básicos
- ✅ Verificación de montos y promedios
- ✅ Listado de vendedores únicos
- ✅ Detección de datos problemáticos
- ✅ Prueba directa de la función RPC
- ✅ Comparación manual vs función
- ✅ Verificación de RLS y permisos
- ✅ Muestra de 10 ventas recientes

---

## 🚀 PROCEDIMIENTO RECOMENDADO

### Paso a Paso:

1. **Ejecutar diagnóstico SQL** ⭐ HACER PRIMERO
   ```
   query/diagnostico_estadisticas_dashboard.sql
   ```
   - Identifica exactamente cuál es el problema
   - Compara cálculos manuales vs función RPC

2. **Ejecutar fix de función SQL** (si el diagnóstico lo indica)
   ```
   query/fix_get_sales_stats_function.sql
   ```
   - Actualiza la función con mejoras
   - Verifica que funcione correctamente

3. **Verificar en el dashboard**
   ```bash
   npm run dev
   ```
   - Ir a http://localhost:3000/dashboard
   - Revisar consola del servidor para ver logs
   - Verificar que las estadísticas sean correctas

4. **Si aún no funciona, revisar logs**
   - Ver qué dice el logging del componente
   - Verificar si usa RPC o fallback
   - Comparar valores con el diagnóstico SQL

---

## 📞 INFORMACIÓN ADICIONAL

### Archivos Relacionados:
- `src/components/dashboard/stats-cards.tsx` - Componente visual
- `query/supabase_stats_function.sql` - Versión original (posiblemente obsoleta)
- `query/fix_get_sales_stats_function.sql` - Versión mejorada
- `query/diagnostico_estadisticas_dashboard.sql` - Script de diagnóstico

### Referencias:
- Documentación de RPC en Supabase: https://supabase.com/docs/guides/database/functions
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security

---

## 🎯 RESULTADO ESPERADO

Después de seguir estos pasos, el dashboard debería mostrar:

- ✅ **Total Ventas:** 4,481 (o el número correcto de registros)
- ✅ **Ingresos Totales:** S/ XXX,XXX.XX (suma de todos los montos)
- ✅ **Promedio por Venta:** S/ XXX.XX (ingresos / total ventas)
- ✅ **Vendedores:** XX (número de cel_vendedor únicos)

---

**Última actualización:** 20 de Noviembre 2024
**Estado:** ⚠️ Pendiente de ejecutar diagnóstico y verificar
