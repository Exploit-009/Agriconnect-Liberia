/*
# Phase 6: Narrow farmer_payment_profiles SELECT policy

## Problem
The existing `fpp_select_owner_or_related_buyer` policy allows any buyer who has
ANY enquiry with a farmer — including 'pending' enquiries that the farmer has not
yet acknowledged — to see that farmer's mobile money number and payment
instructions. The requirement states that payment details should only be visible
to a buyer "after an enquiry is accepted or the farmer agrees to the transaction."

## Fix
Narrow the SELECT policy so that a buyer can only see a farmer's payment profiles
when they have an enquiry with that farmer whose status is 'contacted' or 'closed'.
A 'pending' enquiry (farmer has not responded) will NOT grant access to payment
details.

This is a strict narrowing — it reduces access, never increases it. No existing
data is changed. No other policies are affected.

## Rationale
The existing enquiry status model is: 'pending' (buyer sent, farmer hasn't
responded), 'contacted' (farmer acknowledged and engaged), 'closed' (transaction
concluded). 'contacted' is the closest existing equivalent to "farmer agrees to
the transaction." No new status is invented.

## No data changes
No rows inserted, updated, or deleted. Only one policy is dropped and recreated.
*/

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
      AND e.status IN ('contacted', 'closed')
  )
);
