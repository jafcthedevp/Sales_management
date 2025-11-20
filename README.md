# 🚀 Sistema de Gestión de Ventas

Sistema web para la administración de datos de ventas con carga masiva de Excel, consultas personalizadas y exportación de datos.

---

## 🏗️ Stack Tecnológico

- **Frontend**: Next.js 16.0.3 + React 19 + TypeScript
- **UI**: Tailwind CSS 4 + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Tablas**: TanStack Table (React Table v8)
- **Excel**: xlsx / SheetJS
- **Formularios**: React Hook Form + Zod
- **Gráficos**: Recharts
- **Fechas**: date-fns

---

## 🚀 Inicio Rápido

### 1️⃣ Instalar dependencias (ya hecho)
```bash
npm install
```

### 2️⃣ Crear archivo `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3️⃣ Ejecutar en desarrollo
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📁 Estructura del Proyecto

```
sales-management/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/              # Autenticación de usuarios
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/          # Dashboard con estadísticas
│   │   │   ├── ventas/             # Gestión de ventas
│   │   │   ├── upload/             # Carga masiva de Excel
│   │   │   ├── export/             # Exportación de datos
│   │   │   └── usuarios/           # Administración de usuarios
│   │   └── api/                    # API Routes
│   │
│   ├── components/
│   │   ├── auth/                   # Componentes de autenticación
│   │   ├── dashboard/              # Componentes del dashboard
│   │   ├── layout/                 # Header y navegación
│   │   └── ui/                     # Componentes shadcn/ui
│   │
│   ├── lib/
│   │   ├── dal.ts                  # Data Access Layer
│   │   ├── utils.ts                # Utilidades generales
│   │   └── supabase/
│   │       ├── client.ts           # Cliente de Supabase
│   │       ├── server.ts           # Servidor de Supabase
│   │       └── middleware.ts       # Middleware de autenticación
│   │
│   ├── types/
│   │   └── database.types.ts       # Tipos de base de datos
│   │
│   └── middleware.ts               # Middleware de Next.js
│
└── package.json
```

---

## 👥 Roles de Usuario

### **Admin**
- ✅ Ver todas las ventas
- ✅ Subir archivos Excel
- ✅ Exportar datos
- ✅ Eliminar registros
- ✅ Gestionar usuarios

### **Contador**
- ✅ Ver todas las ventas
- ✅ Aplicar filtros y búsquedas
- ✅ Exportar datos filtrados
- ❌ No puede subir archivos
- ❌ No puede eliminar registros
- ❌ No puede gestionar usuarios

---

## 🎯 Características Principales

### ✅ Implementadas
- Sistema de autenticación con Supabase
- Dashboard con estadísticas en tiempo real
- Gestión de ventas con filtros avanzados
- Roles de usuario (Admin y Contador)
- Protección de rutas y seguridad RLS
- Interfaz responsive con Tailwind CSS

### 🔄 En desarrollo
- Carga masiva de datos desde Excel
- Exportación de datos filtrados
- Gestión avanzada de usuarios
- Reportes y gráficos personalizados

---

## 🔒 Seguridad

- Row Level Security (RLS) en todas las tablas de Supabase
- Validación server-side con Zod
- Autenticación mediante JWT
- Middleware para refresh de tokens
- Data Access Layer (DAL) centralizado
- Políticas de acceso basadas en roles

---

## 📖 Tecnologías y Referencias

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Table](https://tanstack.com/table/latest)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hook Form](https://react-hook-form.com/)
- [Recharts](https://recharts.org/)

---

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar en producción
npm start

# Linter
npm run lint

# Agregar componente de shadcn/ui
npx shadcn@latest add [componente]
```

---

**Versión**: 1.0.0
**Última actualización**: Noviembre 2024
**Estado**: En desarrollo activo
