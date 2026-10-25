/*
# Create products table for AgriConnect Liberia marketplace

## Overview
Creates the core `products` table for an agricultural marketplace connecting 
Liberian farmers with buyers. This is a single-tenant prototype (no auth) — 
all data is intentionally public/shared so the anon-key frontend can read and write.

## New Tables
- `products`
  - `id` (uuid, primary key)
  - `name` (text, product name e.g. "Cassava", "Rice")
  - `category` (text, e.g. "Grains", "Vegetables", "Fruits", "Roots & Tubers", "Livestock", "Spices")
  - `price` (numeric, price in Liberian Dollars per unit)
  - `unit` (text, e.g. "bag", "kg", "bunch", "crate")
  - `quantity_available` (integer, how many units available)
  - `farmer_name` (text, name of the farmer or farm)
  - `county` (text, Liberian county where the farm is located)
  - `description` (text, product description)
  - `image_url` (text, URL to product image)
  - `quality_grade` (text, e.g. "Premium", "Grade A", "Grade B")
  - `is_organic` (boolean, whether product is organically grown)
  - `contact_phone` (text, phone number to reach the farmer)
  - `created_at` (timestamptz, when listing was created)
  - `updated_at` (timestamptz, when listing was last updated)

## Security
- RLS enabled on `products`.
- CRUD granted to `anon` + `authenticated` (single-tenant, no-auth app — data is intentionally public).
- Four separate policies (SELECT, INSERT, UPDATE, DELETE) all using `USING (true)` / `WITH CHECK (true)` 
  because this is a shared/public prototype with no user isolation.

## Seed Data
- Inserts ~12 sample products representing diverse Liberian agricultural products 
  across multiple counties (Montserrado, Nimba, Bong, Lofa, Grand Bassa, Margibi, etc.)
  with realistic pricing in Liberian Dollars (LRD).
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
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
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON products TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

-- Seed data: Liberian agricultural products
INSERT INTO products (name, category, price, unit, quantity_available, farmer_name, county, description, image_url, quality_grade, is_organic, contact_phone) VALUES
('Cassava', 'Roots & Tubers', 350, 'bag', 50, 'Mary Tuah', 'Bong', 'Fresh cassava roots harvested from rich Liberian soil. Perfect for fufu, gari, or tapioca. Harvested daily and delivered within 24 hours.', 'https://images.pexels.com/photos/2288551/pexels-photo-2288551.jpeg', 'Premium', true, '+231 77 555 0101'),
('Local Rice (Swamp)', 'Grains', 1200, 'bag', 30, 'Gbarnga Cooperative', 'Bong', 'Locally grown swamp rice from the Bong County cooperative. Naturally cultivated without chemical fertilizers. Long grain, aromatic.', 'https://images.pexels.com/photos/7421223/pexels-photo-7421223.jpeg', 'Grade A', true, '+231 77 555 0102'),
('Red Palm Oil', 'Oils & Fats', 800, 'gallon', 40, 'John Kollie', 'Nimba', 'Pure red palm oil pressed from fresh palm fruits using traditional methods. Rich in vitamins A and E. No additives or preservatives.', 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg', 'Premium', true, '+231 88 555 0103'),
('Hot Pepper (Bird Eye)', 'Vegetables', 150, 'bunch', 100, 'Sarah Massaquoi', 'Montserrado', 'Fresh bird eye peppers grown in Montserrado County. Fiery and flavorful, perfect for Liberian pepper soup and stews.', 'https://images.pexels.com/photos/2288551/pexels-photo-2288551.jpeg', 'Grade A', false, '+231 77 555 0104'),
('Sweet Potatoes', 'Roots & Tubers', 300, 'bag', 60, 'Peter Wleh', 'Lofa', 'Sweet potatoes from the fertile highlands of Lofa County. Naturally sweet and great for boiling, frying, or baking.', 'https://images.pexels.com/photos/2288551/pexels-photo-2288551.jpeg', 'Grade A', true, '+231 88 555 0105'),
('Fresh Fish (Tilapia)', 'Livestock', 500, 'kg', 25, 'Coastal Fishers Group', 'Grand Bassa', 'Freshly caught tilapia from the St. Paul River. Cleaned and ready for cooking. Delivered on ice.', 'https://images.pexels.com/photos/2288551/pexels-photo-2288551.jpeg', 'Premium', false, '+231 77 555 0106'),
('Bananas', 'Fruits', 200, 'bunch', 80, 'Esther Gayflor', 'Margibi', 'Sweet ripe bananas from Margibi County plantations. Naturally ripened, no chemicals used. Great for snacks and smoothies.', 'https://images.pexels.com/photos/2288551/pexels-photo-2288551.jpeg', 'Grade A', true, '+231 88 555 0107'),
('Bitter Balls (Garden Eggs)', 'Vegetables', 250, 'crate', 45, 'James Doe', 'Nimba', 'Fresh bitter balls (garden eggs) from Nimba County. A Liberian kitchen staple for soups and stews. Firm and freshly picked.', 'https://images.pexels.com/photos/2288551/pexels-photo-2288551.jpeg', 'Grade A', false, '+231 77 555 0108'),
('Groundnuts (Peanuts)', 'Grains', 600, 'bag', 35, 'Fatu Kamara', 'Lofa', 'Dried groundnuts from Lofa County. High quality, clean, and ready for roasting or making groundnut soup.', 'https://images.pexels.com/photos/2288551/pexels-photo-2288551.jpeg', 'Grade A', true, '+231 88 555 0109'),
('Plantains', 'Fruits', 350, 'bunch', 50, 'Moses Garlawolu', 'Grand Cape Mount', 'Fresh plantains from Grand Cape Mount. Perfect for frying or boiling. Harvested at ideal ripeness.', 'https://images.pexels.com/photos/2288551/pexels-photo-2288551.jpeg', 'Premium', false, '+231 77 555 0110'),
('Fresh Okra', 'Vegetables', 180, 'bunch', 70, 'Ruth Konneh', 'Bong', 'Tender fresh okra from Bong County. Great for okra soup and stews. Picked daily for maximum freshness.', 'https://images.pexels.com/photos/2288551/pexels-photo-2288551.jpeg', 'Grade A', true, '+231 88 555 0111'),
('Local Honey', 'Other', 1500, 'bottle', 20, 'Sinoe Beekeepers', 'Sinoe', 'Pure natural honey from Sinoe County forest bees. Unprocessed and raw. Collected using sustainable beekeeping practices.', 'https://images.pexels.com/photos/2288551/pexels-photo-2288551.jpeg', 'Premium', true, '+231 77 555 0112')
ON CONFLICT DO NOTHING;

-- Index for faster category filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_county ON products(county);
