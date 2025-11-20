# Nivel 3: Optimización Avanzada - Plan Detallado

## Descripción General

Este nivel implementa optimizaciones avanzadas que preparan el sistema para escalar a **millones de registros** sin degradación de rendimiento. Tiempo estimado: **1 día completo**.

---

## Optimización 1: Paginación en Exportaciones Grandes

### Problema Actual

```typescript
// export/actions.ts - Línea 32
let query = supabase.from('sales').select('*')
// Puede traer 1,000,000 de registros a memoria
```

**¿Qué pasa con 1 millón de registros?**
- Memoria consumida: ~500 MB - 1 GB
- Tiempo de query: 30-60 segundos
- Timeout del servidor: Probable
- Excel generado: 100+ MB (difícil de abrir)

---

### Solución Propuesta: Exportación por Chunks

#### Opción A: Streaming Export (Recomendada)

**Concepto:**
En lugar de traer todos los datos a memoria y luego generar el Excel, hacemos:
1. Traer 10,000 registros
2. Escribir esos 10,000 al Excel
3. Traer los siguientes 10,000
4. Escribir al mismo Excel
5. Repetir hasta terminar

**Ventajas:**
- ✅ Uso constante de memoria (~50 MB máx)
- ✅ No hay timeouts
- ✅ Puede exportar millones de registros
- ✅ El usuario ve progreso en tiempo real

**Desventajas:**
- ⚠️ Más complejo de implementar
- ⚠️ Necesita WebSockets o Server-Sent Events para progreso

#### Implementación:

```typescript
// export/actions.ts
export async function exportSalesStreaming(options: ExportOptions): Promise<ExportResult> {
  const CHUNK_SIZE = 10000
  const MAX_RECORDS = 100000 // Límite de seguridad

  let offset = 0
  let hasMore = true
  let totalExported = 0
  const workbook = XLSX.utils.book_new()

  while (hasMore && totalExported < MAX_RECORDS) {
    // Construir query con paginación
    let query = supabase
      .from('sales')
      .select('*')
      .range(offset, offset + CHUNK_SIZE - 1)

    // Aplicar filtros
    query = applyFiltersToQuery(query, options.filters)

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      hasMore = false
      break
    }

    // Procesar chunk
    const exportData = data.map(row => {
      const mappedRow: Record<string, any> = {}
      options.columns.forEach(col => {
        const label = columnLabels[col] || col
        let value = row[col as keyof typeof row]

        // Formatear valores
        if (col === 'fecha_reporte' && value) {
          const [year, month, day] = (value as string).split('-').map(Number)
          const fechaLocal = new Date(year, month - 1, day)
          mappedRow[label] = fechaLocal.toLocaleDateString('es-PE')
        } else {
          mappedRow[label] = value || ''
        }
      })
      return mappedRow
    })

    // Si es el primer chunk, crear la hoja
    if (offset === 0) {
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas')
    } else {
      // Agregar datos al worksheet existente
      const worksheet = workbook.Sheets['Ventas']
      XLSX.utils.sheet_add_json(worksheet, exportData, {
        skipHeader: true,
        origin: -1 // Append al final
      })
    }

    totalExported += data.length
    offset += CHUNK_SIZE

    // Opcional: Emitir evento de progreso
    // await emitProgress({ current: totalExported, total: estimatedTotal })

    if (data.length < CHUNK_SIZE) {
      hasMore = false
    }
  }

  // Generar buffer y retornar
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  const base64Data = excelBuffer.toString('base64')

  return {
    success: true,
    message: `Se exportaron ${totalExported} registros`,
    downloadUrl: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`,
    fileName: `ventas_${new Date().toISOString().slice(0, 10)}.xlsx`,
    totalRecords: totalExported,
  }
}
```

---

#### Opción B: Límite con Advertencia (Más Simple)

```typescript
export async function exportSales(options: ExportOptions): Promise<ExportResult> {
  const MAX_EXPORT = 50000

  // Primero, contar cuántos registros coinciden
  let countQuery = supabase
    .from('sales')
    .select('*', { count: 'exact', head: true })

  countQuery = applyFiltersToQuery(countQuery, options.filters)

  const { count } = await countQuery

  // Si excede el límite, rechazar con mensaje
  if (count && count > MAX_EXPORT) {
    return {
      success: false,
      message: `La exportación contiene ${count.toLocaleString()} registros. El límite es ${MAX_EXPORT.toLocaleString()}. Por favor, aplica más filtros para reducir el tamaño.`,
      error: 'EXPORT_TOO_LARGE',
    }
  }

  // Proceder con exportación normal pero con límite de seguridad
  let query = supabase
    .from('sales')
    .select('*')
    .limit(MAX_EXPORT)

  query = applyFiltersToQuery(query, options.filters)

  // ... resto del código actual
}
```

**Ventajas de Opción B:**
- ✅ Muy fácil de implementar (15 minutos)
- ✅ Previene crashes
- ✅ Informa al usuario del problema

**Desventajas:**
- ⚠️ Limita funcionalidad
- ⚠️ Usuario puede quedar frustrado si necesita exportar más

---

### Comparación de Opciones

| Característica | Opción A (Streaming) | Opción B (Límite) |
|----------------|---------------------|-------------------|
| Tiempo implementación | 4-6 horas | 15 minutos |
| Complejidad | Alta | Baja |
| Escalabilidad | Millones de registros | 50,000 registros |
| UX | Excelente (con progreso) | Aceptable |
| Riesgo de crash | Muy bajo | Bajo |
| Mantenimiento | Medio | Bajo |

**Mi Recomendación:** Empezar con **Opción B** (quick win), luego migrar a **Opción A** si hay demanda.

---

## Optimización 2: Cache Estratégico

### Problema Actual

Cada vez que se carga el dashboard:
1. Se hace query de stats (cuenta + suma de TODOS los montos)
2. Se hace query de ventas recientes
3. Se hace query de filtros

Si 10 usuarios cargan el dashboard al mismo tiempo = 30 queries

---

### Solución: Implementar Cache en Múltiples Niveles

#### Nivel 1: React Cache (Ya implementado parcialmente)

```typescript
// ACTUAL - Solo getUserProfile tiene cache
export const getUserProfile = cache(async () => { ... })

