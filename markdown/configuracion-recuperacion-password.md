# Configuración de Recuperación de Contraseña

## Descripción General

El sistema de recuperación de contraseña permite a los usuarios restablecer su contraseña mediante un enlace enviado por email.

---

## Flujo de Recuperación

### 1. Usuario solicita recuperación
- El usuario va a `/forgot-password`
- Ingresa su email
- Presiona "Enviar Enlace de Recuperación"

### 2. Sistema envía email
- Supabase envía un email automáticamente
- El email contiene un enlace con un token de recuperación
- El enlace redirige a `/reset-password`

### 3. Usuario restablece contraseña
- El usuario hace clic en el enlace del email
- Es redirigido a `/reset-password` con el token
- Ingresa su nueva contraseña
- Presiona "Restablecer Contraseña"

### 4. Sistema actualiza contraseña
- La contraseña se actualiza en Supabase
- El usuario es redirigido a `/login`
- Puede iniciar sesión con su nueva contraseña

---

## Configuración en Supabase

### Paso 1: Configurar Email Templates

1. Ve al **Dashboard de Supabase**
2. Selecciona tu proyecto
3. Ve a **Authentication** → **Email Templates**
4. Busca el template **"Reset Password"**

### Paso 2: Personalizar el Template

Puedes personalizar el email que reciben los usuarios. Variables disponibles:

```html
{{ .SiteURL }} - URL del sitio (http://localhost:3000)
{{ .Token }} - Token de recuperación
{{ .TokenHash }} - Hash del token
```

**Template recomendado en español:**

```html
<h2>Recuperación de Contraseña</h2>
<p>Hola,</p>
<p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en el Sistema de Gestión de Ventas.</p>
<p>Si no solicitaste esto, puedes ignorar este email de forma segura.</p>
<p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
<p><a href="{{ .SiteURL }}/reset-password?token={{ .TokenHash }}">Restablecer Contraseña</a></p>
<p>Este enlace expirará en 1 hora.</p>
<p>Saludos,<br>Equipo de Sistema de Gestión de Ventas</p>
```

### Paso 3: Configurar URL de Redirección

1. En **Authentication** → **URL Configuration**
2. Agrega tu dominio a **Site URL**:
   - Desarrollo: `http://localhost:3000`
   - Producción: `https://tudominio.com`
3. En **Redirect URLs**, agrega:
   - `http://localhost:3000/reset-password` (desarrollo)
   - `https://tudominio.com/reset-password` (producción)

### Paso 4: Configurar Email Provider

#### Opción 1: Usar el Email por Defecto de Supabase (Desarrollo)
- Supabase proporciona un servicio de email limitado para desarrollo
- **Limitaciones:**
  - Máximo 4 emails por hora por usuario
  - Solo para desarrollo, no producción
  - Los emails pueden llegar a spam

#### Opción 2: Configurar SMTP Personalizado (Producción)

1. Ve a **Project Settings** → **Authentication**
2. Scroll hasta **SMTP Settings**
3. Habilita "Enable Custom SMTP"
4. Configura los siguientes valores:

**Ejemplos de proveedores:**

##### Gmail
```
Host: smtp.gmail.com
Port: 587
Username: tu-email@gmail.com
Password: tu-contraseña-de-aplicación
Sender email: tu-email@gmail.com
Sender name: Sistema de Gestión de Ventas
```

**⚠️ Importante para Gmail:**
- Necesitas crear una "Contraseña de aplicación" en tu cuenta de Google
- Ve a: Cuenta de Google → Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones

