# Sistema de Gestión de Ventas - Documentación Técnica

## 📋 Índice
1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Modelo de Datos](#modelo-de-datos)
4. [Arquitectura del Sistema](#arquitectura-del-sistema)
5. [Roles y Permisos](#roles-y-permisos)
6. [Funcionalidades Principales](#funcionalidades-principales)
7. [Flujos de Trabajo](#flujos-de-trabajo)
8. [Estructura del Proyecto](#estructura-del-proyecto)
9. [Configuración Inicial](#configuración-inicial)
10. [Roadmap de Desarrollo](#roadmap-de-desarrollo)

---

## 📖 Descripción del Proyecto

Sistema web para la administración de datos de ventas que permite:
- **Carga masiva** de información mediante archivos Excel (XLSX)
- **Consultas personalizadas** para contadores
- **Exportación selectiva** de datos en formato Excel
- **Gestión de usuarios** con roles Admin y Contador

### Usuarios del Sistema
- **Total aproximado**: 10 usuarios
- **Roles**: Administrador y Contador

---

## 🛠 Stack Tecnológico

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **UI Components**: shadcn/ui + Tailwind CSS
- **Librería de tablas**: TanStack Table (React Table v8)
- **Manejo de Excel**: xlsx / sheetjs
- **Validación de formularios**: React Hook Form + Zod

### Backend
- **BaaS**: Supabase
  - PostgreSQL Database
  - Authentication
  - Row Level Security (RLS)
  - Storage para archivos temporales

### DevOps
- **Hosting**: Vercel
- **Control de versiones**: Git / GitHub

---

## 🗄 Modelo de Datos

### 1. Tabla: `users`
Extendida desde auth.users de Supabase

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'contador')) DEFAULT 'contador',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Tabla: `sales`
Almacena todas las transacciones de ventas

```sql
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Información del vendedor
  cel_vendedor TEXT NOT NULL,
  
  -- Información del cliente
  numero_cliente TEXT NOT NULL,
  nombre_cliente TEXT,
  
  -- Información de pago
  metodo_pago TEXT NOT NULL,
  metodo_pago_1 TEXT,
  monto DECIMAL(10,2) NOT NULL,
  
  -- Ubicación
  region TEXT CHECK (region IN ('LIMA', 'PROVINCIA')),
  
  -- Metadata
  fecha_venta DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índices para búsquedas rápidas
  CONSTRAINT valid_monto CHECK (monto >= 0)
);

-- Índices para optimización
CREATE INDEX idx_sales_cel_vendedor ON sales(cel_vendedor);
CREATE INDEX idx_sales_numero_cliente ON sales(numero_cliente);
CREATE INDEX idx_sales_fecha_venta ON sales(fecha_venta);
CREATE INDEX idx_sales_region ON sales(region);
CREATE INDEX idx_sales_metodo_pago ON sales(metodo_pago);
```

### 3. Tabla: `upload_logs`
Registro de cargas de archivos

```sql
CREATE TABLE public.upload_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id),
  records_count INTEGER,
  success_count INTEGER,
  error_count INTEGER,
  errors_detail JSONB,
  status TEXT CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Tabla: `export_logs`
Registro de exportaciones

```sql
CREATE TABLE public.export_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exported_by UUID REFERENCES public.profiles(id),
  filters_applied JSONB,
  records_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🏗 Arquitectura del Sistema

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────┐
│                   Frontend                      │
│              (Next.js 14 App)                   │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   Auth       │  │   Dashboard  │            │
│  │   Pages      │  │   Principal  │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   Upload     │  │   Export     │            │
│  │   Module     │  │   Module     │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  ┌──────────────────────────────────┐          │
│  │      Data Table Component        │          │
│  │   (Filtros, Búsqueda, Paginación)│          │
│  └──────────────────────────────────┘          │
└─────────────────────────────────────────────────┘
                      │
                      │ API Calls
                      ▼
┌─────────────────────────────────────────────────┐
│                  Supabase                       │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │     Auth     │  │  PostgreSQL  │            │
│  │   Service    │  │   Database   │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │     RLS      │  │   Storage    │            │
│  │   Policies   │  │   (Temp)     │            │
│  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────┘
```

---

## 👥 Roles y Permisos

### Admin
✅ Crear, editar y eliminar usuarios  
✅ Subir archivos Excel  
✅ Ver todas las ventas  
✅ Exportar datos  
✅ Eliminar registros  
✅ Ver logs de sistema  

### Contador
✅ Ver todas las ventas  
✅ Aplicar filtros y búsquedas  
✅ Exportar datos filtrados  
❌ No puede subir archivos  
❌ No puede eliminar registros  
❌ No puede gestionar usuarios  

### Row Level Security (RLS) Policies

```sql
-- Política para lectura (todos los roles autenticados)
CREATE POLICY "Usuarios autenticados pueden leer ventas"
ON sales FOR SELECT
TO authenticated
USING (true);

-- Política para inserción (solo admins)
CREATE POLICY "Solo admins pueden insertar ventas"
ON sales FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Política para eliminación (solo admins)
CREATE POLICY "Solo admins pueden eliminar ventas"
ON sales FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

---

## ⚙️ Funcionalidades Principales

### 1. Autenticación
- Login con email y contraseña
- Recuperación de contraseña
- Sesión persistente

### 2. Dashboard Principal
- Resumen de métricas:
  - Total de ventas
  - Suma de montos por región
  - Top vendedores
  - Métodos de pago más usados
- Gráficos estadísticos
- Filtros rápidos

### 3. Módulo de Carga (Solo Admin)
- **Upload de Excel**:
  - Drag & drop o selección de archivo
  - Validación de estructura
  - Preview de datos antes de importar
  - Procesamiento por lotes (chunks)
  - Manejo de errores detallado
  - Log de importación

### 4. Módulo de Consultas
- **Tabla interactiva** con:
  - Paginación
  - Búsqueda global
  - Filtros por columna:
    - Vendedor
    - Cliente
    - Método de pago
    - Región
    - Rango de fechas
    - Rango de montos
  - Ordenamiento
  - Selección múltiple

### 5. Módulo de Exportación
- **Exportar a Excel** con:
  - Aplicación de filtros activos
  - Selección de columnas
  - Formato personalizable
  - Nombre de archivo con timestamp

### 6. Gestión de Usuarios (Solo Admin)
- Crear usuarios
- Asignar roles
- Activar/desactivar cuentas

---

## 🔄 Flujos de Trabajo

### Flujo 1: Carga de Datos

```
Admin selecciona archivo XLSX
         ↓
Validación de formato
         ↓
Preview de datos (primeras 10 filas)
         ↓
Admin confirma importación
         ↓
Procesamiento por lotes (1000 registros/batch)
         ↓
Registro en upload_logs
         ↓
Feedback: X registros insertados, Y errores
```

### Flujo 2: Consulta y Exportación

```
Contador ingresa al dashboard
         ↓
Aplica filtros deseados:
  - Vendedor: "ZAZU-385"
  - Fecha: Enero 2024
  - Región: LIMA
         ↓
Visualiza resultados en tabla
         ↓
Click en "Exportar a Excel"
         ↓
Sistema genera XLSX con datos filtrados
         ↓
Descarga automática
         ↓
Registro en export_logs
```

---

## 📁 Estructura del Proyecto

```
sales-management-system/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard principal
│   │   ├── ventas/
│   │   │   └── page.tsx                # Tabla de ventas
│   │   ├── upload/
│   │   │   └── page.tsx                # Carga de archivos
│   │   ├── export/
│   │   │   └── page.tsx                # Exportación
│   │   └── usuarios/
│   │       └── page.tsx                # Gestión de usuarios
│   ├── api/
│   │   ├── sales/
│   │   │   ├── route.ts                # GET, POST ventas
│   │   │   └── [id]/route.ts           # DELETE venta
│   │   ├── upload/
│   │   │   └── route.ts                # Procesamiento de Excel
│   │   └── export/
│   │       └── route.ts                # Generación de Excel
│   └── layout.tsx
├── components/
│   ├── ui/                              # shadcn components
│   ├── dashboard/
│   │   ├── sales-table.tsx
│   │   ├── stats-cards.tsx
│   │   └── charts.tsx
│   ├── upload/
│   │   ├── file-dropzone.tsx
│   │   └── preview-table.tsx
│   └── layout/
│       ├── navbar.tsx
│       └── sidebar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── utils/
│   │   ├── excel.ts                     # Funciones de manejo de Excel
│   │   └── formatters.ts
│   └── validations/
│       └── sale-schema.ts               # Zod schemas
├── types/
│   ├── database.types.ts                # Tipos generados de Supabase
│   └── index.ts
├── middleware.ts                        # Auth middleware
├── .env.local
└── package.json
```

---

## 🚀 Configuración Inicial

### 1. Crear proyecto Next.js

```bash
npx create-next-app@latest sales-management --typescript --tailwind --app
cd sales-management
```

### 2. Instalar dependencias

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install xlsx
npm install @tanstack/react-table
npm install @radix-ui/react-dropdown-menu @radix-ui/react-dialog
npm install lucide-react
npm install react-hook-form @hookform/resolvers zod
npm install date-fns
npm install recharts
```

### 3. Configurar Supabase

```bash
# Crear proyecto en https://supabase.com
# Copiar URL y ANON KEY
```

**.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 4. Ejecutar migraciones SQL

Ejecutar en Supabase SQL Editor todos los scripts de creación de tablas y políticas mencionados anteriormente.

### 5. Configurar autenticación en Supabase

- Habilitar Email Auth
- Configurar Email Templates
- Configurar Redirect URLs

---

## 🗺 Roadmap de Desarrollo

### Fase 1: Setup y Autenticación (Semana 1)
- [ ] Configurar proyecto Next.js + TypeScript
- [ ] Configurar Supabase
- [ ] Crear tablas en base de datos
- [ ] Implementar autenticación básica
- [ ] Crear layout principal
- [ ] Implementar middleware de protección

### Fase 2: Dashboard y Visualización (Semana 2)
- [ ] Crear página de dashboard
- [ ] Implementar tabla de ventas con TanStack Table
- [ ] Añadir filtros básicos
- [ ] Crear componentes de estadísticas
- [ ] Implementar paginación

### Fase 3: Carga de Datos (Semana 3)
- [ ] Crear interfaz de upload
- [ ] Implementar drag & drop
- [ ] Validación de estructura Excel
- [ ] Preview de datos
- [ ] Procesamiento por lotes
- [ ] Manejo de errores y logs

### Fase 4: Exportación (Semana 4)
- [ ] Implementar generación de Excel
- [ ] Aplicar filtros activos
- [ ] Selección de columnas
- [ ] Personalización de formato
- [ ] Log de exportaciones

### Fase 5: Gestión de Usuarios (Semana 5)
- [ ] CRUD de usuarios (Admin)
- [ ] Asignación de roles
- [ ] Validación de permisos
- [ ] Perfil de usuario

### Fase 6: Optimización y Testing (Semana 6)
- [ ] Optimización de queries
- [ ] Implementar caché
- [ ] Testing unitario
- [ ] Testing E2E
- [ ] Documentación de usuario

### Fase 7: Deploy (Semana 7)
- [ ] Configurar Vercel
- [ ] Variables de entorno
- [ ] Deploy a producción
- [ ] Monitoreo y logs

---

## 📊 Formato de Archivo Excel Esperado

### Columnas Requeridas

| Columna | Tipo | Ejemplo | Requerido |
|---------|------|---------|-----------|
| CEL VENDEDOR | Texto | ZAZU-385 | ✅ |
| NÚMERO CLIENTE | Texto | 970072875 | ✅ |
| NOMBRE CLIENTE | Texto | JENNY MERCHOR | ❌ |
| MÉTODO PAGO | Texto | PLIN | ✅ |
| MÉTODO PAGO 1 | Texto | LIVE BRAV/402 | ❌ |
| MONTO | Numérico | 99.00 | ✅ |
| REGIÓN | Texto | LIMA | ✅ |

### Validaciones en Upload

```typescript
const saleSchema = z.object({
  cel_vendedor: z.string().min(1, "Vendedor es requerido"),
  numero_cliente: z.string().min(1, "Número de cliente requerido"),
  nombre_cliente: z.string().optional(),
  metodo_pago: z.string().min(1, "Método de pago requerido"),
  metodo_pago_1: z.string().optional(),
  monto: z.number().positive("Monto debe ser positivo"),
  region: z.enum(["LIMA", "PROVINCIA"], {
    errorMap: () => ({ message: "Región debe ser LIMA o PROVINCIA" })
  })
});
```

---

## 🔒 Seguridad

### Buenas Prácticas Implementadas

1. **Row Level Security** en todas las tablas
2. **Validación server-side** de todos los inputs
3. **Sanitización** de datos antes de insertar
4. **Rate limiting** en endpoints de API
5. **HTTPS** obligatorio en producción
6. **Variables de entorno** para credenciales
7. **Tokens JWT** para autenticación
8. **Logs de auditoría** para acciones críticas

---

## 📞 Soporte y Mantenimiento

### Logs a Monitorear
- Errores en uploads
- Queries lentas
- Intentos de acceso no autorizados
- Exportaciones grandes

### Backup
- Backup automático de Supabase (incluido en plan)
- Exportación mensual completa de datos

---

## 📝 Notas Adicionales

- El sistema está diseñado para escalar hasta 100,000 registros sin problemas
- Se recomienda mantener archivos Excel bajo 10 MB por upload
- Los filtros se aplican en el servidor para mejor rendimiento
- Implementar caché de Redis si el volumen crece significativamente

---

**Versión**: 1.0  
**Última actualización**: Noviembre 2024  
**Responsable**: Equipo de Desarrollo

---

## 📥 Descarga

Para usar este documento:
1. Copia todo el contenido
2. Crea un archivo llamado `DOCUMENTATION.md` en la raíz de tu proyecto
3. Pega el contenido
4. ¡Listo para usar con Claude Code!