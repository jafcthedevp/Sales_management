# 🔧 Diagnóstico del Problema: Perfil No Se Crea

## El Problema

✅ Usuario se crea correctamente en `auth.users`
❌ Perfil NO se crea en `public.profiles`
❌ Error: "Error al crear el perfil del usuario"

---

## Causa Probable

El **trigger de base de datos** `on_auth_user_created` que debería crear automáticamente el perfil no está funcionando.

Posibles razones:
1. El trigger no existe o no se ejecutó el script SQL
2. El trigger tiene un error de sintaxis
3. Problemas de permisos entre `auth.users` y `public.profiles`
4. El trigger se ejecuta pero falla silenciosamente

---

## ✅ SOLUCIÓN PASO A PASO

### Paso 1: Verifica si ejecutaste el script SQL completo

Ve a tu proyecto de Supabase:
```
https://gqrmlzryozcysvwxtlbm.supabase.co/project/_/sql
```

Abre el **SQL Editor** y ejecuta esta consulta para verificar si el trigger existe:

```sql
-- Verificar si el trigger existe
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**Resultado esperado:** Debería mostrar 1 fila con el trigger

**Si NO muestra nada:** El trigger no existe, ve al Paso 2

---

### Paso 2: Ejecuta el script completo de creación de tablas

Ve al **SQL Editor** en Supabase y ejecuta TODO el contenido del archivo `supabase_setup_tables.sql`

**IMPORTANTE:** Asegúrate de ejecutar TODO el script, especialmente las líneas 160-178 que crean el trigger:

```sql
-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

### Paso 3: Verifica los permisos del trigger

Ejecuta esto en el SQL Editor:

```sql
-- Dar permisos necesarios
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
```

---

### Paso 4: Elimina el usuario problemático y prueba de nuevo

1. Ve a **Authentication > Users**
2. Busca: `flores.anthony.489@gmail.com`
3. Elimínalo (clic en los 3 puntos `...` > Delete user)

4. También elimina el registro huérfano en profiles (si existe):
   - Ve a **Table Editor > profiles**
   - Busca el registro con el email `flores.anthony.489@gmail.com`
   - Elimínalo si existe

---

### Paso 5: Prueba el script de verificación

He creado un script que puedes ejecutar manualmente en el SQL Editor de Supabase para crear el perfil manualmente:

```sql
-- 1. Primero, encuentra el UUID del usuario
SELECT id, email, raw_user_meta_data
FROM auth.users
WHERE email = 'flores.anthony.489@gmail.com';

-- 2. Copia el UUID y úsalo aquí (reemplaza 'USUARIO-UUID-AQUI')
INSERT INTO public.profiles (id, email, full_name, role, is_active)
VALUES (
  'USUARIO-UUID-AQUI'::uuid,
  'flores.anthony.489@gmail.com',
  'Anthony Flores',
  'contador',
  true
)
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- 3. Verifica que se creó
SELECT * FROM public.profiles WHERE email = 'flores.anthony.489@gmail.com';
```

---

### Paso 6: Solución alternativa - Modificar el código de registro

Si el trigger sigue sin funcionar, podemos modificar el código para crear el perfil manualmente.

Edita: `src/app/(auth)/register/actions.ts`

Encuentra las líneas 73-85 y reemplázalas con:

```typescript
  // Intentar obtener el perfil (el trigger debería haberlo creado)
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  // Si el perfil no existe, créalo manualmente
  if (profileError || !profile) {
    console.log('Trigger no funcionó, creando perfil manualmente...')

    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        role: 'contador',
        is_active: true,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error al crear perfil manualmente:', createError)
      return {
        error: 'Error al crear el perfil del usuario: ' + createError.message,
      }
    }

    profile = newProfile
  }

  if (!profile) {
    return {
      error: 'Error al crear el perfil del usuario',
    }
  }
```

---

## 🔍 Diagnóstico Rápido

Ejecuta esto en el **SQL Editor** de Supabase para ver el estado actual:

```sql
-- Estado completo del sistema
SELECT
  'Usuarios registrados' as tipo,
  COUNT(*) as cantidad
FROM auth.users
UNION ALL
SELECT
  'Perfiles creados',
  COUNT(*)
FROM public.profiles
UNION ALL
SELECT
  'Usuarios sin perfil',
  COUNT(*)
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Ver usuarios sin perfil
SELECT
  u.id,
  u.email,
  u.created_at as usuario_creado,
  p.id as perfil_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Verificar trigger
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

---

## 📊 Interpretación de Resultados

### Si "Usuarios sin perfil" > 0:
El trigger NO está funcionando. Opciones:
1. Ejecutar el script de creación del trigger (Paso 2)
2. Crear los perfiles manualmente (Paso 5)
3. Modificar el código (Paso 6)

### Si el trigger NO aparece:
El script SQL no se ejecutó completamente. Vuelve a ejecutar `supabase_setup_tables.sql` completo.

### Si el trigger SÍ aparece pero no funciona:
Hay un problema de permisos. Ejecuta los comandos del Paso 3.

---

## 🎯 Recomendación Inmediata

**Opción más rápida:**

1. Ve al SQL Editor de Supabase
2. Ejecuta este script todo junto:

```sql
-- Recrear el trigger completo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    'contador',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Crear perfiles para usuarios existentes sin perfil
INSERT INTO public.profiles (id, email, full_name, role, is_active)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Usuario'),
  'contador',
  true
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verificar
SELECT 'Trigger creado' as status
WHERE EXISTS (
  SELECT 1 FROM information_schema.triggers
  WHERE trigger_name = 'on_auth_user_created'
);

SELECT
  'auth.users' as tabla,
  COUNT(*) as total
FROM auth.users
UNION ALL
SELECT
  'public.profiles',
  COUNT(*)
FROM public.profiles;
```

3. Elimina el usuario actual en Authentication > Users
4. Regístrate de nuevo en http://localhost:3000/register

**Avísame qué resultado obtienes y continuamos desde ahí.**
