# Configuración de Supabase para Recuperación de Contraseña

## ⚠️ IMPORTANTE: Configuración Requerida

Para que la recuperación de contraseña funcione correctamente, **DEBES** configurar lo siguiente en Supabase:

---

## Paso 1: Configurar Redirect URLs

### 1.1 Acceder a la configuración

1. Ve a tu **Dashboard de Supabase**: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Authentication** (en el menú lateral)
4. Haz clic en **URL Configuration**

### 1.2 Configurar Site URL

En el campo **Site URL**, ingresa:

**Para desarrollo:**
```
http://localhost:3000
```

**Para producción:**
```
https://tudominio.com
```

### 1.3 Configurar Redirect URLs

En el campo **Redirect URLs**, agrega las siguientes URLs (una por línea):

**Para desarrollo:**
```
http://localhost:3000/**
http://localhost:3000/reset-password
http://localhost:3000/auth/callback
```

**Para producción:**
```
https://tudominio.com/**
https://tudominio.com/reset-password
https://tudominio.com/auth/callback
```

**⚠️ IMPORTANTE:** El wildcard `/**` permite cualquier URL bajo tu dominio, lo cual es útil para desarrollo.

### 1.4 Guardar cambios

Haz clic en **Save** en la parte inferior de la página.

---

## Paso 2: Configurar Email Templates (Opcional pero Recomendado)

### 2.1 Acceder a Email Templates

1. En **Authentication**, haz clic en **Email Templates**
2. Selecciona **"Reset Password"** (Cambiar contraseña)

### 2.2 Personalizar el template en español

Reemplaza el contenido con este template en español:

```html
<h2>Recuperación de Contraseña</h2>

<p>Hola,</p>

<p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en el <strong>Sistema de Gestión de Ventas</strong>.</p>

<p>Si no solicitaste esto, puedes ignorar este email de forma segura. Tu contraseña no será cambiada.</p>

<p>Para restablecer tu contraseña, haz clic en el siguiente botón:</p>

<p>
  <a href="{{ .SiteURL }}/reset-password?code={{ .TokenHash }}"
     style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
    Restablecer Contraseña
  </a>
</p>

<p>O copia y pega este enlace en tu navegador:</p>
<p style="word-break: break-all; color: #6B7280; font-size: 14px;">
  {{ .SiteURL }}/reset-password?code={{ .TokenHash }}
</p>

<p><strong>Este enlace expirará en 1 hora por seguridad.</strong></p>

<hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">

<p style="color: #6B7280; font-size: 14px;">
  Si no solicitaste este cambio, alguien puede haber ingresado tu dirección de email por error.
  Tu cuenta permanece segura y no se realizará ningún cambio sin usar el enlace de arriba.
</p>

<p style="color: #6B7280; font-size: 14px;">
  Saludos,<br>
  <strong>Equipo de Sistema de Gestión de Ventas</strong>
</p>
```

### 2.3 Configurar el asunto del email

En el campo **Subject**, puedes usar:

```
Recuperación de Contraseña - Sistema de Gestión de Ventas
```

O simplemente:

```
Restablecer tu contraseña
```

### 2.4 Guardar el template

Haz clic en **Save** en la parte inferior.

---

## Paso 3: Verificar Configuración de Email Provider

### 3.1 Para Desarrollo (Usar Email de Supabase)

Por defecto, Supabase proporciona un servicio de email para desarrollo con limitaciones:
- ✅ No requiere configuración adicional
- ⚠️ Máximo 4 emails por hora por usuario
- ⚠️ Los emails pueden llegar a spam
- ❌ NO usar en producción

**No necesitas hacer nada adicional para desarrollo.**

### 3.2 Para Producción (Configurar SMTP)

**⚠️ OBLIGATORIO para producción:**

1. Ve a **Project Settings** (icono de engranaje en la parte inferior del menú lateral)
2. Selecciona **Authentication**
3. Scroll hasta **SMTP Settings**
4. Habilita **"Enable Custom SMTP"**

#### Configuración recomendada: Gmail (para pruebas)

```
Host: smtp.gmail.com
Port: 587
Username: tu-email@gmail.com
Password: [contraseña de aplicación]
Sender email: tu-email@gmail.com
Sender name: Sistema de Gestión de Ventas
```

**⚠️ Para Gmail:**
1. Necesitas habilitar "Verificación en 2 pasos" en tu cuenta de Google
2. Luego crear una "Contraseña de aplicación":
   - Ve a: https://myaccount.google.com/apppasswords
   - Crea una contraseña para "Mail"
   - Usa esa contraseña (no tu contraseña de Gmail)

#### Configuración recomendada: SendGrid (para producción)

SendGrid ofrece 100 emails gratis por día:

1. Crea una cuenta en: https://sendgrid.com
2. Ve a **Settings** → **API Keys**
3. Crea un nuevo API Key con permisos de "Mail Send"

```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: [tu-api-key-de-sendgrid]
Sender email: noreply@tudominio.com
Sender name: Sistema de Gestión de Ventas
```

**⚠️ IMPORTANTE:** Necesitas verificar tu dominio en SendGrid para evitar que los emails lleguen a spam.

---

## Paso 4: Configurar Tiempo de Expiración del Token (Opcional)

Por defecto, los enlaces de recuperación expiran en **1 hora** (3600 segundos).

Para cambiar esto:

1. Ve a **Authentication** → **Providers** → **Email**
2. Busca **"Reset token expiry"**
3. Cambia el valor en segundos:
   - 30 minutos = 1800
   - 1 hora = 3600 (por defecto)
   - 2 horas = 7200
   - 24 horas = 86400

**⚠️ Recomendación de seguridad:** No usar más de 1 hora en producción.

---

## Paso 5: Probar la Configuración

