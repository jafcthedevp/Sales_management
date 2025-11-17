# 🧪 Guía de Pruebas - Login y Registro

## Estado del Servidor

✅ **Servidor de desarrollo corriendo en:** `http://localhost:3000`

## Credenciales de Prueba

- **Email:** flores.anthony.489@gmail.com
- **Contraseña:** prueba123
- **Nombre completo:** Anthony Flores

---

## 📝 Prueba 1: REGISTRO

### Pasos:

1. Abre tu navegador y ve a: `http://localhost:3000/register`

2. Completa el formulario con los siguientes datos:
   - **Nombre completo:** Anthony Flores
   - **Email:** flores.anthony.489@gmail.com
   - **Contraseña:** prueba123
   - **Confirmar contraseña:** prueba123

3. Haz clic en **"Crear cuenta"**

### Resultados esperados:

✅ **Caso 1: Registro exitoso**
- Verás un mensaje: "Usuario creado exitosamente. Ya puedes iniciar sesión."
- Supabase enviará un correo de confirmación a: flores.anthony.489@gmail.com
- **IMPORTANTE:** Revisa tu bandeja de entrada (y spam) y haz clic en el enlace de confirmación

✅ **Caso 2: Usuario ya existe**
- Verás un mensaje: "User already registered"
- En este caso, procede directamente a la Prueba 2 (Login)

### ¿Qué verifica esta prueba?

- ✓ Validación de formulario (campos requeridos, formato de email, coincidencia de contraseñas)
- ✓ Creación de usuario en Supabase Auth
- ✓ Creación automática del perfil en la tabla `profiles` (mediante trigger de base de datos)
- ✓ Envío de correo de confirmación

---

## 🔐 Prueba 2: LOGIN

### Pasos:

1. **IMPORTANTE:** Primero confirma tu correo haciendo clic en el enlace que Supabase envió

2. Ve a: `http://localhost:3000/login`

3. Ingresa las credenciales:
   - **Email:** flores.anthony.489@gmail.com
   - **Contraseña:** prueba123

4. Haz clic en **"Iniciar sesión"**

### Resultados esperados:

✅ **Login exitoso:**
- Serás redirigido automáticamente a: `http://localhost:3000/dashboard`
- Verás tu nombre en el header: "Anthony Flores"
- Verás el rol asignado: "contador" (por defecto)
- Tendrás acceso a visualizar las ventas

❌ **Si el correo no está confirmado:**
- Verás un error: "Email not confirmed"
- **Solución:** Revisa tu correo y haz clic en el enlace de confirmación de Supabase

❌ **Si las credenciales son incorrectas:**
- Verás un error: "Credenciales inválidas. Por favor verifica tu email y contraseña."

❌ **Si la cuenta está inactiva:**
- Verás un error: "Tu cuenta está inactiva. Contacta al administrador."

### ¿Qué verifica esta prueba?

- ✓ Autenticación con Supabase
- ✓ Verificación de que el perfil existe
- ✓ Verificación de que la cuenta está activa (`is_active = true`)
- ✓ Creación de sesión con JWT
- ✓ Redirección al dashboard
- ✓ Protección de rutas

---

## 🏠 Prueba 3: ACCESO AL DASHBOARD

### Pasos:

1. Después de hacer login exitoso, deberías estar en: `http://localhost:3000/dashboard`

2. Verifica lo siguiente:

### Resultados esperados:

✅ **Header:**
- Verás el logo "Sistema de Gestión de Ventas"
- Verás tu nombre: "Anthony Flores"
- Verás un botón de "Cerrar sesión"

✅ **Navegación:**
- Menú lateral con las siguientes opciones:
  - Dashboard
  - Ventas
  - Reportes
  - Cargar Datos
  - Usuarios (solo si eres admin)

✅ **Permisos según rol:**
- Como **contador** (rol por defecto):
  - ✓ Puedes ver el dashboard
  - ✓ Puedes ver la lista de ventas
  - ✓ Puedes ver reportes
  - ✓ Puedes exportar datos
  - ✗ NO puedes crear/editar/eliminar ventas
  - ✗ NO puedes ver la sección de usuarios

- Como **admin** (requiere cambiar el rol en la base de datos):
  - ✓ Acceso completo a todas las funciones
  - ✓ Puede crear/editar/eliminar ventas
  - ✓ Puede gestionar usuarios

### ¿Qué verifica esta prueba?

- ✓ Protección de rutas (solo usuarios autenticados)
- ✓ Visualización correcta del perfil
- ✓ Permisos basados en roles
- ✓ Navegación funcional

---

