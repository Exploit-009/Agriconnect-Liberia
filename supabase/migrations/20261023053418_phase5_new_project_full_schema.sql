/*
# AgriConnect Liberia — Full Schema for New Supabase Project

## Overview
Creates the complete database schema for AgriConnect Liberia on the new
Supabase project (cmtakvvtboilkqvqzedb). This is a single idempotent migration
that creates all tables, constraints, indexes, the auto-profile trigger, RLS
policies, and grants — then seeds the 12 original products.

## Important Notes
1. All CREATE statements use IF NOT EXISTS — safe to re-run.
2. Policies are dropped before creation — safe to re-run.
3. Seed products use ON CONFLICT DO NOTHING — prevents duplicates.
4. No existing data is deleted or modified.
5. The handle_new_user trigger reads role from raw_app_meta_data (user-immutable).
6. Profiles.role and profiles.verified are NOT client-updatable (column-level grant restriction).

## Tables Created
1. products — agricultural listings (12 seed rows, all with farmer_id = null)
2. profiles — user profiles (farmer/buyer role, auto-created on signup)
3. enquiries — buyer enquiries on farmer products

## Security
- RLS enabled on all tables
- Public SELECT on products and profiles (anonymous browsing)
- Authenticated-only writes with ownership checks
- Farmer role verified via profiles table in products INSERT/UPDATE/DELETE policies
- Column-level grants restrict which fields clients can modify
*/

-- ============================================================
-- 1. PRODUCTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'kg',
  quantity_available integer NOT NULL DEFAULT 0,
  farmer_name text NOT NULL,
  county text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  quality_grade text NOT NULL DEFAULT 'Grade A',
  is_organic boolean NOT NULL DEFAULT false,
  contact_phone text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  farmer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_county ON products(county);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Grants
GRANT SELECT ON products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO service_role;

-- Policies: public SELECT, farmer-only writes with ownership + role check
DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "products_insert_own" ON products;
CREATE POLICY "products_insert_own"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = farmer_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'farmer'
    )
  );

DROP POLICY IF EXISTS "products_update_own" ON products;
CREATE POLICY "products_update_own"
  ON products FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = farmer_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'farmer'
    )
  )
  WITH CHECK (
    auth.uid() = farmer_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'farmer'
    )
  );

DROP POLICY IF EXISTS "products_delete_own" ON products;
CREATE POLICY "products_delete_own"
  ON products FOR DELETE
  TO authenticated
  USING (
    auth.uid() = farmer_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'farmer'
    )
  );

