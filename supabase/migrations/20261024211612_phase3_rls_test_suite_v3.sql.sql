-- Phase 3 RLS Test Suite v3 — comprehensive, non-destructive
-- Creates a SECURITY INVOKER function that simulates JWT claims to test RLS.
-- Uses temporary fixture data (clearly identified test UUIDs), cleans up after.
-- Does NOT touch the 12 original products or existing profiles.

CREATE OR REPLACE FUNCTION public._run_rls_tests_v3()
RETURNS TABLE(test_name text, result text, detail text)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_farmer_id uuid := 'a0000000-0000-0000-0000-000000000001';
  v_buyer_id  uuid := 'a0000000-0000-0000-0000-000000000002';
  v_farmer2_id uuid := 'a0000000-0000-0000-0000-000000000003';
  v_test_product_id uuid;
  v_test_product2_id uuid;
  v_test_enquiry_id uuid;
  v_row_count int;
  v_count int;
BEGIN
  INSERT INTO profiles (id, email, full_name, role, county, phone)
  VALUES
    (v_farmer_id, 'test_farmer@rls.test', 'Test Farmer', 'farmer', 'Bong', '+231000000001'),
    (v_buyer_id, 'test_buyer@rls.test', 'Test Buyer', 'buyer', 'Montserrado', '+231000000002'),
    (v_farmer2_id, 'test_farmer2@rls.test', 'Test Farmer 2', 'farmer', 'Nimba', '+231000000003')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO products (name, category, price, unit, quantity_available, farmer_name, county, description, image_url, quality_grade, is_organic, contact_phone, farmer_id)
  VALUES
    ('RLS_TEST_PRODUCT_1', 'Grains', 500, 'kg', 10, 'Test Farmer', 'Bong', 'test', '', 'Grade A', false, '+231000000001', v_farmer_id),
    ('RLS_TEST_PRODUCT_2', 'Grains', 600, 'kg', 8, 'Test Farmer 2', 'Nimba', 'test2', '', 'Grade A', false, '+231000000003', v_farmer2_id)
  ON CONFLICT (id) DO NOTHING;

  v_test_product_id := (SELECT id FROM products WHERE farmer_id = v_farmer_id AND name = 'RLS_TEST_PRODUCT_1' LIMIT 1);
  v_test_product2_id := (SELECT id FROM products WHERE farmer_id = v_farmer2_id AND name = 'RLS_TEST_PRODUCT_2' LIMIT 1);

  PERFORM set_config('request.jwt.claim.sub', '', true);
  PERFORM set_config('request.jwt.claim.role', 'anon', true);
  PERFORM set_config('role', 'anon', true);
  BEGIN
    SELECT count(*) INTO v_count FROM products;
    IF v_count >= 12 THEN
      test_name := 'T1 anon SELECT products (public read)'; result := 'PASS'; detail := 'count=' || v_count;
    ELSE
      test_name := 'T1 anon SELECT products (public read)'; result := 'FAIL'; detail := 'count=' || v_count || ' (expected >=12)';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T1 anon SELECT products (public read)'; result := 'FAIL'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    INSERT INTO products (name, category, price, unit, quantity_available, farmer_name, county, description, image_url, quality_grade, is_organic, contact_phone, farmer_id)
    VALUES ('Anon Hack Product', 'Grains', 1, 'kg', 1, 'Anon', 'Bong', 'hack', '', 'Grade A', false, '', null);
    test_name := 'T2 anon INSERT product BLOCKED'; result := 'FAIL'; detail := 'inserted';
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T2 anon INSERT product BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    UPDATE products SET price = 1 WHERE id = v_test_product_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count > 0 THEN
      test_name := 'T3 anon UPDATE product BLOCKED'; result := 'FAIL'; detail := 'updated ' || v_row_count;
    ELSE
      test_name := 'T3 anon UPDATE product BLOCKED'; result := 'PASS'; detail := '0 rows';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T3 anon UPDATE product BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    DELETE FROM products WHERE id = v_test_product_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count > 0 THEN
      test_name := 'T4 anon DELETE product BLOCKED'; result := 'FAIL'; detail := 'deleted ' || v_row_count;
    ELSE
      test_name := 'T4 anon DELETE product BLOCKED'; result := 'PASS'; detail := '0 rows';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T4 anon DELETE product BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    SELECT count(*) INTO v_count FROM enquiries;
    test_name := 'T5 anon SELECT enquiries BLOCKED'; result := 'FAIL'; detail := 'returned count=' || v_count;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T5 anon SELECT enquiries BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  PERFORM set_config('request.jwt.claim.sub', v_buyer_id::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  PERFORM set_config('role', 'authenticated', true);
  BEGIN
    INSERT INTO products (name, category, price, unit, quantity_available, farmer_name, county, description, image_url, quality_grade, is_organic, contact_phone, farmer_id)
    VALUES ('Buyer Hack Product', 'Grains', 1, 'kg', 1, 'Buyer', 'Bong', 'hack', '', 'Grade A', false, '', v_buyer_id);
    test_name := 'T6 buyer INSERT product BLOCKED'; result := 'FAIL'; detail := 'inserted';
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T6 buyer INSERT product BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    UPDATE products SET price = 1 WHERE id = v_test_product_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count > 0 THEN
      test_name := 'T7 buyer UPDATE product BLOCKED'; result := 'FAIL'; detail := 'updated ' || v_row_count;
    ELSE
      test_name := 'T7 buyer UPDATE product BLOCKED'; result := 'PASS'; detail := '0 rows';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T7 buyer UPDATE product BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    DELETE FROM products WHERE id = v_test_product_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count > 0 THEN
      test_name := 'T8 buyer DELETE product BLOCKED'; result := 'FAIL'; detail := 'deleted ' || v_row_count;
    ELSE
      test_name := 'T8 buyer DELETE product BLOCKED'; result := 'PASS'; detail := '0 rows';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T8 buyer DELETE product BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    INSERT INTO enquiries (product_id, buyer_id, farmer_id, message, quantity_requested, status, contact_phone)
    VALUES (v_test_product_id, v_buyer_id, v_farmer_id, 'RLS test enquiry', '5 bags', 'pending', '+231000000002');
    v_test_enquiry_id := (SELECT id FROM enquiries WHERE buyer_id = v_buyer_id AND message = 'RLS test enquiry' ORDER BY created_at DESC LIMIT 1);
    test_name := 'T9 buyer INSERT enquiry ALLOWED'; result := 'PASS'; detail := 'enquiry_id=' || v_test_enquiry_id;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T9 buyer INSERT enquiry ALLOWED'; result := 'FAIL'; detail := SQLERRM;
    v_test_enquiry_id := '00000000-0000-0000-0000-000000000000'::uuid;
    RETURN NEXT;
  END;

  BEGIN
    SELECT count(*) INTO v_count FROM enquiries WHERE buyer_id = v_buyer_id;
    IF v_count >= 1 THEN
      test_name := 'T10 buyer SELECT own enquiries ALLOWED'; result := 'PASS'; detail := 'count=' || v_count;
    ELSE
      test_name := 'T10 buyer SELECT own enquiries ALLOWED'; result := 'FAIL'; detail := 'count=' || v_count;
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T10 buyer SELECT own enquiries ALLOWED'; result := 'FAIL'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    UPDATE enquiries SET status = 'closed' WHERE id = v_test_enquiry_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count > 0 THEN
      test_name := 'T11 buyer UPDATE enquiry status BLOCKED'; result := 'FAIL'; detail := 'updated ' || v_row_count;
    ELSE
      test_name := 'T11 buyer UPDATE enquiry status BLOCKED'; result := 'PASS'; detail := '0 rows';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T11 buyer UPDATE enquiry status BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  PERFORM set_config('request.jwt.claim.sub', v_farmer_id::text, true);
  BEGIN
    INSERT INTO products (name, category, price, unit, quantity_available, farmer_name, county, description, image_url, quality_grade, is_organic, contact_phone, farmer_id)
    VALUES ('RLS_TEST_FARMER_NEW', 'Grains', 700, 'kg', 12, 'Test Farmer', 'Bong', 'farmer new', '', 'Grade A', false, '+231000000001', v_farmer_id);
    test_name := 'T12 farmer INSERT own product ALLOWED'; result := 'PASS'; detail := 'inserted';
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T12 farmer INSERT own product ALLOWED'; result := 'FAIL'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    INSERT INTO products (name, category, price, unit, quantity_available, farmer_name, county, description, image_url, quality_grade, is_organic, contact_phone, farmer_id)
    VALUES ('RLS_TEST_CROSS_OWN', 'Grains', 700, 'kg', 12, 'Test Farmer 2', 'Nimba', 'cross', '', 'Grade A', false, '+231000000003', v_farmer2_id);
    test_name := 'T13 farmer INSERT with wrong farmer_id BLOCKED'; result := 'FAIL'; detail := 'inserted';
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T13 farmer INSERT with wrong farmer_id BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    UPDATE products SET price = 1 WHERE id = v_test_product2_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count > 0 THEN
      test_name := 'T14 farmer UPDATE other farmer product BLOCKED'; result := 'FAIL'; detail := 'updated ' || v_row_count;
    ELSE
      test_name := 'T14 farmer UPDATE other farmer product BLOCKED'; result := 'PASS'; detail := '0 rows';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T14 farmer UPDATE other farmer product BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    DELETE FROM products WHERE id = v_test_product2_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count > 0 THEN
      test_name := 'T15 farmer DELETE other farmer product BLOCKED'; result := 'FAIL'; detail := 'deleted ' || v_row_count;
    ELSE
      test_name := 'T15 farmer DELETE other farmer product BLOCKED'; result := 'PASS'; detail := '0 rows';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T15 farmer DELETE other farmer product BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    UPDATE products SET farmer_id = v_buyer_id WHERE id = v_test_product_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count > 0 THEN
      test_name := 'T16 farmer change ownership BLOCKED'; result := 'FAIL'; detail := 'updated ' || v_row_count;
    ELSE
      test_name := 'T16 farmer change ownership BLOCKED'; result := 'PASS'; detail := '0 rows (WITH CHECK)';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T16 farmer change ownership BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    SELECT count(*) INTO v_count FROM enquiries WHERE farmer_id = v_farmer_id;
    IF v_count >= 1 THEN
      test_name := 'T17 farmer SELECT own enquiries ALLOWED'; result := 'PASS'; detail := 'count=' || v_count;
    ELSE
      test_name := 'T17 farmer SELECT own enquiries ALLOWED'; result := 'FAIL'; detail := 'count=' || v_count;
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T17 farmer SELECT own enquiries ALLOWED'; result := 'FAIL'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    UPDATE enquiries SET status = 'contacted' WHERE id = v_test_enquiry_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count > 0 THEN
      test_name := 'T18 farmer UPDATE enquiry status ALLOWED'; result := 'PASS'; detail := 'updated to contacted';
    ELSE
      test_name := 'T18 farmer UPDATE enquiry status ALLOWED'; result := 'FAIL'; detail := '0 rows';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T18 farmer UPDATE enquiry status ALLOWED'; result := 'FAIL'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    UPDATE enquiries SET status = 'invalid_status' WHERE id = v_test_enquiry_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count > 0 THEN
      test_name := 'T19 farmer UPDATE enquiry invalid status BLOCKED'; result := 'FAIL'; detail := 'updated';
    ELSE
      test_name := 'T19 farmer UPDATE enquiry invalid status BLOCKED'; result := 'PASS'; detail := '0 rows';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T19 farmer UPDATE enquiry invalid status BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    DELETE FROM enquiries WHERE id = v_test_enquiry_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count > 0 THEN
      test_name := 'T20 farmer DELETE enquiry BLOCKED'; result := 'FAIL'; detail := 'deleted ' || v_row_count;
    ELSE
      test_name := 'T20 farmer DELETE enquiry BLOCKED'; result := 'PASS'; detail := '0 rows';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T20 farmer DELETE enquiry BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  PERFORM set_config('request.jwt.claim.sub', v_buyer_id::text, true);
  BEGIN
    SELECT count(*) INTO v_count FROM enquiries WHERE buyer_id = v_farmer2_id;
    IF v_count > 0 THEN
      test_name := 'T21 buyer cannot see other enquiries BLOCKED'; result := 'FAIL'; detail := 'count=' || v_count;
    ELSE
      test_name := 'T21 buyer cannot see other enquiries BLOCKED'; result := 'PASS'; detail := 'count=0 (correctly filtered)';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T21 buyer cannot see other enquiries BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  PERFORM set_config('request.jwt.claim.sub', v_buyer_id::text, true);
  BEGIN
    UPDATE profiles SET role = 'farmer' WHERE id = v_buyer_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count > 0 THEN
      test_name := 'T22 buyer change own role BLOCKED'; result := 'FAIL'; detail := 'updated ' || v_row_count;
    ELSE
      test_name := 'T22 buyer change own role BLOCKED'; result := 'PASS'; detail := '0 rows (column grant blocked)';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T22 buyer change own role BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    UPDATE profiles SET verified = true WHERE id = v_buyer_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count > 0 THEN
      test_name := 'T23 buyer change verified BLOCKED'; result := 'FAIL'; detail := 'updated ' || v_row_count;
    ELSE
      test_name := 'T23 buyer change verified BLOCKED'; result := 'PASS'; detail := '0 rows (column grant blocked)';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T23 buyer change verified BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    UPDATE profiles SET full_name = 'Updated Buyer Name' WHERE id = v_buyer_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count > 0 THEN
      test_name := 'T24 user update own full_name ALLOWED'; result := 'PASS'; detail := 'updated';
    ELSE
      test_name := 'T24 user update own full_name ALLOWED'; result := 'FAIL'; detail := '0 rows';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T24 user update own full_name ALLOWED'; result := 'FAIL'; detail := SQLERRM;
    RETURN NEXT;
  End;

  BEGIN
    UPDATE profiles SET full_name = 'Hacked' WHERE id = v_farmer_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count > 0 THEN
      test_name := 'T25 buyer update other profile BLOCKED'; result := 'FAIL'; detail := 'updated ' || v_row_count;
    ELSE
      test_name := 'T25 buyer update other profile BLOCKED'; result := 'PASS'; detail := '0 rows';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T25 buyer update other profile BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  PERFORM set_config('role', 'postgres', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);
  SELECT count(*) INTO v_count FROM products WHERE name NOT LIKE 'RLS_TEST%';
  IF v_count = 12 THEN
    test_name := 'T26 original 12 products intact'; result := 'PASS'; detail := 'count=' || v_count;
  ELSE
    test_name := 'T26 original 12 products intact'; result := 'FAIL'; detail := 'count=' || v_count || ' (expected 12)';
  END IF;
  RETURN NEXT;

  DELETE FROM enquiries WHERE buyer_id IN (v_buyer_id, v_farmer_id, v_farmer2_id);
  DELETE FROM products WHERE farmer_id IN (v_farmer_id, v_farmer2_id) OR name LIKE 'RLS_TEST%';
  DELETE FROM profiles WHERE id IN (v_farmer_id, v_buyer_id, v_farmer2_id);

  SELECT count(*) INTO v_count FROM products WHERE name LIKE 'RLS_TEST%';
  IF v_count = 0 THEN
    test_name := 'T27 test cleanup verified'; result := 'PASS'; detail := '0 test products remain';
  ELSE
    test_name := 'T27 test cleanup verified'; result := 'FAIL'; detail := v_count || ' test products remain';
  END IF;
  RETURN NEXT;

  PERFORM set_config('request.jwt.claim.sub', '', true);
  PERFORM set_config('request.jwt.claim.role', '', true);
  PERFORM set_config('role', 'postgres', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public._run_rls_tests_v3() TO service_role;
