/*
# Fix: Revoke EXECUTE on handle_new_user from authenticated, tighten column grants

## Overview
1. The security advisor flagged that `handle_new_user()` (SECURITY DEFINER) is
   callable by the `authenticated` role via the REST API. This function should
   only be invoked by the database trigger, never by clients. Revoke EXECUTE
   from all roles except the trigger owner (postgres).

2. Re-apply column-level UPDATE grants on profiles and enquiries to ensure
   users cannot update restricted columns (role, verified on profiles;
   non-status fields on enquiries).
*/

-- 1. Lock down handle_new_user: no role should call it via REST
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 2. Tighten profiles: revoke broad UPDATE, grant only safe columns
REVOKE UPDATE ON profiles FROM anon, authenticated;
GRANT UPDATE (full_name, county, phone, bio, avatar_url, updated_at) ON profiles TO authenticated;

-- 3. Tighten enquiries: revoke broad UPDATE, grant only status + updated_at
REVOKE UPDATE ON enquiries FROM anon, authenticated;
GRANT UPDATE (status, updated_at) ON enquiries TO authenticated;

-- 4. Also revoke INSERT/DELETE from anon on profiles and enquiries (shouldn't have them)
REVOKE INSERT, UPDATE, DELETE ON profiles FROM anon;
REVOKE INSERT, DELETE ON enquiries FROM anon;