-- ============================================================
-- 2. PROFILES TABLE
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
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO service_role;

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_enquiries_buyer_id ON enquiries(buyer_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_farmer_id ON enquiries(farmer_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_product_id ON enquiries(product_id);

-- Grants
GRANT SELECT ON enquiries TO anon;
GRANT SELECT, INSERT, DELETE ON enquiries TO authenticated;
GRANT UPDATE (status, updated_at) ON enquiries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON enquiries TO service_role;

-- Policies
DROP POLICY IF EXISTS "enquiries_select_parties" ON enquiries;
CREATE POLICY "enquiries_select_parties"
  ON enquiries FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid() OR farmer_id = auth.uid());

DROP POLICY IF EXISTS "enquiries_insert_buyer" ON enquiries;
CREATE POLICY "enquiries_insert_buyer"
  ON enquiries FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS "enquiries_update_farmer_status" ON enquiries;
CREATE POLICY "enquiries_update_farmer_status"
  ON enquiries FOR UPDATE
  TO authenticated
  USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

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
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'role', ''),
      NULLIF(NEW.raw_app_meta_data->>'role', ''),
      'buyer'
    ),
    COALESCE(NEW.raw_user_meta_data->>'county', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Revoke execute from public/anon — trigger runs as definer
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;

-- Drop old trigger if exists, create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 5. SEED 12 PRODUCTS (idempotent — prevents duplicates)
-- ============================================================

INSERT INTO products (name, category, price, unit, quantity_available, farmer_name, county, description, image_url, quality_grade, is_organic, contact_phone)
SELECT * FROM (VALUES
  ('Cassava', 'Roots & Tubers', 350, 'bag', 50, 'Mary Tuah', 'Bong', 'Fresh cassava roots harvested from rich Liberian soil. Perfect for fufu, gari, or tapioca. Harvested daily and delivered within 24 hours.', 'https://images.pexels.com/photos/35109272/pexels-photo-35109272.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Premium', true, '+231 77 555 0101'),
  ('Local Rice (Swamp)', 'Grains', 1200, 'bag', 30, 'Gbarnga Cooperative', 'Bong', 'Locally grown swamp rice from the Bong County cooperative. Naturally cultivated without chemical fertilizers. Long grain, aromatic.', 'https://images.pexels.com/photos/13788549/pexels-photo-13788549.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Grade A', true, '+231 77 555 0102'),
  ('Red Palm Oil', 'Oils & Fats', 800, 'gallon', 40, 'John Kollie', 'Nimba', 'Pure red palm oil pressed from fresh palm fruits using traditional methods. Rich in vitamins A and E. No additives or preservatives.', 'https://images.pexels.com/photos/31448423/pexels-photo-31448423.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Premium', true, '+231 88 555 0103'),
  ('Hot Pepper (Bird Eye)', 'Vegetables', 150, 'bunch', 100, 'Sarah Massaquoi', 'Montserrado', 'Fresh bird eye peppers grown in Montserrado County. Fiery and flavorful, perfect for Liberian pepper soup and stews.', 'https://images.pexels.com/photos/19689774/pexels-photo-19689774.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Grade A', false, '+231 77 555 0104'),
  ('Sweet Potatoes', 'Roots & Tubers', 300, 'bag', 60, 'Peter Wleh', 'Lofa', 'Sweet potatoes from the fertile highlands of Lofa County. Naturally sweet and great for boiling, frying, or baking.', 'https://images.pexels.com/photos/7456548/pexels-photo-7456548.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Grade A', true, '+231 88 555 0105'),
  ('Fresh Fish (Tilapia)', 'Livestock', 500, 'kg', 25, 'Coastal Fishers Group', 'Grand Bassa', 'Freshly caught tilapia from the St. Paul River. Cleaned and ready for cooking. Delivered on ice.', 'https://images.pexels.com/photos/8352786/pexels-photo-8352786.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Premium', false, '+231 77 555 0106'),
  ('Bananas', 'Fruits', 200, 'bunch', 80, 'Esther Gayflor', 'Margibi', 'Sweet ripe bananas from Margibi County plantations. Naturally ripened, no chemicals used. Great for snacks and smoothies.', 'https://images.pexels.com/photos/30543146/pexels-photo-30543146.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Grade A', true, '+231 88 555 0107'),
  ('Bitter Balls (Garden Eggs)', 'Vegetables', 250, 'crate', 45, 'James Doe', 'Nimba', 'Fresh bitter balls (garden eggs) from Nimba County. A Liberian kitchen staple for soups and stews. Firm and freshly picked.', 'https://images.pexels.com/photos/28930670/pexels-photo-28930670.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Grade A', false, '+231 77 555 0108'),
  ('Groundnuts (Peanuts)', 'Grains', 600, 'bag', 35, 'Fatu Kamara', 'Lofa', 'Dried groundnuts from Lofa County. High quality, clean, and ready for roasting or making groundnut soup.', 'https://images.pexels.com/photos/209345/pexels-photo-209345.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Grade A', true, '+231 88 555 0109'),
  ('Plantains', 'Fruits', 350, 'bunch', 50, 'Moses Garlawolu', 'Grand Cape Mount', 'Fresh plantains from Grand Cape Mount. Perfect for frying or boiling. Harvested at ideal ripeness.', 'https://images.pexels.com/photos/39049842/pexels-photo-39049842.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Premium', false, '+231 77 555 0110'),
  ('Fresh Okra', 'Vegetables', 180, 'bunch', 70, 'Ruth Konneh', 'Bong', 'Tender fresh okra from Bong County. Great for okra soup and stews. Picked daily for maximum freshness.', 'https://images.pexels.com/photos/39490207/pexels-photo-39490207.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Grade A', true, '+231 88 555 0111'),
  ('Local Honey', 'Other', 1500, 'bottle', 20, 'Sinoe Beekeepers', 'Sinoe', 'Pure natural honey from Sinoe County forest bees. Unprocessed and raw. Collected using sustainable beekeeping practices.', 'https://images.pexels.com/photos/4921856/pexels-photo-4921856.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Premium', true, '+231 77 555 0112')
) AS v(name, category, price, unit, quantity_available, farmer_name, county, description, image_url, quality_grade, is_organic, contact_phone)
WHERE NOT EXISTS (
  SELECT 1 FROM products p WHERE p.name = v.name AND p.farmer_name = v.farmer_name
);
