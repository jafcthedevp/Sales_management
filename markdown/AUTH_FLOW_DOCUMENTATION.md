# Authentication System - Complete Guide

## 📋 Table of Contents
1. [Login Flow](#login-flow)
2. [Register Flow](#register-flow)
3. [Technical Architecture](#technical-architecture)
4. [How to Use](#how-to-use)
5. [Security Features](#security-features)
6. [Troubleshooting](#troubleshooting)

---

## 🔑 Login Flow

### Visual Flow Diagram

```
User visits website
       ↓
   Page.tsx (/)
       ↓
   Checks auth with getOptionalUser()
       ↓
   ┌─────────────┬─────────────┐
   │             │             │
Not Auth      Authenticated   │
   ↓             ↓             │
/login      /dashboard        │
   ↓                           │
Login Form                     │
   ↓                           │
User enters credentials        │
   ↓                           │
Form submits to Server Action  │
   ↓                           │
login() action runs            │
   ↓                           │
Validates with Zod             │
   ↓                           │
Calls Supabase Auth            │
   ↓                           │
Checks profile & is_active     │
   ↓                           │
Creates session cookie         │
   ↓                           │
Redirects to /dashboard ───────┘
```

### Step-by-Step Login Process

#### 1. **User Visits Login Page** (`/login`)

**File**: `src/app/(auth)/login/page.tsx`

```typescript
export default async function LoginPage() {
  // Check if already logged in
  const user = await getOptionalUser()
  if (user) {
    redirect('/dashboard') // Already logged in, go to dashboard
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
```

**What happens**:
- Server Component checks if user is already authenticated
- If yes → redirect to dashboard
- If no → show login form

---

#### 2. **User Fills Out Login Form**

**File**: `src/components/auth/login-form.tsx`

```typescript
export function LoginForm() {
  // useActionState is React 19's new hook for server actions
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <form action={formAction}>
      {state.error && <div>Error: {state.error}</div>}

      <Input name="email" type="email" />
      <Input name="password" type="password" />

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>
    </form>
  )
}
```

**What happens**:
- Client Component renders form
- `useActionState` connects to server action
- Shows loading state while processing
- Displays errors if any

---

#### 3. **Form Submits to Server Action**

**File**: `src/app/(auth)/login/actions.ts`

```typescript
export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {

  // STEP 1: Validate input with Zod
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.issues[0].message,
    }
  }

  const { email, password } = validatedFields.data

  // STEP 2: Get Supabase client
  const supabase = await createClient()

  // STEP 3: Attempt login with Supabase Auth
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: 'Credenciales inválidas. Por favor verifica tu email y contraseña.',
    }
  }

  // STEP 4: Verify user has profile and is active
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', user.id)
      .single<{ is_active: boolean }>()

    if (profileError || !profile?.is_active) {
      await supabase.auth.signOut()
      return {
        error: 'Tu cuenta está inactiva. Contacta al administrador.',
      }
    }
  }

  // STEP 5: Success! Redirect to dashboard
  redirect('/dashboard')
}
```

**What happens**:
1. **Validation**: Checks email format and password length with Zod
2. **Authentication**: Calls Supabase Auth with credentials
3. **Database Check**: Verifies user has a profile and is active
4. **Session Creation**: Supabase automatically creates JWT token and cookies
5. **Redirect**: Sends user to dashboard

---

#### 4. **Middleware Refreshes Session**

**File**: `src/middleware.ts`

```typescript
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...)

  // Refresh the session if expired
  await supabase.auth.getUser()

  return response
}
```

**What happens**:
- Runs on EVERY request
- Automatically refreshes JWT tokens if needed
- Keeps user logged in seamlessly

---

#### 5. **Protected Pages Use DAL**

**File**: `src/lib/dal.ts`

```typescript
export const verifySession = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login') // Not logged in, go to login
  }

  return { user }
})

export const getUserProfile = cache(async (): Promise<Profile> => {
  const { user } = await verifySession()

  // Get full profile from database
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (!profile?.is_active) {
    redirect('/cuenta-inactiva')
  }

  return profile
})
```

**What happens**:
- Every protected page calls `getUserProfile()`
- Verifies JWT token is valid
- Fetches user data from database
- Checks if account is active
- Uses React `cache()` to avoid duplicate queries

---

## 📝 Register Flow

### Visual Flow Diagram

```
User clicks "Regístrate"
       ↓
   /register page
       ↓
   Register Form
       ↓
User fills out:
 - Email
 - Password
 - Confirm Password
 - Full Name
       ↓
Form submits to Server Action
       ↓
register() action runs
       ↓
Validates with Zod
       ↓
Calls Supabase Auth signUp()
       ↓
Supabase creates user in auth.users
       ↓
Database Trigger automatically creates
profile in public.profiles table
       ↓
Shows success message
       ↓
User can now login
```

### Step-by-Step Register Process

#### 1. **User Visits Register Page** (`/register`)

**File**: `src/app/(auth)/register/page.tsx`

```typescript
export default async function RegisterPage() {
  // Check if already logged in
  const user = await getOptionalUser()
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <RegisterForm />
    </div>
  )
}
```

---

#### 2. **User Fills Out Register Form**

**File**: `src/components/auth/register-form.tsx`

```typescript
export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(register, initialState)

  return (
    <form action={formAction}>
      {state.error && <Alert>{state.error}</Alert>}
      {state.success && <Alert>¡Cuenta creada! Ya puedes iniciar sesión.</Alert>}

      <Input name="fullName" placeholder="Juan Pérez" />
      <Input name="email" type="email" />
      <Input name="password" type="password" />
      <Input name="confirmPassword" type="password" />

      <Button type="submit">Crear cuenta</Button>
    </form>
  )
}
```

---

#### 3. **Form Submits to Server Action**

**File**: `src/app/(auth)/register/actions.ts`

```typescript
export async function register(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {

  // STEP 1: Validate input
  const validatedFields = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    fullName: formData.get('fullName'),
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.issues[0].message,
    }
  }

  const { email, password, fullName } = validatedFields.data

  // STEP 2: Create user in Supabase Auth
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName, // Stored in auth.users metadata
      },
    },
  })

  if (error) {
    return {
      error: error.message || 'Error al crear el usuario',
    }
  }

  // STEP 3: Verify profile was created by database trigger
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (!profile) {
    return {
      error: 'Error al crear el perfil del usuario',
    }
  }

  // STEP 4: Success!
  return {
    success: true,
    message: 'Usuario creado exitosamente. Ya puedes iniciar sesión.',
  }
}
```

---

#### 4. **Database Trigger Creates Profile**

**SQL**: `supabase_setup_tables.sql`

```sql
-- Function to create profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'contador' -- Default role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that runs when new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**What happens**:
- When Supabase creates user in `auth.users`
- Trigger automatically fires
- Creates corresponding record in `public.profiles`
- Sets default role to 'contador'
- Copies email and full_name

---

## 🏗️ Technical Architecture

### Database Structure

```
┌─────────────────────────────┐
│     auth.users (Supabase)   │
│  ┌──────────────────────┐   │
│  │ id (UUID)            │   │
│  │ email                │   │
│  │ encrypted_password   │   │
│  │ raw_user_meta_data   │   │
│  │ created_at           │   │
│  └──────────────────────┘   │
└──────────────┬──────────────┘
               │
               │ Trigger creates profile
               ↓
┌─────────────────────────────┐
│   public.profiles (Custom)  │
│  ┌──────────────────────┐   │
│  │ id (FK → auth.users) │   │
│  │ email                │   │
│  │ full_name            │   │
│  │ role (admin/contador)│   │
│  │ is_active (boolean)  │   │
│  │ created_at           │   │
│  │ updated_at           │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
```

### Authentication Tokens

**Supabase uses JWT (JSON Web Tokens)**:

1. **Access Token** (Short-lived, ~1 hour)
   - Stored in HTTP-only cookie
   - Contains user ID and metadata
   - Validated on every request

2. **Refresh Token** (Long-lived, ~7 days)
   - Used to get new access token
   - Automatically handled by middleware

**Cookie Storage**:
```
Cookies set by Supabase:
- sb-<project>-auth-token (access token)
- sb-<project>-auth-token-code-verifier
```

---

## 🎯 How to Use

### For Development Testing

#### Option 1: Register a New User

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Visit: `http://localhost:3000/register`

3. Fill out the form:
   - **Full Name**: "Admin User"
   - **Email**: "admin@example.com"
   - **Password**: "password123"
   - **Confirm Password**: "password123"

4. Click "Crear cuenta"

5. You should see: "Usuario creado exitosamente"

6. Click "Inicia sesión" link

7. Login with the credentials

#### Option 2: Create User Directly in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add user**
4. Enter email and password
5. Click **Create user**
6. Go to **Table Editor** → `profiles`
7. Find the user and set `role = 'admin'` and `is_active = true`

#### Option 3: Use SQL to Create Admin User

```sql
-- First, create the auth user in Supabase Dashboard
-- Then run this SQL to make them admin:

UPDATE public.profiles
SET role = 'admin', is_active = true
WHERE email = 'admin@example.com';
```

---

### Testing the Login Flow

1. **Visit** `http://localhost:3000`
   - Should redirect to `/login` (not authenticated)

2. **Enter credentials** and submit

3. **Check what happens**:
   - ✅ Success → Redirects to `/dashboard`
   - ❌ Wrong password → Shows error message
   - ❌ Inactive account → Shows "cuenta inactiva" message

4. **Access protected pages**:
   - Visit `/dashboard` - Should work
   - Visit `/ventas` - Should work
   - Logout and try again - Should redirect to login

---

## 🔒 Security Features

### 1. **Row Level Security (RLS)**

**File**: `supabase_setup_rls.sql`

```sql
-- Only authenticated users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Only admins can update other users
CREATE POLICY "Admins can update profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

### 2. **Password Security**

- Passwords are **never stored in plain text**
- Supabase uses **bcrypt** for hashing
- Minimum 6 characters enforced (can increase)
- No password in responses or logs

### 3. **Session Security**

- **HTTP-only cookies** (JavaScript can't access)
- **Secure flag** in production (HTTPS only)
- **SameSite** attribute prevents CSRF
- **Auto-refresh** before expiration

### 4. **Input Validation**

**Zod Schema** validates all inputs:

```typescript
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
```

### 5. **Protection Layers**

```
Request Flow:
1. Middleware → Validates JWT token
2. Server Component → Calls DAL
3. DAL → Verifies session + profile
4. RLS → Database-level security
5. Response → Only authorized data
```

---

## 🐛 Troubleshooting

### Issue: "Can't login, always redirects back to login page"

**Causes**:
1. Supabase credentials not configured
2. User doesn't exist in database
3. User `is_active = false`

**Solution**:
```bash
# Check .env.local exists and has:
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Check user exists in Supabase Dashboard
# Check profiles table has the user with is_active = true
```

---

### Issue: "Profile not found" after registration

**Cause**: Database trigger didn't fire

**Solution**:
```sql
-- Manually create profile
INSERT INTO public.profiles (id, email, full_name, role, is_active)
VALUES (
  'user-uuid-from-auth-users',
  'email@example.com',
  'Full Name',
  'contador',
  true
);
```

---

### Issue: "Session expired" messages

**Cause**: Refresh token expired (after 7 days of inactivity)

**Solution**: Just login again. This is normal behavior.

---

### Issue: Can't access dashboard after login

**Cause**: DAL might be redirecting due to inactive account

**Solution**:
```sql
-- Check user status
SELECT id, email, role, is_active
FROM public.profiles
WHERE email = 'your@email.com';

-- Activate if needed
UPDATE public.profiles
SET is_active = true
WHERE email = 'your@email.com';
```

---

## 📊 Authentication State Flow

```typescript
// How to check auth state anywhere in your app:

// In Server Components:
import { getUserProfile } from '@/lib/dal'

export default async function MyPage() {
  const profile = await getUserProfile() // Auto-redirects if not logged in

  return <div>Welcome, {profile.full_name}!</div>
}

// Optional auth (won't redirect):
import { getOptionalUser } from '@/lib/dal'

export default async function HomePage() {
  const user = await getOptionalUser()

  if (user) {
    // Show logged-in content
  } else {
    // Show public content
  }
}
```

---

## 🔄 Logout Flow

**File**: `src/components/layout/dashboard-header.tsx`

```typescript
import { logout } from '@/app/(auth)/login/actions'

<form action={logout}>
  <Button type="submit">
    Cerrar Sesión
  </Button>
</form>
```

**What happens**:
1. Calls `logout()` server action
2. `supabase.auth.signOut()` invalidates session
3. Clears all cookies
4. Redirects to `/login`

---

## 🎓 Summary

**Login Process**:
1. User enters email + password
2. Zod validates input
3. Supabase Auth verifies credentials
4. Check profile exists and is_active
5. Create session (JWT + cookies)
6. Redirect to dashboard

**Register Process**:
1. User enters full name, email, password
2. Zod validates (including password confirmation)
3. Supabase creates user in auth.users
4. Database trigger creates profile in public.profiles
5. Show success message
6. User can login

**Security**:
- JWT tokens in HTTP-only cookies
- Bcrypt password hashing
- Row Level Security on database
- Server-side validation
- Middleware token refresh

---

**Ready to test!** Try creating a user and logging in! 🚀