// NUEVO - Agregar cache a stats
export const getSalesStats = cache(async () => {
  // ... query
})
```

**Limitación:** Cache solo dura durante el render del Server Component. Se limpia en cada request.

---

#### Nivel 2: Next.js Revalidation Cache

```typescript
// ventas/actions.ts
export async function getSalesStats() {
  const supabase = await createClient()

  // Cache por 5 minutos
  const { count } = await supabase
    .from('sales')
    .select('*', { count: 'exact', head: true })

  // ... resto del código
}
```

Y en la página:

```typescript
// ventas/page.tsx
export const revalidate = 300 // 5 minutos en segundos

async function SalesContent() {
  const stats = await getSalesStats() // Se cachea por 5 minutos
  // ...
}
```

**Ventajas:**
- ✅ Muy fácil de implementar (1 línea)
- ✅ Reduce queries en 90% si hay múltiples usuarios
- ✅ Cache automático en Edge/CDN

**Desventajas:**
- ⚠️ Datos pueden estar desactualizados hasta 5 minutos
- ⚠️ No útil para datos en tiempo real

**Configuración recomendada por página:**

```typescript
// Dashboard principal - Cache agresivo
export const revalidate = 300 // 5 minutos

// Página de ventas - Cache moderado
export const revalidate = 60 // 1 minuto

// Página de exportación - Sin cache
export const revalidate = 0 // Siempre fresh

// Página de configuración - Cache largo
export const revalidate = 3600 // 1 hora
```

---

#### Nivel 3: Redis Cache (Avanzado - Opcional)

**Cuándo considerar:** Si tienes >1000 usuarios concurrentes

```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
})

