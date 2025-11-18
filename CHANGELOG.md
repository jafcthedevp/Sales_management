# Changelog - Sales Management System

## Cambios Recientes (2025-11-17)

### ✅ Funcionalidades Implementadas

#### 1. Sistema de Fecha de Reporte
- **Problema**: Si olvidas subir datos el día 15 y los subes el 16, tendrían fecha incorrecta
- **Solución**:
  - Agregada columna `fecha_reporte` a la tabla `sales`
  - Date picker en el formulario de carga para asignar la fecha correcta
  - Fecha por defecto: hoy
  - Se diferencia de `created_at` (timestamp de cuando se subió)

**Archivos modificados**:
- `src/app/(dashboard)/upload/actions.ts` - Acepta parámetro `fechaReporte`
- `src/components/upload/preview-table.tsx` - Date picker agregado
- `src/components/dashboard/sales-table.tsx` - Muestra columna "Fecha Reporte"
- `src/components/export/export-form.tsx` - Incluida en columnas exportables

#### 2. Validación "Todo o Nada"
- **Problema**: Antes subía filas válidas aunque hubiera errores
- **Solución**:
  - Si hay aunque sea 1 error de validación → NO se sube NADA
  - Valida todas las filas primero
  - Muestra todos los errores para que el usuario los corrija

**Archivo modificado**:
- `src/app/(dashboard)/upload/actions.ts:105-115` - Nueva lógica de validación

#### 3. Mejoras de UX (Alerts y Cards)
- **Alerts visuales** en lugar de `alert()` nativo del navegador
- **Cards más grandes** con mejor espaciado (shadow-lg, text-2xl)
- **Botones más grandes** (size="lg")
- **Stats cards mejorados** (p-6, text-3xl)
- **Alert cuando no hay columnas seleccionadas** en export

**Archivos modificados**:
- `src/components/upload/preview-table.tsx`
- `src/components/export/export-form.tsx`
- `src/components/upload/upload-results.tsx`
- `src/components/upload/upload-content.tsx`

#### 4. Eliminación de columna `fecha_venta`
- **Razón**: No existe en el Excel de origen
- **Acción**: Eliminada de base de datos y código

**Archivos modificados**:
- Base de datos: `ALTER TABLE sales DROP COLUMN fecha_venta`
- `src/app/(dashboard)/upload/actions.ts` - Schema de validación
- `src/components/dashboard/sales-table.tsx` - Columna removida
- `src/components/export/export-form.tsx` - Removida de lista
- `src/app/(dashboard)/export/actions.ts` - Removida de mapeo
- `src/components/upload/upload-content.tsx` - Tipo ParsedSale
- `src/types/database.types.ts` - Regenerado

#### 5. Fix: Bug de Zona Horaria en Fechas
- **Problema**: Fechas se mostraban con un día de diferencia (ej: 31/10 en vez de 01/11)
- **Causa**: `new Date("2025-11-15")` interpreta como UTC, causando offset en Perú (UTC-5)
- **Solución**: Parseo como fecha local sin conversión de zona horaria

**Archivos modificados**:
- `src/components/dashboard/sales-table.tsx:180-193`
- `src/app/(dashboard)/export/actions.ts:127-130`

```javascript
// Antes (incorrecto):
new Date(fecha).toLocaleDateString()

// Ahora (correcto):
const [year, month, day] = fecha.split('-').map(Number)
const fechaLocal = new Date(year, month - 1, day)
fechaLocal.toLocaleDateString()
```

### 🗄️ Estructura de Base de Datos

#### Tabla `sales`
```sql
- id (uuid, PK)
- cel_vendedor (text, NOT NULL)
- numero_cliente (text, NOT NULL)
- nombre_cliente (text, nullable)
- metodo_pago (text, NOT NULL)
- metodo_pago_1 (text, nullable)
- monto (numeric, NOT NULL)
- region (text, nullable) -- 'LIMA' | 'PROVINCIA'
- fecha_reporte (date, nullable) -- ✨ NUEVO
- created_at (timestamp)
- updated_at (timestamp)
- created_by (uuid, FK -> profiles)
```

### 📋 Campos Requeridos en Excel

**Obligatorios:**
- CEL VENDEDOR
- NÚMERO CLIENTE
- MÉTODO PAGO
- MONTO

**Opcionales:**
- NOMBRE CLIENTE
- MÉTODO PAGO 1
- REGIÓN

### 🔧 Configuración Necesaria

#### Variables de Entorno (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://gqrmlzryozcysvwxtlbm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu_key>
```

#### Supabase Setup
```sql
-- Ya ejecutado:
ALTER TABLE sales DROP COLUMN fecha_venta;
DELETE FROM sales; -- Limpieza para empezar de cero
```

### 🚀 Para Continuar en Otro Ordenador

1. **Clonar repositorio**:
```bash
git clone <url-del-repo>
cd Sales_management
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
```bash
cp .env.local.example .env.local
# Editar .env.local con tus credenciales de Supabase
```

4. **Ejecutar en desarrollo**:
```bash
npm run dev
```

### 📦 Dependencias Principales

- Next.js 15
- React 19
- Supabase (PostgreSQL + Auth)
- shadcn/ui (componentes)
- TanStack Table
- Zod (validación)
- date-fns (fechas)
- xlsx (SheetJS para Excel)

### 🎨 Tema

- Colores neutrales (bg-muted, text-foreground)
- Sin colores hardcodeados
- Dark mode compatible

### ✅ Tests Completados

- Compilación TypeScript: ✅ Sin errores
- Validación "todo o nada": ✅ Funcional
- Fecha de reporte: ✅ Se guarda correctamente
- Fix zona horaria: ✅ Fechas se muestran correctas

### 📝 Notas

- Los usuarios con rol "admin" pueden subir archivos
- Los usuarios con rol "contador" solo pueden ver y exportar
- Sistema de logs para uploads y exports
- Filtros avanzados en exportación
- Resumen de totales antes de exportar
