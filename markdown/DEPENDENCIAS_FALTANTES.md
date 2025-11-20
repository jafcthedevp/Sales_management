# 📦 Dependencias Faltantes para Instalar

## 🔧 Instalación Rápida

Ejecuta este comando en la terminal para instalar todas las dependencias faltantes:

```bash
npm install xlsx @tanstack/react-table date-fns recharts
```

## 📋 Detalles de Cada Dependencia

### 1. **xlsx** (SheetJS)
- **Propósito**: Manejo de archivos Excel (lectura y escritura)
- **Uso en el proyecto**:
  - Leer archivos XLSX cargados por admins
  - Exportar datos filtrados a Excel
  - Validar estructura de archivos

**Versión recomendada**: `^0.18.5`

---

### 2. **@tanstack/react-table** (TanStack Table v8)
- **Propósito**: Librería para tablas interactivas en React
- **Uso en el proyecto**:
  - Tabla principal de ventas con paginación
  - Filtros por columna
  - Ordenamiento
  - Selección múltiple de filas

**Versión recomendada**: `^8.20.0`

---

### 3. **date-fns**
- **Propósito**: Librería para manejo y formateo de fechas
- **Uso en el proyecto**:
  - Formatear fechas de ventas
  - Filtros por rango de fechas
  - Calcular estadísticas por período

**Versión recomendada**: `^4.1.0`

---

### 4. **recharts**
- **Propósito**: Librería de gráficos para React
- **Uso en el proyecto**:
  - Dashboard con gráficos estadísticos
  - Visualización de ventas por región
  - Gráficos de métodos de pago
  - Top vendedores

**Versión recomendada**: `^2.15.0`

---

## 🎯 Comando Completo

```bash
npm install xlsx@^0.18.5 @tanstack/react-table@^8.20.0 date-fns@^4.1.0 recharts@^2.15.0
```

---

## ✅ Verificación de Instalación

Después de instalar, verifica que se agregaron correctamente en tu `package.json`:

```json
{
  "dependencies": {
    "xlsx": "^0.18.5",
    "@tanstack/react-table": "^8.20.0",
    "date-fns": "^4.1.0",
    "recharts": "^2.15.0"
  }
}
```

---

## 📝 Dependencias Ya Instaladas (No requieren acción)

Las siguientes dependencias YA están instaladas en tu proyecto:

✅ `@supabase/supabase-js` - Cliente de Supabase
✅ `@supabase/ssr` - Helpers de Supabase para SSR
✅ `react-hook-form` - Manejo de formularios
✅ `zod` - Validación de esquemas
✅ `lucide-react` - Iconos
✅ `shadcn/ui components` - Componentes de UI

---

## 🚀 Próximos Pasos

Una vez instaladas las dependencias:

1. ✅ Ejecutar scripts SQL en Supabase
2. ✅ Crear archivo `.env.local` con credenciales
3. ✅ Comenzar desarrollo de autenticación
4. ✅ Implementar dashboard y tabla de ventas

---

**Fecha**: Noviembre 2024
**Proyecto**: Sales Management System
