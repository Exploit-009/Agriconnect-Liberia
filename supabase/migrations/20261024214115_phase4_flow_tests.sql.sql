-- Phase 4: Browser-level data flow tests using real auth users
-- Simulates what the Supabase client would do with JWT tokens
CREATE OR REPLACE FUNCTION public._run_flow_tests_v4(
  p_farmer_id uuid,
  p_buyer_id uuid
)
RETURNS TABLE(test_name text, result text, detail text)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, auth
AS $$
DECLARE
  v_test_product_id uuid;
  v_test_enquiry_id uuid;
  v_row_count int;
  v_count int;
  v_status text;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', p_farmer_id::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  PERFORM set_config('role', 'authenticated', true);

  BEGIN
    INSERT INTO public.products (name, category, price, unit, quantity_available, farmer_name, county, description, image_url, quality_grade, is_organic, contact_phone, farmer_id)
    VALUES ('FLOW_TEST_Rice_Bong', 'Grains', 900, 'bag', 20, 'Test Farmer', 'Bong', 'Flow test product', '', 'Grade A', true, '+231000000001', p_farmer_id);
    v_test_product_id := (SELECT id FROM public.products WHERE farmer_id = p_farmer_id AND name = 'FLOW_TEST_Rice_Bong' LIMIT 1);
    test_name := 'F1 farmer creates product'; result := 'PASS'; detail := 'product_id=' || v_test_product_id;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'F1 farmer creates product'; result := 'FAIL'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    SELECT count(*) INTO v_count FROM public.products WHERE id = v_test_product_id AND farmer_id = p_farmer_id;
    IF v_count = 1 THEN
      test_name := 'F2 farmer product persists after refresh'; result := 'PASS'; detail := 'found';
    ELSE
      test_name := 'F2 farmer product persists after refresh'; result := 'FAIL'; detail := 'count=' || v_count;
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'F2 farmer product persists after refresh'; result := 'FAIL'; detail := SQLERRM;
    RETURN NEXT;
  END;

  PERFORM set_config('request.jwt.claim.sub', '', true);
  PERFORM set_config('request.jwt.claim.role', 'anon', true);
  PERFORM set_config('role', 'anon', true);
  BEGIN
    SELECT count(*) INTO v_count FROM public.products;
    IF v_count >= 13 THEN
      test_name := 'F3 anon can browse products'; result := 'PASS'; detail := 'count=' || v_count;
    ELSE
      test_name := 'F3 anon can browse products'; result := 'FAIL'; detail := 'count=' || v_count;
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'F3 anon can browse products'; result := 'FAIL'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    INSERT INTO public.products (name, category, price, unit, quantity_available, farmer_name, county, description, image_url, quality_grade, is_organic, contact_phone)
    VALUES ('Anon Test', 'Grains', 1, 'kg', 1, 'Anon', 'Bong', 'x', '', 'Grade A', false, '');
    test_name := 'F4 anon cannot create product'; result := 'FAIL'; detail := 'inserted';
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'F4 anon cannot create product'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    INSERT INTO public.enquiries (product_id, buyer_id, farmer_id, message, status)
    VALUES (v_test_product_id, p_buyer_id, p_farmer_id, 'anon hack', 'pending');
    test_name := 'F5 anon cannot create enquiry'; result := 'FAIL'; detail := 'inserted';
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'F5 anon cannot create enquiry'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  PERFORM set_config('request.jwt.claim.sub', p_buyer_id::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  PERFORM set_config('role', 'authenticated', true);
  BEGIN
    INSERT INTO public.enquiries (product_id, buyer_id, farmer_id, message, quantity_requested, status, contact_phone)
    VALUES (v_test_product_id, p_buyer_id, p_farmer_id, 'Flow test enquiry - interested in 5 bags', '5 bags', 'pending', '+231000000002');
    v_test_enquiry_id := (SELECT id FROM public.enquiries WHERE buyer_id = p_buyer_id AND message LIKE 'Flow test enquiry%' ORDER BY created_at DESC LIMIT 1);
    test_name := 'F6 buyer creates enquiry'; result := 'PASS'; detail := 'enquiry_id=' || v_test_enquiry_id;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'F6 buyer creates enquiry'; result := 'FAIL'; detail := SQLERRM;
    v_test_enquiry_id := '00000000-0000-0000-0000-000000000000'::uuid;
    RETURN NEXT;
  END;

  BEGIN
    SELECT count(*) INTO v_count FROM public.enquiries WHERE id = v_test_enquiry_id AND buyer_id = p_buyer_id;
    IF v_count = 1 THEN
      test_name := 'F7 buyer enquiry persists after refresh'; result := 'PASS'; detail := 'found';
    ELSE
      test_name := 'F7 buyer enquiry persists after refresh'; result := 'FAIL'; detail := 'count=' || v_count;
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'F7 buyer enquiry persists after refresh'; result := 'FAIL'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    UPDATE public.enquiries SET status = 'closed' WHERE id = v_test_enquiry_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    test_name := 'F8 buyer cannot update enquiry status'; result := CASE WHEN v_row_count > 0 THEN 'FAIL' ELSE 'PASS' END; detail := CASE WHEN v_row_count > 0 THEN 'updated' ELSE '0 rows' END;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'F8 buyer cannot update enquiry status'; result := 'PASS'; detail := SQLERRM;
    RETURN NEXT;
  END;

  PERFORM set_config('request.jwt.claim.sub', p_farmer_id::text, true);
  BEGIN
    SELECT count(*) INTO v_count FROM public.enquiries WHERE farmer_id = p_farmer_id;
    IF v_count >= 1 THEN
      test_name := 'F9 farmer sees enquiries on products'; result := 'PASS'; detail := 'count=' || v_count;
    ELSE
      test_name := 'F9 farmer sees enquiries on products'; result := 'FAIL'; detail := 'count=' || v_count;
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'F9 farmer sees enquiries on products'; result := 'FAIL'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    UPDATE public.enquiries SET status = 'contacted' WHERE id = v_test_enquiry_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count > 0 THEN
      test_name := 'F10 farmer updates enquiry status'; result := 'PASS'; detail := 'updated to contacted';
    ELSE
      test_name := 'F10 farmer updates enquiry status'; result := 'FAIL'; detail := '0 rows';
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'F10 farmer updates enquiry status'; result := 'FAIL'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    SELECT status INTO v_status FROM public.enquiries WHERE id = v_test_enquiry_id;
    IF v_status = 'contacted' THEN
      test_name := 'F11 status update persists after refresh'; result := 'PASS'; detail := 'status=' || v_status;
    ELSE
      test_name := 'F11 status update persists after refresh'; result := 'FAIL'; detail := 'status=' || v_status;
    END IF;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'F11 status update persists after refresh'; result := 'FAIL'; detail := SQLERRM;
    RETURN NEXT;
  END;

  BEGIN
    UPDATE public.enquiries SET status = 'closed' WHERE id = v_test_enquiry_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    test_name := 'F12 farmer updates to closed'; result := CASE WHEN v_row_count > 0 THEN 'PASS' ELSE 'FAIL' END; detail := CASE WHEN v_row_count > 0 THEN 'updated' ELSE '0 rows' END;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'F12 farmer updates to closed'; result := 'FAIL'; detail := SQLERRM;
    RETURN NEXT;
  END;

  PERFORM set_config('request.jwt.claim.sub', p_buyer_id::text, true);
  BEGIN
    DELETE FROM public.enquiries WHERE id = v_test_enquiry_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    test_name := 'F13 buyer deletes own enquiry'; result := CASE WHEN v_row_count > 0 THEN 'PASS' ELSE 'FAIL' END; detail := CASE WHEN v_row_count > 0 THEN 'deleted' ELSE '0 rows' END;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'F13 buyer deletes own enquiry'; result := 'FAIL'; detail := SQLERRM;
    RETURN NEXT;
  END;

  PERFORM set_config('request.jwt.claim.sub', p_farmer_id::text, true);
  BEGIN
    DELETE FROM public.products WHERE id = v_test_product_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    test_name := 'F14 farmer deletes own product'; result := CASE WHEN v_row_count > 0 THEN 'PASS' ELSE 'FAIL' END; detail := CASE WHEN v_row_count > 0 THEN 'deleted' ELSE '0 rows' END;
    RETURN NEXT;
  EXCEPTION WHEN others THEN
    test_name := 'F14 farmer deletes own product'; result := 'FAIL'; detail := SQLERRM;
    RETURN NEXT;
  END;

  PERFORM set_config('role', 'postgres', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);
  SELECT count(*) INTO v_count FROM public.products WHERE name NOT LIKE 'FLOW_TEST%';
  IF v_count = 12 THEN
    test_name := 'F15 original 12 products intact'; result := 'PASS'; detail := 'count=' || v_count;
  ELSE
    test_name := 'F15 original 12 products intact'; result := 'FAIL'; detail := 'count=' || v_count;
  END IF;
  RETURN NEXT;

  PERFORM set_config('role', 'postgres', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public._run_flow_tests_v4(uuid, uuid) TO service_role;
