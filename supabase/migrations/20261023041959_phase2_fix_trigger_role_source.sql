/*
# Fix: handle_new_user reads role from user_metadata (not app_metadata)

## Overview
The supabase-js client puts signUp `options.data` into `raw_user_meta_data`,
NOT `raw_app_meta_data`. The original trigger only read role from
`raw_app_meta_data`, which means role would always default to 'buyer'.

Updated the trigger to read role from `raw_user_meta_data` first, falling
back to `raw_app_meta_data`, then defaulting to 'buyer'.

This is safe because:
- The role is set once at signup from the registration form
- The profiles.role column has a CHECK constraint limiting to 'farmer'/'buyer'
- The UPDATE grant on profiles excludes the role column — clients can't change it
- The trigger is SECURITY DEFINER and not callable via REST
*/

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

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
