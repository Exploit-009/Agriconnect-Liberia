/*
# Phase 2: Farmer profiles, buyer enquiries, auth roles, and least-privilege RLS

## Overview
Adds authentication-based user roles (farmer/buyer), farmer profile table,
buyer enquiry table, and a nullable farmer_id link on products. Replaces
the current fully-public RLS with least-privilege policies that preserve
anonymous browsing while restricting writes to authenticated owners.

## Preserving Existing Data
- The 12 seed products in `products` are NOT modified or deleted.
- The existing `farmer_name` text column stays for display.
- New `farmer_id` column is nullable — seed products keep `farmer_id = null`.
- No tables dropped, no columns removed, no data deleted.

## New Tables

### 1. `profiles`
- `id` (uuid, PK, references auth.users ON DELETE CASCADE)
- `email` (text, copied from auth.users at signup)
- `full_name` (text, display name)
- `role` (text, 'farmer' or 'buyer' — set once at signup, NOT user-editable)
- `county` (text, optional)
- `phone` (text, optional)
- `bio` (text, optional)
- `avatar_url` (text, optional)
- `verified` (boolean, default false — admin-only, not user-editable)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### 2. `enquiries`
- `id` (uuid, PK, default gen_random_uuid())
- `product_id` (uuid, FK to products ON DELETE CASCADE)
- `buyer_id` (uuid, FK to auth.users ON DELETE CASCADE)
- `farmer_id` (uuid, FK to auth.users ON DELETE SET NULL)
- `message` (text, buyer's enquiry message)
- `quantity_requested` (text, e.g. "5 bags")
- `status` (text, 'pending' | 'contacted' | 'closed', default 'pending')
- `contact_phone` (text, buyer's phone for farmer to call back)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

## Modified Tables
### `products`
- Added `farmer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL` (nullable)
- Existing seed rows keep `farmer_id = null`

## Security: RLS Policies

### `profiles`
- SELECT: public (anon + authenticated) — anyone can view farmer profiles
- INSERT: none via client (profiles created by trigger only)
- UPDATE: owner only (auth.uid() = id), and only on allowed columns (full_name, county, phone, bio, avatar_url)
  — role and verified are NOT client-updatable
- DELETE: owner only

### `products`
- SELECT: public (anon + authenticated) — browsing preserved
- INSERT: authenticated only, must own (auth.uid() = farmer_id)
- UPDATE: authenticated only, must own (auth.uid() = farmer_id)
- DELETE: authenticated only, must own (auth.uid() = farmer_id)

### `enquiries`
- SELECT: authenticated only — buyer sees own enquiries (buyer_id = auth.uid()),
  farmer sees enquiries on their products (farmer_id = auth.uid())
- INSERT: authenticated only — buyer_id must equal auth.uid()
- UPDATE: authenticated only — farmer can update only status field, only on enquiries where farmer_id = auth.uid()
- DELETE: authenticated only — buyer can delete own enquiries (buyer_id = auth.uid())

## Column-Level Security
- `profiles.role` and `profiles.verified` are NOT grantable for UPDATE to clients.
  UPDATE grant is restricted to (full_name, county, phone, bio, avatar_url, updated_at).
- `enquiries.status` is the only column farmers can UPDATE.
  UPDATE grant on enquiries restricted to (status, updated_at).

## Functions
- `handle_new_user()`: SECURITY DEFINER trigger function that auto-creates a profile
  row when a new user signs up. Reads role from raw_app_meta_data. Safe to retry
  (uses INSERT ... ON CONFLICT DO NOTHING).

## Role Assignment
- Roles are stored in auth.users.raw_app_meta_data (user-immutable via client).
- The frontend passes role as a signUp option; Supabase stores it in app metadata.
- The trigger reads it and writes it to profiles.role — clients cannot change it.
*/

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'buyer' CHECK (role IN ('farmer', 'buyer')),
  county text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  avatar_url text NOT NULL DEFAULT '',
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Grants: SELECT to all, UPDATE only on safe columns, DELETE to authenticated
GRANT SELECT ON profiles TO anon, authenticated;
GRANT UPDATE (full_name, county, phone, bio, avatar_url, updated_at) ON profiles TO authenticated;
GRANT DELETE ON profiles TO authenticated;

