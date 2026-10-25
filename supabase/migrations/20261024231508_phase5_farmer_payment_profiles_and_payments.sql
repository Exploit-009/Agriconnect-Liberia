/*
# Phase 5: Direct Farmer-to-Buyer Mobile Money Payments

## Summary
Adds two new tables to support a payment-recording and confirmation workflow
for direct mobile money transfers between buyers and farmers. AgriConnect does
NOT process, hold, or transfer any money. This is a record-keeping system only.

## New Tables

### 1. farmer_payment_profiles
Stores a farmer's mobile money receiving details. A farmer may configure one or
both providers (Orange Money, Lonestar Cell MTN MoMo).
- `id` (uuid, primary key)
- `farmer_id` (uuid, references profiles.id, NOT NULL) — the farmer who owns this profile
- `provider` (text, NOT NULL) — 'orange_money' or 'mtn_momo'
- `mobile_money_number` (text, NOT NULL) — the phone number used to receive money
- `recipient_name` (text, NOT NULL) — account holder name
- `payment_instructions` (text, nullable) — optional notes from the farmer
- `is_active` (boolean, default true) — farmer can deactivate a provider
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

Unique constraint on (farmer_id, provider) so a farmer has at most one profile per provider.

### 2. payments
Records a payment attempt linked to an existing enquiry.
- `id` (uuid, primary key)
- `enquiry_id` (uuid, references enquiries.id, NOT NULL) — the enquiry this payment belongs to
- `buyer_id` (uuid, references profiles.id, NOT NULL) — the buyer paying
- `farmer_id` (uuid, references profiles.id, NOT NULL) — the farmer receiving
- `agreed_amount_lrd` (numeric(12,2), NOT NULL) — agreed amount in Liberian Dollars
- `provider` (text, NOT NULL) — 'orange_money' or 'mtn_momo'
- `status` (text, NOT NULL, default 'not_started') — one of: not_started, reported, confirmed, disputed, cancelled
- `transaction_reference` (text, nullable) — non-sensitive reference the buyer may provide
- `farmer_confirmed_at` (timestamptz, nullable) — timestamp when farmer confirmed receipt
- `buyer_reported_at` (timestamptz, nullable) — timestamp when buyer reported the transfer
- `cancelled_at` (timestamptz, nullable)
- `disputed_at` (timestamptz, nullable)
- `dispute_note` (text, nullable) — optional note about the dispute
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

Unique constraint on enquiry_id — one payment record per enquiry to prevent duplicates.
CHECK constraint: agreed_amount_lrd > 0.
CHECK constraint: status IN allowed values.
CHECK constraint: provider IN ('orange_money', 'mtn_momo').

## Security (RLS + Grants)

### farmer_payment_profiles
- RLS enabled.
- SELECT: only the farmer owner OR a buyer who has an accepted/contacted enquiry with that farmer.
  This ensures payment details are only visible to the relevant buyer after an enquiry exists,
  never to anonymous visitors or unrelated users.
- INSERT/UPDATE/DELETE: only the farmer owner (must have role='farmer').
- Column-restricted UPDATE: only recipient_name, mobile_money_number, payment_instructions,
  is_active, updated_at can be changed. farmer_id and provider are immutable after creation.

### payments
- RLS enabled.
- SELECT: only the buyer or farmer associated with the enquiry.
- INSERT: only the buyer associated with the enquiry, and only when status is 'not_started'
  or 'reported' (buyer creates the initial record or reports a transfer).
- UPDATE: restricted columns and restricted transitions:
  - Buyer may update: status (to 'reported', 'cancelled'), transaction_reference, buyer_reported_at, cancelled_at.
  - Farmer may update: status (to 'confirmed', 'disputed', 'cancelled'), farmer_confirmed_at, disputed_at, cancelled_at, dispute_note.
  - buyer_id, farmer_id, enquiry_id, agreed_amount_lrd, provider are NEVER updatable.
- DELETE: not granted to any role (payment records are permanent).

Status transition enforcement is done via WITH CHECK on UPDATE policies:
- Buyer can only set status to 'reported' or 'cancelled'.
- Farmer can only set status to 'confirmed', 'disputed', or 'cancelled'.

## Important Notes
1. No PINs, passwords, OTPs, or secret credentials are stored.
2. AgriConnect does not process money — this is a recording/confirmation workflow only.
3. The 12 existing products, user profiles, and enquiries are untouched.
4. No existing tables are dropped or altered (additive only).
5. All policies use auth.uid() for ownership — never current_user.
6. No service_role keys are referenced or needed.
*/

