-- Create a test helper function that runs as SECURITY INVOKER
-- so RLS is enforced based on the current role/sub config
CREATE OR REPLACE FUNCTION public._test_rls_as_user(
  p_user_id uuid,
  p_role text DEFAULT 'authenticated'
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', p_user_id::text, true);
  PERFORM set_config('role', p_role, true);
END;
$$;

-- But we can't actually change the effective role from within a function.
-- The real test is: does the frontend Supabase client enforce this?
-- For T14/T19, the column-level grant is what matters:
-- enquiries UPDATE is granted only on (status, updated_at) to authenticated.
-- If a buyer tries to UPDATE, they can only touch status/updated_at columns.
-- But the RLS policy "enquiries_update_farmer_status" requires farmer_id = auth.uid(),
-- so a buyer (whose auth.uid() != farmer_id) should be blocked by the policy.

-- Let's verify the actual grant structure:
-- The grant is: GRANT UPDATE (status, updated_at) ON enquiries TO authenticated;
-- The policy is: USING (farmer_id = auth.uid()) WITH CHECK (farmer_id = auth.uid())
-- A buyer trying to update status would:
-- 1. Pass column grant (status is allowed column)
-- 2. Fail RLS policy (farmer_id != auth.uid() for buyer)
-- So T14 should PASS (blocked) when tested properly.

-- The test failed because set_config('role') inside a DO block run by 
-- service_role doesn't actually change the RLS enforcement context.
-- service_role bypasses RLS entirely.

-- T19: Farmer DELETE enquiry
-- Grant: DELETE TO authenticated
-- Policy: USING (buyer_id = auth.uid())
-- Farmer's auth.uid() != buyer_id, so should be blocked.
-- Same test artifact — service_role bypassed RLS.

-- So T14 and T19 are TEST ARTIFACTS, not real vulnerabilities.
-- Let's verify with a proper approach.