export async function getCachedStats() {
  // Intentar obtener del cache
  const cached = await redis.get('sales:stats')

  if (cached) {
    return cached
  }

  // Si no existe, calcular
  const stats = await calculateStats()

  // Guardar en cache por 5 minutos
  await redis.set('sales:stats', stats, { ex: 300 })

  return stats
}
```

**Ventajas:**
- ✅ Cache compartido entre todos los usuarios
- ✅ Ultra rápido (~10ms)
- ✅ Reduce carga en Supabase en 95%+

**Desventajas:**
- ⚠️ Costo adicional (~$10/mes Upstash Redis)
- ⚠️ Complejidad de invalidación
- ⚠️ Dependencia externa

**Mi Recomendación:** No necesario ahora. Solo si tienes >10,000 usuarios activos.

---

### Estrategia de Invalidación de Cache

```typescript
// upload/actions.ts
export async function uploadSalesData(...) {
  // ... subir datos

  // Invalida cache
  revalidatePath('/dashboard')
  revalidatePath('/ventas')

  // Si usas Redis:
  await redis.del('sales:stats')

  return { success: true }
}
```

**Importante:** Invalidar cache después de:
- ✅ Subir ventas nuevas
- ✅ Editar ventas
- ✅ Eliminar ventas

---

## Optimización 3: Monitoring de Queries Lentas

### Objetivo

Detectar automáticamente queries que toman >5 segundos y recibir alertas.

---

### Implementación: Middleware de Logging

```typescript
// lib/supabase/monitored-client.ts
import { createClient } from '@/lib/supabase/server'

export async function createMonitoredClient() {
  const supabase = await createClient()

  // Proxy para interceptar queries
  return new Proxy(supabase, {
    get(target, prop) {
      if (prop === 'from') {
        return function(table: string) {
          const query = target.from(table)

          // Interceptar el método que ejecuta la query
          return new Proxy(query, {
            get(queryTarget, queryProp) {
              const original = queryTarget[queryProp as keyof typeof queryTarget]

              if (typeof original === 'function') {
                return async function(...args: any[]) {
                  const startTime = Date.now()

                  try {
                    const result = await original.apply(queryTarget, args)
                    const duration = Date.now() - startTime

                    // Log si es lenta
                    if (duration > 5000) {
                      console.error(`🐌 SLOW QUERY DETECTED: ${table}.${String(queryProp)} took ${duration}ms`)

                      // Enviar a servicio de monitoring
                      await logSlowQuery({
                        table,
                        method: String(queryProp),
                        duration,
                        timestamp: new Date(),
                      })
                    }

                    return result
                  } catch (error) {
                    console.error(`❌ QUERY ERROR: ${table}.${String(queryProp)}`, error)
                    throw error
                  }
                }
              }

              return original
            }
          })
        }
      }

      return target[prop as keyof typeof target]
    }
  })
}

// Función para log (puede enviar a Sentry, Datadog, etc.)
async function logSlowQuery(data: {
  table: string
  method: string
  duration: number
  timestamp: Date
}) {
  // Opción 1: Solo console (desarrollo)
  console.warn('Slow query:', data)

  // Opción 2: Guardar en base de datos
  const supabase = await createClient()
  await supabase.from('query_logs').insert({
    table_name: data.table,
    method: data.method,
    duration_ms: data.duration,
    created_at: data.timestamp,
  })

  // Opción 3: Enviar a Sentry
  // Sentry.captureMessage('Slow query detected', { extra: data })

  // Opción 4: Enviar email/Slack si es crítica (>10s)
  if (data.duration > 10000) {
    // await sendSlackAlert(`Query crítica: ${data.table} tardó ${data.duration}ms`)
  }
}
```

**Uso:**

```typescript
// En lugar de:
const supabase = await createClient()