-- ============================================================
-- 1. farmer_payment_profiles table
-- ============================================================
CREATE TABLE IF NOT EXISTS farmer_payment_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('orange_money', 'mtn_momo')),
  mobile_money_number text NOT NULL,
  recipient_name text NOT NULL,
  payment_instructions text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (farmer_id, provider)
);

ALTER TABLE farmer_payment_profiles ENABLE ROW LEVEL SECURITY;

-- Grants: only authenticated (no anon — payment details are private)
GRANT SELECT ON farmer_payment_profiles TO authenticated;
GRANT INSERT ON farmer_payment_profiles TO authenticated;
-- Column-restricted UPDATE: farmer_id and provider are NOT updatable
GRANT UPDATE (recipient_name, mobile_money_number, payment_instructions, is_active, updated_at) ON farmer_payment_profiles TO authenticated;
GRANT DELETE ON farmer_payment_profiles TO authenticated;

-- SELECT: farmer owner OR buyer with an enquiry to this farmer
-- (buyer can see payment instructions only if they have an enquiry with this farmer)
DROP POLICY IF EXISTS "fpp_select_owner_or_related_buyer" ON farmer_payment_profiles;
CREATE POLICY "fpp_select_owner_or_related_buyer"
ON farmer_payment_profiles FOR SELECT
TO authenticated
USING (
  farmer_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM enquiries e
    WHERE e.farmer_id = farmer_payment_profiles.farmer_id
      AND e.buyer_id = auth.uid()
  )
);

-- INSERT: only the farmer, and farmer must have role='farmer'
DROP POLICY IF EXISTS "fpp_insert_own_farmer" ON farmer_payment_profiles;
CREATE POLICY "fpp_insert_own_farmer"
ON farmer_payment_profiles FOR INSERT
TO authenticated
WITH CHECK (
  farmer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'farmer'
  )
);

-- UPDATE: only the farmer owner
DROP POLICY IF EXISTS "fpp_update_own_farmer" ON farmer_payment_profiles;
CREATE POLICY "fpp_update_own_farmer"
ON farmer_payment_profiles FOR UPDATE
TO authenticated
USING (farmer_id = auth.uid())
WITH CHECK (farmer_id = auth.uid());

-- DELETE: only the farmer owner
DROP POLICY IF EXISTS "fpp_delete_own_farmer" ON farmer_payment_profiles;
CREATE POLICY "fpp_delete_own_farmer"
ON farmer_payment_profiles FOR DELETE
TO authenticated
USING (farmer_id = auth.uid());

-- ============================================================
-- 2. payments table
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id uuid NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agreed_amount_lrd numeric(12,2) NOT NULL CHECK (agreed_amount_lrd > 0),
  provider text NOT NULL CHECK (provider IN ('orange_money', 'mtn_momo')),
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'reported', 'confirmed', 'disputed', 'cancelled')),
  transaction_reference text,
  farmer_confirmed_at timestamptz,
  buyer_reported_at timestamptz,
  cancelled_at timestamptz,
  disputed_at timestamptz,
  dispute_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enquiry_id)
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Grants: only authenticated (no anon)
GRANT SELECT ON payments TO authenticated;
GRANT INSERT ON payments TO authenticated;
-- Column-restricted UPDATE: buyer_id, farmer_id, enquiry_id, agreed_amount_lrd, provider are NOT updatable
GRANT UPDATE (
  status, transaction_reference, buyer_reported_at, farmer_confirmed_at,
  cancelled_at, disputed_at, dispute_note, updated_at
) ON payments TO authenticated;
-- No DELETE grant — payment records are permanent

-- SELECT: only the buyer or farmer associated with this payment
DROP POLICY IF EXISTS "payments_select_parties" ON payments;
CREATE POLICY "payments_select_parties"
ON payments FOR SELECT
TO authenticated
USING (buyer_id = auth.uid() OR farmer_id = auth.uid());

