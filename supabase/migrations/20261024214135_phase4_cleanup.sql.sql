-- Remove test functions after flow tests complete
DROP FUNCTION IF EXISTS public._run_flow_tests_v4(uuid, uuid) CASCADE;
