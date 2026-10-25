/*
# Phase 5 Fix: Revoke anon access and enforce column-restricted UPDATE on payment tables

## Problem
The original Phase 5 migration created the tables and policies correctly, but the
column-restricted UPDATE grants did not apply as intended. The security posture
shows both `farmer_payment_profiles` and `payments` have full anon CRUD grants
and unrestricted authenticated UPDATE grants. This is a security defect:

- anon can SELECT private mobile money numbers (should be blocked)
- anon can INSERT/UPDATE/DELETE payment records (should be blocked)
- authenticated users can UPDATE immutable columns like buyer_id, farmer_id,
  enquiry_id, agreed_amount_lrd, provider (should be blocked)

## Fix
1. Revoke ALL privileges from anon on both tables.
2. Revoke unrestricted UPDATE from authenticated on both tables.
3. Re-grant column-restricted UPDATE on farmer_payment_profiles
   (only recipient_name, mobile_money_number, payment_instructions,
   is_active, updated_at).
4. Re-grant column-restricted UPDATE on payments
   (only status, transaction_reference, buyer_reported_at,
   farmer_confirmed_at, cancelled_at, disputed_at, dispute_note,
   updated_at).
5. Re-grant SELECT and INSERT to authenticated only.
6. Re-grant DELETE on farmer_payment_profiles only (payments has no DELETE).

## No data changes
No rows are inserted, updated, or deleted. No tables or policies are dropped.
Only GRANT and REVOKE statements.
*/

-- ============================================================
-- 1. farmer_payment_profiles: fix grants
-- ============================================================
REVOKE ALL ON farmer_payment_profiles FROM anon;
REVOKE ALL ON farmer_payment_profiles FROM authenticated;

GRANT SELECT ON farmer_payment_profiles TO authenticated;
GRANT INSERT ON farmer_payment_profiles TO authenticated;
GRANT UPDATE (recipient_name, mobile_money_number, payment_instructions, is_active, updated_at) ON farmer_payment_profiles TO authenticated;
GRANT DELETE ON farmer_payment_profiles TO authenticated;

-- ============================================================
-- 2. payments: fix grants
-- ============================================================
REVOKE ALL ON payments FROM anon;
REVOKE ALL ON payments FROM authenticated;

GRANT SELECT ON payments TO authenticated;
GRANT INSERT ON payments TO authenticated;
GRANT UPDATE (
  status, transaction_reference, buyer_reported_at, farmer_confirmed_at,
  cancelled_at, disputed_at, dispute_note, updated_at
) ON payments TO authenticated;
-- No DELETE grant: payment records are permanent
