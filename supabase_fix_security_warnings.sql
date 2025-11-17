-- ====================================
-- FIX SUPABASE SECURITY WARNINGS
-- This script fixes the Database Linter warnings
-- ====================================

-- ====================================
-- 1. Fix: Function Search Path Mutable
-- ====================================
-- This prevents SQL injection attacks by setting a fixed search_path

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'contador',
    true
  );
  RETURN NEW;
END;
$$;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$;

-- Fix is_user_active function
CREATE OR REPLACE FUNCTION public.is_user_active()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT is_active = true
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$;

-- ====================================
-- RESULTS
-- ====================================
-- ✓ All functions now have fixed search_path = public
-- ✓ This prevents SQL injection via search path manipulation
-- ====================================

SELECT 'Security warnings fixed! ✓' as status;