## 🚪 Prueba 4: LOGOUT

### Pasos:

1. Estando en el dashboard, haz clic en **"Cerrar sesión"** en el header

### Resultados esperados:

✅ **Logout exitoso:**
- Serás redirigido a: `http://localhost:3000/login`
- Tu sesión habrá sido destruida
- Si intentas acceder a `/dashboard` directamente, serás redirigido al login

### ¿Qué verifica esta prueba?

- ✓ Cierre de sesión correcto
- ✓ Destrucción del token de sesión
- ✓ Redirección al login

---

## 🔄 Prueba 5: PROTECCIÓN DE RUTAS

### Pasos:

1. **Sin estar logueado**, intenta acceder directamente a:
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/sales`
   - `http://localhost:3000/reports`

### Resultados esperados:

✅ **Redirección automática:**
- En todos los casos deberías ser redirigido automáticamente a `/login`
- Esto demuestra que las rutas están protegidas correctamente

### ¿Qué verifica esta prueba?

- ✓ Middleware de autenticación funciona
- ✓ Rutas protegidas correctamente
- ✓ Seguridad del sistema

---

## 🔍 Verificación de Base de Datos

### Después de registrarte, puedes verificar en Supabase:

1. Ve a tu proyecto de Supabase: `https://gqrmlzryozcysvwxtlbm.supabase.co`

2. En el panel de **Authentication > Users**, deberías ver:
   - ✓ Tu usuario: flores.anthony.489@gmail.com
   - ✓ Estado: Confirmed (después de confirmar el correo)
   - ✓ Metadata: { full_name: "Anthony Flores" }

3. En **Table Editor > profiles**, deberías ver:
   - ✓ Tu perfil creado automáticamente
   - ✓ Email: flores.anthony.489@gmail.com
   - ✓ Full name: Anthony Flores
   - ✓ Role: contador
   - ✓ Is active: true
   - ✓ Fecha de creación

---

## 📊 Resumen de Validaciones

| Componente | Validación |
|-----------|-----------|
| ✅ Formulario de registro | Campos requeridos, email válido, contraseñas coinciden |
| ✅ Creación de usuario | Usuario creado en Supabase Auth |
| ✅ Trigger de base de datos | Perfil creado automáticamente |
| ✅ Confirmación de email | Correo enviado por Supabase |
| ✅ Login | Autenticación exitosa |
| ✅ Verificación de perfil | Perfil existe y está activo |
| ✅ Sesión JWT | Token creado y guardado en cookies |
| ✅ Redirección | Redirige al dashboard después del login |
| ✅ Protección de rutas | Solo usuarios autenticados pueden acceder |
| ✅ Roles y permisos | Permisos según rol asignado |
| ✅ Logout | Cierre de sesión y destrucción del token |

---

## ⚠️ Problemas Comunes

### "Email not confirmed"
**Causa:** No confirmaste tu correo
**Solución:** Revisa tu bandeja de entrada y spam, haz clic en el enlace de confirmación de Supabase

### "User already registered"
**Causa:** El correo ya está registrado
**Solución:** Usa el login directamente, o usa otro correo para probar el registro

### "No se encontró el perfil del usuario"
**Causa:** El trigger de base de datos no se ejecutó correctamente
**Solución:** Verifica que ejecutaste el script `supabase_setup_tables.sql` completamente

### "Tu cuenta está inactiva"
**Causa:** El campo `is_active` del perfil está en `false`
**Solución:** Ve a Supabase > Table Editor > profiles y cambia `is_active` a `true`

### No puedo acceder a ciertas funciones
**Causa:** Permisos insuficientes (rol contador)
**Solución:** Para tener acceso completo, cambia el rol a `admin` en la tabla profiles

---

## 🎯 Checklist de Pruebas

- [ ] Registro exitoso con flores.anthony.489@gmail.com
- [ ] Correo de confirmación recibido
- [ ] Email confirmado (clic en enlace)
- [ ] Login exitoso
- [ ] Redirección al dashboard
- [ ] Visualización del nombre en el header
- [ ] Navegación funcional
- [ ] Permisos correctos según rol
- [ ] Logout exitoso
- [ ] Protección de rutas funciona
- [ ] Perfil creado en base de datos

---

## 🎉 Resultado Esperado

Si todas las pruebas pasaron:

- ✅ Sistema de autenticación funciona correctamente
- ✅ Registro de usuarios operativo
- ✅ Login y logout funcionan
- ✅ Protección de rutas implementada
- ✅ Roles y permisos configurados
- ✅ Base de datos sincronizada con Auth

**¡El sistema de login y registro está listo para usar!**