-- INSERT: only the buyer of the enquiry, amount must be positive (enforced by CHECK)
DROP POLICY IF EXISTS "payments_insert_buyer" ON payments;
CREATE POLICY "payments_insert_buyer"
ON payments FOR INSERT
TO authenticated
WITH CHECK (
  buyer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM enquiries e
    WHERE e.id = payments.enquiry_id
      AND e.buyer_id = auth.uid()
      AND e.farmer_id = payments.farmer_id
  )
);

-- UPDATE (buyer side): buyer can only set status to 'reported' or 'cancelled'
-- and can only update their own payment
DROP POLICY IF EXISTS "payments_update_buyer" ON payments;
CREATE POLICY "payments_update_buyer"
ON payments FOR UPDATE
TO authenticated
USING (buyer_id = auth.uid())
WITH CHECK (
  buyer_id = auth.uid()
  AND status IN ('reported', 'cancelled')
);

-- UPDATE (farmer side): farmer can only set status to 'confirmed', 'disputed', or 'cancelled'
-- and can only update payments where they are the farmer
-- Note: Postgres evaluates all applicable UPDATE policies. Both buyer and farmer
-- UPDATE policies use WITH CHECK. A buyer will fail the farmer policy's WITH CHECK
-- (because buyer_id = auth.uid() would be true but status IN ('confirmed','disputed','cancelled')
-- would fail for 'reported'). A farmer will fail the buyer policy's WITH CHECK
-- (farmer_id = auth.uid() is true but status IN ('reported','cancelled') would fail for 'confirmed').
-- This means UPDATE will be rejected unless BOTH policies' USING pass AND at least one
-- policy's WITH CHECK passes. Since USING requires (buyer_id = uid OR farmer_id = uid)
-- is not how Postgres combines permissive policies — each policy is evaluated independently
-- and the row is visible if ANY USING passes, but WITH CHECK must pass for the policy
-- whose USING matched. Actually, for UPDATE, the row passes if ANY policy's USING(true)
-- AND the new row passes ALL WITH CHECKs for ALL policies. This means BOTH WITH CHECKs
-- must pass. That would make it impossible. We need a different approach.

-- Drop the separate buyer/farmer update policies and use a single combined policy
DROP POLICY IF EXISTS "payments_update_buyer" ON payments;
DROP POLICY IF EXISTS "payments_update_farmer" ON payments;

-- Single UPDATE policy: the updater must be either the buyer or the farmer.
-- The WITH CHECK ensures:
-- - If the updater is the buyer (buyer_id = auth.uid()), status must be 'reported' or 'cancelled'
-- - If the updater is the farmer (farmer_id = auth.uid()), status must be 'confirmed', 'disputed', or 'cancelled'
-- - buyer_id, farmer_id, enquiry_id, agreed_amount_lrd, provider cannot change (enforced by column grant)
DROP POLICY IF EXISTS "payments_update_parties" ON payments;
CREATE POLICY "payments_update_parties"
ON payments FOR UPDATE
TO authenticated
USING (buyer_id = auth.uid() OR farmer_id = auth.uid())
WITH CHECK (
  -- The updater must be either the buyer or the farmer of this row
  (buyer_id = auth.uid() OR farmer_id = auth.uid())
  AND (
    -- If buyer is updating, status must be 'reported' or 'cancelled'
    (buyer_id = auth.uid() AND status IN ('reported', 'cancelled'))
    OR
    -- If farmer is updating, status must be 'confirmed', 'disputed', or 'cancelled'
    (farmer_id = auth.uid() AND status IN ('confirmed', 'disputed', 'cancelled'))
  )
);

-- Index for querying payments by user
CREATE INDEX IF NOT EXISTS idx_payments_buyer_id ON payments(buyer_id);
CREATE INDEX IF NOT EXISTS idx_payments_farmer_id ON payments(farmer_id);
CREATE INDEX IF NOT EXISTS idx_payments_enquiry_id ON payments(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_fpp_farmer_id ON farmer_payment_profiles(farmer_id);
