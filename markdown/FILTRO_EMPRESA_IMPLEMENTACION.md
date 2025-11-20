# 🏢 Implementación de Filtro por Empresa

**Fecha:** 20 de Noviembre 2024
**Funcionalidad:** Filtro para separar ventas por empresa (OVERSHARK vs BRAVO'S)

---

## 🎯 OBJETIVO

Permitir filtrar las ventas según la empresa a la que pertenecen basándose en el campo `metodo_pago_1` (teléfono/cuenta que recibe el dinero).

---

## 🏢 EMPRESAS CONFIGURADAS

### OVERSHARK (17 teléfonos/cuentas)
```
LIVE OVERSHARK:
- L1-000, L2-378, L3-711, L4-138

PUBLICIDAD OVERSHARK:
- P1/556, P1-A/375, P2/576, P3/825
- P4/101, P4-A/262, P5/795

TIKTOK OVERSHARK:
- TK1/320, TK2/505, TK3/016, TK6/600

TRANSFERENCIAS OVERSHARK:
- TRANSF. 0102 Cuenta bancaria (Interbank)
- TRANSF. 5094 Cuenta bancaria (BCP)
```

### BRAVO'S (4 teléfonos/cuentas)
```
PUBLICIDAD/LIVE BRAVO'S:
- LIVE BRAV/402
- PUB BRAV/829

TRANSFERENCIAS BRAVO'S:
- TRANSF. 4006 Cuenta bancaria (Interbank)
- TRANSF. 0040 Cuenta bancaria (BCP)
```

### OTROS
Cualquier `metodo_pago_1` que no esté en las listas anteriores.

---

## 📁 ARCHIVOS CREADOS/MODIFICADOS

### 1. ✨ NUEVO: `src/lib/companies.ts`

**Librería central con toda la lógica de empresas**

```typescript
export type Company = 'OVERSHARK' | 'BRAVOS' | 'OTROS'

// Configuración de empresas
export const OVERSHARK_CONFIG: CompanyConfig = {
  name: 'OVERSHARK',
  displayName: 'OVERSHARK',
  color: '#0ea5e9', // Cyan
  paymentMethods: [...]
}

export const BRAVOS_CONFIG: CompanyConfig = {
  name: 'BRAVOS',
  displayName: "BRAVO'S",
  color: '#f59e0b', // Amber
  paymentMethods: [...]
}

// Opciones para filtros
export const COMPANY_OPTIONS = [
  { value: '', label: 'Todas las empresas' },
  { value: 'OVERSHARK', label: 'OVERSHARK' },
  { value: 'BRAVOS', label: "BRAVO'S" },
  { value: 'OTROS', label: 'Otros' },
]
```

**Funciones principales:**
- `getCompanyFromPaymentMethod(metodoPago1)` - Determina la empresa según el teléfono
- `getPaymentMethodsByCompany(company)` - Obtiene todos los teléfonos de una empresa
- `getCompanyConfig(company)` - Obtiene configuración completa de empresa

---

### 2. ✅ ACTUALIZADO: `src/app/(dashboard)/ventas/actions.ts`

**Cambios:**

#### a) Interfaz SalesFilters ampliada:
```typescript
export interface SalesFilters {
  search?: string
  cel_vendedor?: string
  numero_cliente?: string
  metodo_pago?: string
  metodo_pago_1?: string
  empresa?: Company | '' | null // ⭐ NUEVO
  region?: 'LIMA' | 'PROVINCIA' | null
  fecha_desde?: string
  fecha_hasta?: string
  monto_min?: number
  monto_max?: number
}
```

#### b) Lógica de filtrado implementada:
```typescript
// En getSales()
if (filters.empresa && filters.empresa !== '') {
  const paymentMethods = getPaymentMethodsByCompany(filters.empresa)

  if (paymentMethods.length > 0) {
    // Filtrar por los métodos de pago de la empresa
    query = query.in('metodo_pago_1', paymentMethods)
  } else if (filters.empresa === 'OTROS') {
    // Excluir todos los métodos conocidos
    query = query.not('metodo_pago_1', 'in', '(...)')
  }
}
```

#### c) Lista de teléfonos actualizada:
- ✅ Agregado `PUB BRAV/829` que faltaba
- ✅ Ordenado por empresa (OVERSHARK primero, luego BRAVO'S)
- ✅ Actualizado a 21 teléfonos total

#### d) getFilterOptions() actualizado:
```typescript
return {
  vendedores,
  metodosPago: metodosPagoUnicos,
  metodosPago1,
  regiones: ['LIMA', 'PROVINCIA'] as const,
  empresas: COMPANY_OPTIONS, // ⭐ NUEVO
}
```

---

### 3. ✅ ACTUALIZADO: `src/app/(dashboard)/export/actions.ts`

**Cambios:**

- ✅ Importado `getPaymentMethodsByCompany` de `@/lib/companies`
- ✅ Agregada lógica de filtrado por empresa en `exportSales()`
- ✅ Agregada lógica de filtrado por empresa en `getSalesSummary()`

**Ambas funciones respetan el filtro de empresa** para que la exportación y el resumen coincidan con la vista de ventas filtrada.

---

## 🔍 CÓMO FUNCIONA

### 1. Filtro en Ventas

Cuando el usuario selecciona una empresa en el filtro:

**Opción: "OVERSHARK"**
```sql
WHERE metodo_pago_1 IN (
  'L1-000', 'L2-378', ..., 'TRANSF. 0102 Cuenta bancaria', ...
)
```

**Opción: "BRAVO'S"**
```sql
WHERE metodo_pago_1 IN (
  'LIVE BRAV/402', 'PUB BRAV/829', 'TRANSF. 4006 Cuenta bancaria', ...
)
```

**Opción: "OTROS"**
```sql
WHERE metodo_pago_1 NOT IN (
  -- Todos los teléfonos de OVERSHARK y BRAVO'S
)
```

---

### 2. Determinación Automática de Empresa

La función `getCompanyFromPaymentMethod()` usa múltiples estrategias:

1. **Coincidencia exacta** en el mapa de teléfonos
2. **Normalización** (quitar espacios, mayúsculas)
3. **Patrones regex** para detectar:
   - OVERSHARK: `L\d+-\d{3}`, `P\d+/\d{3}`, `TK\d+/\d{3}`, números 0102, 5094
   - BRAVO'S: contiene "BRAV", números 4006, 0040

Esto hace que el sistema sea **robusto** ante variaciones menores en el formato.

---

## 📊 CASOS DE USO

### Caso 1: Ver solo ventas de OVERSHARK
```typescript
getSales({ empresa: 'OVERSHARK' })
// Retorna solo ventas donde metodo_pago_1 pertenece a OVERSHARK
```

### Caso 2: Exportar ventas de BRAVO'S
```typescript
exportSales({
  filters: { empresa: 'BRAVOS' },
  columns: ['cel_vendedor', 'monto', ...]
})
// Exporta solo ventas de BRAVO'S
```

### Caso 3: Combinar filtros
```typescript
getSales({
  empresa: 'OVERSHARK',
  region: 'LIMA',
  fecha_desde: '2024-01-01',
  monto_min: 100
})
// Ventas de OVERSHARK en LIMA desde enero con monto >= 100
```

---

## 🎨 IMPLEMENTACIÓN DE UI ✅

### ✅ 1. Componente de filtros de ventas

**Archivo:** `src/components/dashboard/sales-filters.tsx`

Se agregó el selector de empresa en los filtros avanzados, ubicado después del filtro de Región.

**Características:**
- Select con todas las opciones de empresa (Todas, OVERSHARK, BRAVO'S, Otros)
- Badge en filtros activos mostrando la empresa seleccionada
- Manejo correcto de estado y limpieza de filtros

### ✅ 2. Componente de exportación

**Archivo:** `src/components/export/export-form.tsx`

Se agregó el selector de empresa en los "Filtros Principales", después del filtro de Región.

**Características:**
- Select con todas las opciones de empresa
- Integración con cálculo de resumen (respeta el filtro de empresa)
- Exportación respeta el filtro seleccionado

### ✅ 3. Propagación de props

Se actualizaron los siguientes archivos para pasar la prop `empresas`:
- `src/app/(dashboard)/ventas/page.tsx`
- `src/components/dashboard/sales-data-table.tsx`

### 💡 Mejora Opcional (Pendiente)

Mostrar badge de empresa en cada venta de la tabla:

```tsx
import { getCompanyFromPaymentMethod, getCompanyConfig } from '@/lib/companies'

const company = getCompanyFromPaymentMethod(sale.metodo_pago_1)
const config = getCompanyConfig(company)

<Badge style={{ backgroundColor: config?.color }}>
  {config?.displayName || 'OTROS'}
</Badge>
```

---

## ✅ RESUMEN DE CAMBIOS

### Archivos Nuevos:
- ✨ `src/lib/companies.ts` - Librería central de empresas

### Archivos Modificados (Backend):
- ✅ `src/app/(dashboard)/ventas/actions.ts`
  - Tipo `SalesFilters` con campo `empresa`
  - Lógica de filtrado por empresa
  - Lista de teléfonos actualizada (+ PUB BRAV/829)
  - `getFilterOptions()` retorna opciones de empresa

- ✅ `src/app/(dashboard)/export/actions.ts`
  - Lógica de filtrado por empresa en exportación
  - Lógica de filtrado por empresa en resumen

### Archivos Modificados (UI):
- ✅ `src/components/dashboard/sales-filters.tsx`
  - Agregado prop `empresas` a la interfaz
  - Agregado Select para filtro de empresa
  - Agregado Badge para mostrar empresa activa

- ✅ `src/components/export/export-form.tsx`
  - Agregado `empresas` a FilterOptionsData
  - Agregado Select para filtro de empresa en "Filtros Principales"

- ✅ `src/app/(dashboard)/ventas/page.tsx`
  - Pasando prop `empresas` a SalesDataTable

- ✅ `src/components/dashboard/sales-data-table.tsx`
  - Agregado prop `empresas` y propagación a SalesFilters

---

## 🧪 PRUEBAS RECOMENDADAS

1. **Filtrar por OVERSHARK**
   - Verificar que solo aparezcan ventas con teléfonos de OVERSHARK
   - Contar manualmente algunos registros

2. **Filtrar por BRAVO'S**
   - Verificar que solo aparezcan ventas con teléfonos de BRAVO'S
   - Los 4 teléfonos deberían aparecer

3. **Filtrar por OTROS**
   - Verificar que NO aparezcan teléfonos de OVERSHARK ni BRAVO'S
   - Solo métodos de pago desconocidos

4. **Combinar filtros**
   - Empresa + Región + Fechas
   - Verificar que todos los filtros se respeten

5. **Exportación**
   - Exportar con filtro de empresa
   - Verificar que el Excel solo tenga registros de esa empresa

---

## 📝 NOTAS IMPORTANTES

### 1. Formato de Teléfonos

Los teléfonos **deben coincidir exactamente** con los definidos en `companies.ts`:
- ✅ `TRANSF. 0102 Cuenta bancaria` (correcto)
- ❌ `TRANSF. 0102` (incorrecto - falta "Cuenta bancaria")

Si hay inconsistencias en la BD, la función regex intentará detectarlos.

### 2. Empresas vs Métodos de Pago

**NO se separan por tipo** (LIVE, PUB, TK) dentro de cada empresa.
- Lo único importante es: ¿Pertenece a OVERSHARK o BRAVO'S?
- Los códigos (L1, P1, TK1) solo son identificadores del teléfono

### 3. Escalabilidad

Si agregan más empresas en el futuro:
1. Agregar configuración en `src/lib/companies.ts`
2. Los filtros funcionarán automáticamente
3. Solo actualizar UI para mostrar la nueva opción

---

## 🎉 ESTADO FINAL

**Implementación completada:** 20 de Noviembre 2024
**Estado:** ✅ Backend completo - ✅ UI completa - ✅ Build exitoso

### ✅ Completado:
- Backend: Filtrado por empresa en ventas y exportación
- UI: Selectores de empresa en ventas y exportación
- Tipos: TypeScript correctamente configurado
- Build: Compilación exitosa sin errores

### 💡 Mejoras Opcionales:
- Agregar badge de empresa en cada fila de la tabla de ventas
- Agregar indicadores visuales de empresa en dashboard principal

**Próximo paso:** Probar funcionalmente en el navegador