-- Policies
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================================
-- 2. ADD farmer_id TO products (nullable, non-destructive)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'farmer_id'
  ) THEN
    ALTER TABLE products ADD COLUMN farmer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Grant service_role on products (for potential edge functions)
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO service_role;

-- Replace products RLS policies: keep public SELECT, restrict writes to owners

-- Drop old fully-public policies
DROP POLICY IF EXISTS "anon_insert_products" ON products;
DROP POLICY IF EXISTS "anon_update_products" ON products;
DROP POLICY IF EXISTS "anon_delete_products" ON products;

-- Keep public SELECT (browsing preserved for anonymous visitors)
-- (anon_select_products already exists and stays)

-- New INSERT: authenticated, must own
DROP POLICY IF EXISTS "products_insert_own" ON products;
CREATE POLICY "products_insert_own"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = farmer_id);

-- New UPDATE: authenticated, must own
DROP POLICY IF EXISTS "products_update_own" ON products;
CREATE POLICY "products_update_own"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = farmer_id)
  WITH CHECK (auth.uid() = farmer_id);

-- New DELETE: authenticated, must own
DROP POLICY IF EXISTS "products_delete_own" ON products;
CREATE POLICY "products_delete_own"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = farmer_id);

-- Restrict products UPDATE grant to authenticated only (remove anon UPDATE)
-- Revoke all from anon, re-grant SELECT only
REVOKE INSERT, UPDATE, DELETE ON products FROM anon;
REVOKE INSERT, UPDATE, DELETE ON products FROM authenticated;
GRANT SELECT ON products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON products TO authenticated;

-- ============================================================
-- 3. ENQUIRIES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  message text NOT NULL DEFAULT '',
  quantity_requested text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed')),
  contact_phone text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Grants: SELECT/INSERT/UPDATE/DELETE to authenticated only
GRANT SELECT, INSERT, UPDATE (status, updated_at), DELETE ON enquiries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON enquiries TO service_role;

-- SELECT: buyer sees own, farmer sees enquiries on their products
DROP POLICY IF EXISTS "enquiries_select_parties" ON enquiries;
CREATE POLICY "enquiries_select_parties"
  ON enquiries FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid() OR farmer_id = auth.uid());

-- INSERT: buyer creates own enquiry, buyer_id must be self
DROP POLICY IF EXISTS "enquiries_insert_buyer" ON enquiries;
CREATE POLICY "enquiries_insert_buyer"
  ON enquiries FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

-- UPDATE: farmer updates status on enquiries for their products
DROP POLICY IF EXISTS "enquiries_update_farmer_status" ON enquiries;
CREATE POLICY "enquiries_update_farmer_status"
  ON enquiries FOR UPDATE
  TO authenticated
  USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

-- DELETE: buyer deletes own enquiry
DROP POLICY IF EXISTS "enquiries_delete_buyer" ON enquiries;
CREATE POLICY "enquiries_delete_buyer"
  ON enquiries FOR DELETE
  TO authenticated
  USING (buyer_id = auth.uid());

-- ============================================================
-- 4. AUTO-CREATE PROFILE ON SIGNUP (SECURITY DEFINER trigger)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, county, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_app_meta_data->>'role', 'buyer'),
    COALESCE(NEW.raw_user_meta_data->>'county', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Revoke execute from public/anon, grant to postgres (trigger runs as definer)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;

-- Drop old trigger if exists, create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 5. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_enquiries_buyer_id ON enquiries(buyer_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_farmer_id ON enquiries(farmer_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_product_id ON enquiries(product_id);
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);
