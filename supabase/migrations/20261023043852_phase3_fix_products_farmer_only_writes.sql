/*
# Phase 3 Fix: Restrict product writes to farmers only

## Problem
The products INSERT/UPDATE/DELETE policies only checked `auth.uid() = farmer_id`,
which means any authenticated user (including buyers) could insert a product
by setting farmer_id to their own UUID. This is a privilege escalation: a buyer
could list products for sale.

## Fix
Add a role check to products INSERT/UPDATE/DELETE policies using a subquery
to profiles. Only users with role='farmer' can write to products.

The check uses: EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'farmer')
This is safe because:
- profiles.role is set by the SECURITY DEFINER trigger at signup and is not
  client-updatable (column-level grant excludes it)
- The subquery reads profiles which has a public SELECT policy, so no recursion issues
*/

-- Drop old policies
DROP POLICY IF EXISTS "products_insert_own" ON products;
DROP POLICY IF EXISTS "products_update_own" ON products;
DROP POLICY IF EXISTS "products_delete_own" ON products;

-- INSERT: must be farmer AND own the product
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

-- UPDATE: must be farmer AND own the product
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

-- DELETE: must be farmer AND own the product
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
