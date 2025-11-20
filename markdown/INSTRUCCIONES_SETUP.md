# 🚀 Instrucciones de Configuración - Sales Management System

## 📝 Pasos para Configurar Supabase y el Proyecto

### **Paso 1: Configurar Supabase (Backend)**

#### 1.1 Crear Proyecto en Supabase
1. Ve a [https://supabase.com](https://supabase.com) e inicia sesión
2. Click en "New Project"
3. Completa los datos:
   - **Project Name**: `sales-management` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura y guárdala
   - **Region**: Selecciona la región más cercana a tus usuarios
4. Click en "Create new project" y espera ~2 minutos

#### 1.2 Ejecutar Scripts SQL (Crear Tablas)
1. En Supabase, ve al menú lateral: **SQL Editor**
2. Click en "+ New query"
3. Abre el archivo `supabase_setup_tables.sql` en tu editor
4. **Copia TODO el contenido** del archivo
5. **Pégalo** en el SQL Editor de Supabase
6. Click en "Run" (o presiona Ctrl/Cmd + Enter)
7. ✅ Verifica que veas el mensaje "Success. No rows returned"

#### 1.3 Ejecutar Scripts RLS (Políticas de Seguridad)
1. En el mismo SQL Editor, click en "+ New query"
2. Abre el archivo `supabase_setup_rls.sql`
3. **Copia TODO el contenido**
4. **Pégalo** en el SQL Editor
5. Click en "Run"
6. ✅ Verifica que todo se ejecutó correctamente

#### 1.4 Verificar que las Tablas se Crearon
1. En Supabase, ve a: **Table Editor** (menú lateral)
2. Deberías ver las siguientes tablas:
   - ✅ `profiles`
   - ✅ `sales`
   - ✅ `upload_logs`
   - ✅ `export_logs`

#### 1.5 Obtener Credenciales de API
1. En Supabase, ve a: **Settings > API** (menú lateral)
2. En la sección "Project URL":
   - Copia la URL (ej: `https://xxxxx.supabase.co`)
3. En la sección "Project API keys":
   - Copia el `anon` / `public` key
   - Copia el `service_role` key (⚠️ **CLAVE SECRETA**)

---

### **Paso 2: Configurar Variables de Entorno**

#### 2.1 Crear archivo .env.local
En la raíz del proyecto, crea un archivo llamado `.env.local`:

```bash
# En Windows (PowerShell)
New-Item .env.local

# En Mac/Linux
touch .env.local
```

#### 2.2 Agregar las credenciales
Copia este contenido en tu `.env.local` y reemplaza con tus valores reales:

```env
# URL de tu proyecto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Anon Key (clave pública)
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_completa_aqui

# Service Role Key (clave privada - SOLO servidor)
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_completa_aqui

# URL de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

⚠️ **IMPORTANTE**:
- Reemplaza `xxxxx` con tus valores reales de Supabase
- **NO compartas** este archivo
- **NO lo subas a Git** (ya está en `.gitignore`)

---

### **Paso 3: Instalar Dependencias Faltantes**

Ejecuta este comando en la terminal (en la raíz del proyecto):

```bash
npm install xlsx @tanstack/react-table date-fns recharts
```

**Esto instalará:**
- ✅ `xlsx` - Para leer/escribir archivos Excel
- ✅ `@tanstack/react-table` - Para tablas interactivas
- ✅ `date-fns` - Para manejo de fechas
- ✅ `recharts` - Para gráficos del dashboard

---

### **Paso 4: Crear Usuario Admin Inicial (IMPORTANTE)**

Después de completar todos los pasos anteriores, necesitarás crear tu primer usuario administrador:

#### Opción A: Crear usuario manualmente en Supabase
1. En Supabase, ve a: **Authentication > Users**
2. Click en "Add user" > "Create new user"
3. Completa:
   - **Email**: tu email
   - **Password**: crea una contraseña
4. Click en "Create user"
5. **IMPORTANTE**: Ahora actualiza el rol a admin:
   - Ve a **SQL Editor** > "+ New query"
   - Ejecuta este SQL (reemplaza con tu email):

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'tu-email@ejemplo.com';
```

#### Opción B: Usar la función de registro (cuando esté implementada)
- Primero deberás implementar la página de registro
- Crear el usuario desde la app
- Luego actualizar manualmente el rol a 'admin' con el SQL de arriba

---

### **Paso 5: Verificar Configuración**

Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## ✅ Checklist de Configuración

Marca cada item cuando lo completes:

- [ ] Proyecto creado en Supabase
- [ ] Script `supabase_setup_tables.sql` ejecutado
- [ ] Script `supabase_setup_rls.sql` ejecutado
- [ ] 4 tablas verificadas en Table Editor
- [ ] Credenciales obtenidas de Supabase
- [ ] Archivo `.env.local` creado
- [ ] Variables de entorno configuradas correctamente
- [ ] Dependencias instaladas (`npm install`)
- [ ] Usuario admin inicial creado
- [ ] Rol de admin asignado al usuario
- [ ] Servidor de desarrollo corriendo (`npm run dev`)

---

## 🆘 Solución de Problemas

### Error: "Invalid API key"
- ✅ Verifica que copiaste correctamente las keys desde Supabase
- ✅ Asegúrate de que no haya espacios extra al inicio/final
- ✅ Verifica que el archivo se llame exactamente `.env.local`

### Error: "relation does not exist"
- ✅ Asegúrate de haber ejecutado `supabase_setup_tables.sql`
- ✅ Verifica que las tablas existan en Table Editor

### Error: "RLS policy violation"
- ✅ Asegúrate de haber ejecutado `supabase_setup_rls.sql`
- ✅ Verifica que tu usuario tenga el rol 'admin' en la tabla profiles

---

## 📞 Siguiente Paso

Una vez completada toda la configuración, estarás listo para comenzar el desarrollo de la aplicación:

1. ✅ Implementar autenticación (login/registro)
2. ✅ Crear layout del dashboard
3. ✅ Implementar tabla de ventas
4. ✅ Módulo de carga Excel
5. ✅ Módulo de exportación

---

**¡Todo listo!** 🎉 Ahora puedes comenzar a desarrollar el sistema.