### 5.1 Verificar que todo esté configurado

Lista de verificación:
- [ ] Site URL configurado
- [ ] Redirect URLs configurado con `/reset-password`
- [ ] Email template personalizado (opcional)
- [ ] SMTP configurado (si es producción)

### 5.2 Prueba el flujo completo

1. Inicia tu aplicación:
   ```bash
   npm run dev
   ```

2. Ve a: http://localhost:3000/login

3. Haz clic en "¿Olvidaste tu contraseña?"

4. Ingresa un email registrado en tu sistema

5. Haz clic en "Enviar Enlace de Recuperación"

6. **Revisa tu email** (puede tardar 1-2 minutos)
   - ⚠️ Si no llega, revisa la carpeta de SPAM

7. **Haz clic en el enlace del email**

8. Deberías ser redirigido a `/reset-password`

9. Ingresa tu nueva contraseña

10. Haz clic en "Restablecer Contraseña"

11. Deberías ser redirigido a `/login`

12. Inicia sesión con tu nueva contraseña

---

## Troubleshooting (Solución de Problemas)

### Error: "El enlace de recuperación ha expirado o no es válido"

**Causas posibles:**

1. **Las Redirect URLs no están configuradas correctamente**
   - ✅ Solución: Verifica que `/reset-password` esté en la lista de Redirect URLs
   - ✅ Verifica que la Site URL sea correcta

2. **El enlace realmente expiró (pasó más de 1 hora)**
   - ✅ Solución: Solicita un nuevo enlace en `/forgot-password`

3. **El enlace ya fue usado**
   - ✅ Solución: Los enlaces son de un solo uso. Solicita uno nuevo.

4. **Error en el middleware**
   - ✅ Solución: Verifica que el archivo `src/lib/supabase/middleware.ts` contenga el código de `exchangeCodeForSession`

### Los emails no llegan

**Causas posibles:**

1. **Email en carpeta de spam**
   - ✅ Solución: Revisa spam/correo no deseado

2. **Rate limit excedido (más de 4 emails por hora)**
   - ✅ Solución: Espera 1 hora o configura SMTP personalizado

3. **SMTP mal configurado**
   - ✅ Solución: Verifica credenciales en Supabase
   - ✅ Verifica en **Authentication** → **Logs** si hay errores

4. **Email no registrado en el sistema**
   - ✅ Por seguridad, el sistema no revela si un email existe
   - ✅ Verifica que el usuario esté registrado

### El formulario muestra error inmediatamente

**Causa:**
- No hay una sesión válida (el usuario accedió directamente sin usar el enlace del email)

**Solución:**
- El usuario debe usar el enlace enviado por email
- No se puede acceder directamente a `/reset-password`

### Errores en consola del navegador

Si ves errores en la consola:

1. **"Invalid code or code expired"**
   - El código en el URL ya fue usado o expiró
   - Solicita un nuevo enlace

2. **"Invalid redirect URL"**
   - La URL de redirección no está autorizada en Supabase
   - Verifica Redirect URLs en Supabase

3. **"Network error"**
   - Problema de conexión con Supabase
   - Verifica variables de entorno (`.env.local`)

---

## Logs y Monitoreo

### Ver logs de emails en Supabase

1. Ve a **Authentication** → **Logs**
2. Filtra por:
   - Event type: `password_recovery`
   - Status: `success` o `failed`

### Ver logs de autenticación

1. Ve a **Authentication** → **Logs**
2. Filtra por:
   - Event type: `password_recovery`, `user_recovery`, `token_refreshed`

### Información útil en los logs:

- Timestamp del envío
- Email del destinatario
- Estado del email (enviado, fallido, rebotado)
- Errores de SMTP

---

## Seguridad y Mejores Prácticas

### ✅ Configuración Segura

1. **Tokens de un solo uso**
   - Los tokens se invalidan automáticamente al usarse
   - No se pueden reutilizar

2. **Expiración de tokens**
   - Mantener en 1 hora máximo
   - No usar más de 24 horas

3. **Rate limiting**
   - Supabase limita a 4 emails por hora por usuario
   - Protege contra abuso

4. **Mensajes genéricos**
   - No revelar si un email existe
   - Evita enumeración de usuarios

5. **HTTPS en producción**
   - Siempre usar `https://` en Site URL de producción
   - Nunca `http://` en producción

### ⚠️ NO hacer

1. ❌ Usar email de Supabase en producción
2. ❌ Deshabilitar expiración de tokens
3. ❌ Compartir enlaces de recuperación
4. ❌ Guardar contraseñas en texto plano
5. ❌ Revelar si un email existe en el sistema

---

## Checklist Final

Antes de considerar la configuración completa:

### Desarrollo
- [ ] Site URL = `http://localhost:3000`
- [ ] Redirect URLs incluye `http://localhost:3000/reset-password`
- [ ] Variable `NEXT_PUBLIC_SITE_URL` en `.env.local`
- [ ] Prueba exitosa del flujo completo
- [ ] Email recibido y enlace funciona

### Producción (Adicional)
- [ ] Site URL = `https://tudominio.com`
- [ ] Redirect URLs incluye `https://tudominio.com/reset-password`
- [ ] SMTP personalizado configurado
- [ ] Dominio verificado en proveedor SMTP
- [ ] Email template personalizado
- [ ] Pruebas en ambiente de staging
- [ ] Monitoreo de emails configurado
- [ ] Plan B en caso de fallo de SMTP

---

## Recursos Adicionales

- [Documentación oficial de Supabase Auth](https://supabase.com/docs/guides/auth)
- [Password Reset Documentation](https://supabase.com/docs/guides/auth/auth-password-reset)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)

---

**Fecha de actualización:** 18 de noviembre de 2025
