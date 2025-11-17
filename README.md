# 🚀 Sistema de Gestión de Ventas

Sistema web para la administración de datos de ventas con carga masiva de Excel, consultas personalizadas y exportación de datos.

---

## 📚 Documentación del Proyecto

### 🎯 **Para Empezar (LEER PRIMERO)**
1. **[RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)** - Resumen rápido del estado actual
2. **[INSTRUCCIONES_SETUP.md](INSTRUCCIONES_SETUP.md)** - Tutorial de configuración paso a paso

### 📊 **Estado y Progreso**
3. **[PROGRESO_ACTUAL.md](PROGRESO_ACTUAL.md)** - Estado detallado y qué falta por hacer
4. **[sales_mgmt_docs.md](sales_mgmt_docs.md)** - Documentación técnica completa del proyecto

### 🔍 **Análisis Técnico**
5. **[ANALISIS_ARQUITECTURA.md](ANALISIS_ARQUITECTURA.md)** - Análisis de middleware y arquitectura

### 🗄️ **Scripts SQL de Supabase**
6. **[supabase_setup_tables.sql](supabase_setup_tables.sql)** - Crear tablas de base de datos
7. **[supabase_setup_rls.sql](supabase_setup_rls.sql)** - Configurar seguridad (RLS)

### 📦 **Otros**
8. **[DEPENDENCIAS_FALTANTES.md](DEPENDENCIAS_FALTANTES.md)** - Dependencias (ya instaladas)

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

### 2️⃣ Configurar Supabase
Ver tutorial completo en: **[INSTRUCCIONES_SETUP.md](INSTRUCCIONES_SETUP.md)**

### 3️⃣ Crear archivo `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4️⃣ Ejecutar en desarrollo
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📁 Estructura del Proyecto

```
sales-management/
├── 📄 Documentación
│   ├── README.md (este archivo)
│   ├── RESUMEN_EJECUTIVO.md
│   ├── PROGRESO_ACTUAL.md
│   ├── INSTRUCCIONES_SETUP.md
│   ├── ANALISIS_ARQUITECTURA.md
│   ├── sales_mgmt_docs.md
│   ├── supabase_setup_tables.sql
│   └── supabase_setup_rls.sql
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/              ✅ Login completo
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/          ✅ Dashboard con stats
│   │   │   ├── ventas/             ⏳ Próximo
│   │   │   ├── upload/             ⏳ Pendiente
│   │   │   ├── export/             ⏳ Pendiente
│   │   │   └── usuarios/           ⏳ Pendiente
│   │   └── api/                    ⏳ Pendiente
│   │
│   ├── components/
│   │   ├── auth/                   ✅ Login form
│   │   ├── dashboard/              ✅ Stats + Recent sales
│   │   ├── layout/                 ✅ Header + Nav
│   │   └── ui/                     ✅ shadcn components
│   │
│   ├── lib/
│   │   ├── dal.ts                  ✅ Data Access Layer
│   │   ├── utils.ts                ✅ Utilidades
│   │   └── supabase/
│   │       ├── client.ts           ⏳ Para Client Components
│   │       ├── server.ts           ✅ Para Server Components
│   │       └── middleware.ts       ✅ Refresh de tokens
│   │
│   ├── types/
│   │   └── database.types.ts       ✅ Tipos de Supabase
│   │
│   └── middleware.ts               ✅ Middleware minimalista
│
└── package.json
```

**Leyenda**: ✅ Completado | ⏳ Pendiente

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

## 🎯 Estado Actual

### ✅ **Fase 1: Completada** (Autenticación)
- Sistema de login funcional
- Dashboard con estadísticas
- Navegación con sidebar
- Protección de rutas

### 🔄 **Fase 2: En Progreso** (40%)
- Dashboard básico implementado
- Falta tabla de ventas con filtros

### ⏳ **Fases Pendientes**
- Fase 3: Carga de datos (Excel)
- Fase 4: Exportación
- Fase 5: Gestión de usuarios
- Fase 6: Optimización y testing
- Fase 7: Deploy

---

## 📞 Próximos Pasos

1. **Configurar Supabase** (si no lo has hecho)
2. **Probar login y dashboard**
3. **Implementar tabla de ventas** (siguiente tarea)

Ver roadmap completo en: **[PROGRESO_ACTUAL.md](PROGRESO_ACTUAL.md)**

---

## 🔒 Seguridad

- ✅ Row Level Security (RLS) en todas las tablas
- ✅ Validación server-side con Zod
- ✅ Tokens JWT validados
- ✅ Middleware minimalista (solo refresh)
- ✅ DAL para toda la lógica de autenticación

---

## 📖 Documentación Útil

- [Next.js 15/16 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Table](https://tanstack.com/table/latest)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

## 🤝 Desarrollo

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Start
npm start

# Lint
npm run lint

# Agregar componente de shadcn
npx shadcn@latest add [componente]
```

---

## 📝 Notas Importantes

### **Sobre el Middleware**
- Next.js desaconseja usar middleware en v15/16
- Supabase lo requiere para gestión de tokens
- Implementación: Middleware minimalista (solo refresh)
- Toda la lógica de auth está en el DAL

Ver análisis completo: **[ANALISIS_ARQUITECTURA.md](ANALISIS_ARQUITECTURA.md)**

---

**Versión**: 1.0
**Última actualización**: Noviembre 2024
**Estado**: ✅ Listo para continuar desarrollo

---

## 🎉 ¡Comenzar!

**Lee primero**: [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)
**Tutorial setup**: [INSTRUCCIONES_SETUP.md](INSTRUCCIONES_SETUP.md)
**Estado actual**: [PROGRESO_ACTUAL.md](PROGRESO_ACTUAL.md)
