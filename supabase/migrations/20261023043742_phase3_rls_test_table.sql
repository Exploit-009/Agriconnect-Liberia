-- Temporary test results table for Phase 3 RLS testing
-- Will be dropped after tests complete
CREATE TABLE IF NOT EXISTS _rls_test_results (
  test_name text,
  result text,
  detail text
);
ALTER TABLE _rls_test_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "_rls_test_all" ON _rls_test_results FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
GRANT ALL ON _rls_test_results TO anon, authenticated, service_role;
