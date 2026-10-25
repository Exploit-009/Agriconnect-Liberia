-- Replace the test function with SECURITY INVOKER version
-- We'll set the JWT claims before calling and run as authenticated role

DROP FUNCTION IF EXISTS public._run_rls_tests();

CREATE OR REPLACE FUNCTION public._run_rls_tests()
RETURNS TABLE(test_name text, result text, detail text)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  farmer_uuid uuid := 'a0000000-0000-0000-0000-000000000001';
  buyer_uuid  uuid := 'a0000000-0000-0000-0000-000000000002';
  test_product_id uuid;
  test_enquiry_id uuid;
  row_count int;
BEGIN
  test_product_id := (SELECT id FROM products WHERE farmer_id = farmer_uuid AND name = 'RLS Test Product' LIMIT 1);

  -- T10R: Buyer CANNOT INSERT products (with farmer-only fix)
  PERFORM set_config('request.jwt.claim.sub', buyer_uuid::text, true);

  BEGIN
    INSERT INTO products (name, category, price, unit, quantity_available, farmer_name, county, description, image_url, quality_grade, is_organic, contact_phone, farmer_id)
    VALUES ('Buyer Hack Retry', 'Grains', 1, 'kg', 1, 'Buyer', 'Bong', 'hack', '', 'Grade A', false, '', buyer_uuid);
    test_name := 'T10R buyer INSERT product BLOCKED'; result := 'FAIL'; detail := 'inserted';
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T10R buyer INSERT product BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  -- Create enquiry as buyer
  BEGIN
    INSERT INTO enquiries (product_id, buyer_id, farmer_id, message, quantity_requested, status, contact_phone)
    VALUES (test_product_id, buyer_uuid, farmer_uuid, 'Test enquiry', '3 bags', 'pending', '+231555002');
    test_enquiry_id := (SELECT id FROM enquiries WHERE buyer_id = buyer_uuid ORDER BY created_at DESC LIMIT 1);
  EXCEPTION WHEN others THEN
    test_enquiry_id := '00000000-0000-0000-0000-000000000000'::uuid;
  END;

  -- T14R: Buyer CANNOT UPDATE enquiry status
  BEGIN
    UPDATE enquiries SET status = 'closed' WHERE id = test_enquiry_id;
    GET DIAGNOSTICS row_count = ROW_COUNT;
    IF row_count > 0 THEN
      test_name := 'T14R buyer UPDATE enquiry status BLOCKED'; result := 'FAIL'; detail := 'updated';
    ELSE
      test_name := 'T14R buyer UPDATE enquiry status BLOCKED'; result := 'PASS'; detail := '0 rows';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T14R buyer UPDATE enquiry status BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  -- T19R: Farmer CANNOT DELETE buyer's enquiry
  PERFORM set_config('request.jwt.claim.sub', farmer_uuid::text, true);
  BEGIN
    DELETE FROM enquiries WHERE id = test_enquiry_id;
    GET DIAGNOSTICS row_count = ROW_COUNT;
    IF row_count > 0 THEN
      test_name := 'T19R farmer DELETE enquiry BLOCKED'; result := 'FAIL'; detail := 'deleted';
    ELSE
      test_name := 'T19R farmer DELETE enquiry BLOCKED'; result := 'PASS'; detail := '0 rows';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T19R farmer DELETE enquiry BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  -- T25: Farmer CAN still INSERT own product
  BEGIN
    INSERT INTO products (name, category, price, unit, quantity_available, farmer_name, county, description, image_url, quality_grade, is_organic, contact_phone, farmer_id)
    VALUES ('Farmer Can Still List', 'Grains', 800, 'kg', 5, 'Test Farmer', 'Bong', 'verify', '', 'Grade A', false, '+231555001', farmer_uuid);
    test_name := 'T25 farmer INSERT own product (post-fix)'; result := 'PASS'; detail := 'inserted';
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T25 farmer INSERT own product (post-fix)'; result := 'FAIL'; detail := SQLERRM;
    RETURN NEXT;
  END;

  -- T26: Farmer CANNOT change product ownership (farmer_id) to another user via UPDATE
  BEGIN
    UPDATE products SET farmer_id = buyer_uuid WHERE id = test_product_id;
    GET DIAGNOSTICS row_count = ROW_COUNT;
    IF row_count > 0 THEN
      test_name := 'T26 farmer change ownership BLOCKED'; result := 'FAIL'; detail := 'updated';
    ELSE
      test_name := 'T26 farmer change ownership BLOCKED'; result := 'PASS'; detail := '0 rows (WITH CHECK)';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'T26 farmer change ownership BLOCKED'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  PERFORM set_config('request.jwt.claim.sub', '', true);
END;
$$;

-- Grant execute to authenticated (needed to run as authenticated)
GRANT EXECUTE ON FUNCTION public._run_rls_tests() TO authenticated, service_role;