// Usar:
const supabase = await createMonitoredClient()
```

---

### Dashboard de Performance

Crear una página admin para ver queries lentas:

```typescript
// app/(dashboard)/admin/performance/page.tsx
export default async function PerformancePage() {
  const supabase = await createClient()

  const { data: slowQueries } = await supabase
    .from('query_logs')
    .select('*')
    .gte('duration_ms', 1000)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <h1>Queries Lentas (últimas 24 horas)</h1>
      <table>
        <thead>
          <tr>
            <th>Tabla</th>
            <th>Método</th>
            <th>Duración</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {slowQueries?.map(query => (
            <tr key={query.id}>
              <td>{query.table_name}</td>
              <td>{query.method}</td>
              <td className={query.duration_ms > 5000 ? 'text-red-600' : ''}>
                {query.duration_ms}ms
              </td>
              <td>{new Date(query.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

### Tabla de Supabase para Logs

```sql
-- Crear tabla de logs en Supabase
CREATE TABLE query_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  method TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_query_logs_created_at ON query_logs(created_at DESC);
CREATE INDEX idx_query_logs_duration ON query_logs(duration_ms DESC);

-- Auto-limpieza: eliminar logs >30 días
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'cleanup-query-logs',
  '0 2 * * *', -- 2 AM diario
  $$DELETE FROM query_logs WHERE created_at < NOW() - INTERVAL '30 days'$$
);
```

---

## Optimización 4: Índices de Base de Datos

### Problema Actual

Supabase/PostgreSQL puede estar haciendo **full table scans** en queries con filtros.

```sql
-- Query lenta sin índice
SELECT * FROM sales
WHERE cel_vendedor = 'P1'
  AND fecha_reporte >= '2025-01-01';

-- Con 1M de registros, puede tardar 10+ segundos
```

---

### Solución: Crear Índices Estratégicos

```sql
-- Índice para filtro por vendedor
CREATE INDEX idx_sales_cel_vendedor ON sales(cel_vendedor);

-- Índice para filtro por fecha
CREATE INDEX idx_sales_fecha_reporte ON sales(fecha_reporte DESC);

-- Índice compuesto para filtros combinados (más eficiente)
CREATE INDEX idx_sales_vendedor_fecha ON sales(cel_vendedor, fecha_reporte DESC);

-- Índice para método de pago 1 (teléfonos)
CREATE INDEX idx_sales_metodo_pago_1 ON sales(metodo_pago_1);

-- Índice para región
CREATE INDEX idx_sales_region ON sales(region);

-- Índice para búsqueda de texto (si usas full-text search)
CREATE INDEX idx_sales_nombre_cliente_gin ON sales USING GIN (to_tsvector('spanish', nombre_cliente));
```

**Impacto esperado:**
- Query que tardaba 10s → 100ms (100x más rápida)
- Uso de disco: +50-100 MB por índice
- Inserts/Updates: ~5% más lentos (aceptable)

---

### Cómo Decidir Qué Índices Crear

**Criterio 1: Columnas en WHERE frecuentes**
```typescript
// Estos filtros se usan mucho:
.eq('cel_vendedor', ...)     // ✅ Índice
.gte('fecha_reporte', ...)   // ✅ Índice
.ilike('nombre_cliente', ...) // ⚠️ No funciona con índice B-tree normal
```

**Criterio 2: Columnas en ORDER BY**
```typescript
.order('fecha_reporte', { ascending: false }) // ✅ Índice
```

**Criterio 3: Combinaciones frecuentes**
```typescript
// Filtro común: vendedor + fecha
WHERE cel_vendedor = 'P1' AND fecha_reporte >= '2025-01-01'
// ✅ Índice compuesto (cel_vendedor, fecha_reporte)
```

---

### Verificar Efectividad de Índices

```sql
-- Ver plan de ejecución
EXPLAIN ANALYZE
SELECT * FROM sales
WHERE cel_vendedor = 'P1'
  AND fecha_reporte >= '2025-01-01'
ORDER BY fecha_reporte DESC
LIMIT 100;

-- Buscar "Index Scan" vs "Seq Scan"
-- Index Scan = Usando índice ✅
-- Seq Scan = Full table scan ❌
```

**En Supabase Dashboard:**
1. SQL Editor
2. Pegar query con `EXPLAIN ANALYZE`
3. Ejecutar
4. Ver si usa índices

---

## Optimización 5: Lazy Loading de Componentes

### Problema Actual

Todos los componentes se cargan al mismo tiempo, incluso los que el usuario no ve inmediatamente.

```typescript
// dashboard/page.tsx
export default function DashboardPage() {
  return (
    <>
      <StatsCards />      {/* Se carga inmediatamente */}
      <Charts />          {/* Se carga inmediatamente */}
      <RecentSales />     {/* Se carga inmediatamente */}
      <TopVendors />      {/* Se carga inmediatamente */}
    </>
  )
}
```

Si cada componente hace una query → 4 queries en paralelo → mayor carga en DB

---

### Solución: Lazy Loading con Suspense

```typescript
// dashboard/page.tsx
import { Suspense, lazy } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load componentes pesados
const Charts = lazy(() => import('@/components/dashboard/charts'))
const TopVendors = lazy(() => import('@/components/dashboard/top-vendors'))

export default function DashboardPage() {
  return (
    <>
      {/* Cargar inmediatamente */}
      <StatsCards />

      {/* Lazy load con skeleton */}
      <Suspense fallback={<ChartsSkeleton />}>
        <Charts />
      </Suspense>

      <RecentSales />

      {/* Lazy load */}
      <Suspense fallback={<VendorsSkeleton />}>
        <TopVendors />
      </Suspense>
    </>
  )
}
```

**Ventajas:**
- ✅ Tiempo de carga inicial más rápido
- ✅ Queries se ejecutan solo cuando el componente se renderiza
- ✅ Mejor UX con skeletons

---

## Optimización 6: Compresión de Respuestas

### Configuración en next.config.js

```javascript
// next.config.js
module.exports = {
  compress: true, // Habilitar compresión gzip

  // Headers personalizados
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=60',
          },
        ],
      },
    ]
  },
}
```

**Impacto:**
- Respuestas JSON grandes (1 MB) → 100 KB (90% reducción)
- Tiempo de carga en red lenta: 10s → 1s

---

## Optimización 7: Database Connection Pooling

### Problema

Cada request crea una nueva conexión a Supabase → límite de conexiones puede agotarse.

### Solución (Ya implementado en Supabase)

Supabase usa **PgBouncer** automáticamente, pero puedes optimizar:

```typescript
// .env.local
# Usar connection pooling de Supabase (puerto 6543)
SUPABASE_URL=https://xxx.supabase.co
# En producción con muchos requests:
SUPABASE_CONNECTION_MODE=transaction # vs session
```

**Configuración:**
- Session mode (default): 1 conexión por sesión
- Transaction mode: Reutiliza conexiones entre transactions

---

## Implementación Paso a Paso

### Semana 1: Fundamentos
- Día 1: Implementar límite en exports (Opción B)
- Día 2: Agregar cache con revalidate
- Día 3: Crear índices en Supabase

### Semana 2: Monitoring
- Día 4: Implementar logging de queries lentas
- Día 5: Crear dashboard de performance

### Semana 3: Optimizaciones Avanzadas
- Día 6: Implementar streaming exports (Opción A)
- Día 7: Lazy loading + compresión

---

## Métricas de Éxito

| Métrica | Antes | Después | Objetivo |
|---------|-------|---------|----------|
| Tiempo carga dashboard | 3-5s | <1s | -80% |
| Query tiempo promedio | 2s | <200ms | -90% |
| Exportación 100k records | Timeout | 30s | ✅ |
| Memoria pico servidor | 2 GB | 500 MB | -75% |
| Queries por minuto | 1000 | 200 | -80% |

---

## Costos Estimados

| Recurso | Costo Mensual | ¿Necesario? |
|---------|---------------|-------------|
| Supabase Pro (mejor performance) | $25 | Recomendado |
| Redis (Upstash) | $10 | Opcional |
| Sentry (monitoring) | $26 | Opcional |
| **Total** | **$25-61** | Depende |

---

## Riesgos y Mitigaciones

### Riesgo 1: Cache desactualizado
**Mitigación:**
- Invalidar cache en todas las mutaciones
- Usar tiempos de revalidación cortos (1-5 min)
- Mostrar timestamp de última actualización al usuario

### Riesgo 2: Complejidad aumentada
**Mitigación:**
- Documentar bien cada optimización
- Tests unitarios para componentes críticos
- Rollback plan si algo falla

### Riesgo 3: Bugs en streaming export
**Mitigación:**
- Mantener export simple como fallback
- Feature flag para habilitar/deshabilitar streaming
- Testing extensivo con diferentes tamaños

---

## Conclusión

El Nivel 3 transforma el sistema de un prototipo a una **aplicación enterprise-ready** que puede:

- ✅ Manejar millones de registros
- ✅ Soportar cientos de usuarios simultáneos
- ✅ Detectar y resolver problemas proactivamente
- ✅ Escalar sin re-arquitectura mayor

**¿Vale la pena?**
- Si tienes <10,000 registros y <50 usuarios: **Probablemente no**
- Si tienes >100,000 registros o >100 usuarios: **Definitivamente sí**
- Si planeas crecer significativamente: **Invertir ahora ahorra dolores futuros**

---

**Última actualización:** 18 de noviembre de 2025