##### SendGrid
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: tu-api-key-de-sendgrid
Sender email: noreply@tudominio.com
Sender name: Sistema de Gestión de Ventas
```

##### Mailgun
```
Host: smtp.mailgun.org
Port: 587
Username: postmaster@tudominio.mailgun.org
Password: tu-password-de-mailgun
Sender email: noreply@tudominio.com
Sender name: Sistema de Gestión de Ventas
```

##### AWS SES
```
Host: email-smtp.us-east-1.amazonaws.com
Port: 587
Username: tu-smtp-username
Password: tu-smtp-password
Sender email: noreply@tudominio.com
Sender name: Sistema de Gestión de Ventas
```

---

## Configuración del Proyecto

### Variable de Entorno

El archivo `.env.local` debe contener:

```bash
# URL del sitio para recuperación de contraseña
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # En desarrollo
# NEXT_PUBLIC_SITE_URL=https://tudominio.com  # En producción
```

**Importante:**
- Esta variable se usa para generar el enlace de recuperación
- Debe coincidir con el dominio configurado en Supabase
- Cambiar según el ambiente (desarrollo/producción)

---

## Archivos del Sistema

### Server Actions
**Ubicación:** `src/app/(auth)/forgot-password/actions.ts`

Funciones:
- `sendPasswordResetEmail(email)` - Envía email de recuperación
- `resetPassword(newPassword)` - Actualiza la contraseña

### Páginas
1. **Solicitud de recuperación**
   - Ruta: `/forgot-password`
   - Archivo: `src/app/(auth)/forgot-password/page.tsx`
   - Componente: `src/components/auth/forgot-password-form.tsx`

2. **Reseteo de contraseña**
   - Ruta: `/reset-password`
   - Archivo: `src/app/(auth)/reset-password/page.tsx`
   - Componente: `src/components/auth/reset-password-form.tsx`

3. **Login actualizado**
   - Componente: `src/components/auth/login-form.tsx`
   - Incluye enlace "¿Olvidaste tu contraseña?"

---

## Validaciones Implementadas

### En el Frontend
1. Email debe ser válido (contener @)
2. Contraseña mínimo 6 caracteres
3. Confirmar contraseña debe coincidir
4. Deshabilitar botones durante proceso

### En el Backend
1. Validación de formato de email
2. Validación de longitud de contraseña (mínimo 6)
3. Manejo de errores de Supabase
4. Mensajes de error descriptivos

---

## Seguridad

### Tokens de Recuperación
- Los tokens son generados automáticamente por Supabase
- Expiran en **1 hora** por defecto
- Son de un solo uso (no se pueden reutilizar)
- Se invalidan automáticamente al usarse

### Rate Limiting
Supabase aplica límites automáticos:
- Máximo 4 emails por hora por usuario
- Protección contra fuerza bruta

### Privacidad
- El sistema no revela si un email existe o no
- Mensaje genérico: "Si el email existe, recibirás un enlace"
- Protege contra enumeración de usuarios

---

## Troubleshooting

### Los emails no llegan

**Posibles causas:**

1. **Email en spam**
   - Revisa la carpeta de spam/correo no deseado
   - Marca el remitente como confiable

2. **Rate limit excedido**
   - Espera 1 hora antes de solicitar otro email
   - Verifica en Supabase Dashboard → Authentication → Logs

3. **SMTP mal configurado**
   - Verifica credenciales en Supabase
   - Prueba las credenciales SMTP con otra herramienta
   - Revisa los logs de Supabase

4. **URL incorrecta**
   - Verifica que `NEXT_PUBLIC_SITE_URL` sea correcta
   - Debe coincidir con la configuración en Supabase

### El enlace no funciona

**Posibles causas:**

1. **Token expirado**
   - Los tokens duran 1 hora
   - Solicita un nuevo enlace

2. **Token ya usado**
   - Cada token solo se puede usar una vez
   - Solicita un nuevo enlace

3. **URL de redirección no autorizada**
   - Verifica que `/reset-password` esté en Redirect URLs de Supabase
   - Debe incluir el dominio completo

### Error al actualizar contraseña

**Posibles causas:**

1. **Contraseña muy corta**
   - Mínimo 6 caracteres
   - Supabase puede requerir más según configuración

2. **Sesión inválida**
   - El token puede haber expirado
   - Solicita un nuevo enlace

3. **Error de red**
   - Verifica conexión a internet
   - Revisa consola del navegador para errores

---

## Testing

### Prueba Manual

1. **Flujo completo:**
   ```bash
   1. Ve a http://localhost:3000/login
   2. Haz clic en "¿Olvidaste tu contraseña?"
   3. Ingresa un email registrado
   4. Revisa tu email
   5. Haz clic en el enlace del email
   6. Ingresa nueva contraseña
   7. Confirma que puedes iniciar sesión
   ```

2. **Casos de error:**
   - Email no registrado
   - Contraseñas que no coinciden
   - Contraseña muy corta
   - Token expirado
   - Token ya usado

### Logs de Supabase

Para ver logs de emails enviados:
1. Ve a Supabase Dashboard
2. **Authentication** → **Logs**
3. Filtra por tipo de evento: "password_recovery"

---

## Personalización Adicional

### Cambiar tiempo de expiración del token

Por defecto los tokens expiran en 1 hora. Para cambiar:

1. Ve a **Authentication** → **Providers** → **Email**
2. Busca "Reset token expiry"
3. Cambia el valor (en segundos)
   - 1 hora = 3600
   - 2 horas = 7200
   - 24 horas = 86400

### Cambiar diseño del email

Edita el template HTML en **Email Templates** con tu propio CSS inline:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #f8f9fa; padding: 20px; text-align: center;">
    <h1 style="color: #333;">Tu Logo</h1>
  </div>
  <div style="padding: 20px;">
    <!-- Contenido del email -->
  </div>
</div>
```

### Agregar logo al email

```html
<div style="text-align: center; margin-bottom: 20px;">
  <img src="https://tudominio.com/logo.png" alt="Logo" style="width: 150px;">
</div>
```

---

## Producción

### Checklist antes de ir a producción:

- [ ] Configurar SMTP personalizado (no usar email de Supabase)
- [ ] Actualizar `NEXT_PUBLIC_SITE_URL` con dominio de producción
- [ ] Agregar dominio de producción a Redirect URLs en Supabase
- [ ] Personalizar email template con branding de la empresa
- [ ] Probar flujo completo en ambiente de staging
- [ ] Verificar que emails no lleguen a spam
- [ ] Documentar proceso para usuarios finales
- [ ] Configurar monitoreo de emails fallidos

---

## Soporte y Mantenimiento

### Métricas a monitorear:
- Cantidad de solicitudes de recuperación
- Tasa de éxito de recuperaciones
- Emails fallidos/rebotados
- Tiempo de respuesta del SMTP

### Logs importantes:
- Supabase Dashboard → Authentication → Logs
- Filtrar por eventos de "password_recovery"
- Revisar errores de SMTP

---

## Referencias

- [Documentación oficial de Supabase Auth](https://supabase.com/docs/guides/auth/auth-password-reset)
- [Email Templates en Supabase](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)

---

**Última actualización:** 18 de noviembre de 2025
