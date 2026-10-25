import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { safeSupabaseCall } from '@/lib/supabaseError';
import type { Payment, PaymentInput, PaymentStatus } from '@/types';

export function usePayments(userId: string | null) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    if (!userId) {
      setPayments([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await safeSupabaseCall(
        supabase
          .from('payments')
          .select(`
            *,
            enquiry:enquiries(
              *,
              product:products(*),
              buyer:profiles!enquiries_buyer_id_fkey(*)
            )
          `)
          .or(`buyer_id.eq.${userId},farmer_id.eq.${userId}`)
          .order('created_at', { ascending: false }),
      );
      if (err) {
        setError(err.message);
      } else {
        setPayments(data as Payment[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments.');
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const createPayment = useCallback(async (
    input: PaymentInput,
    buyerId: string,
  ): Promise<{ error: string | null }> => {
    if (!userId) return { error: 'You must be signed in.' };
    if (input.agreed_amount_lrd <= 0) return { error: 'Amount must be greater than zero.' };
    if (buyerId !== userId) return { error: 'You can only create payments for your own enquiries.' };
    try {
      const { error: err } = await safeSupabaseCall(
        supabase.from('payments').insert({
          enquiry_id: input.enquiry_id,
          buyer_id: buyerId,
          farmer_id: input.farmer_id,
          agreed_amount_lrd: input.agreed_amount_lrd,
          provider: input.provider,
          status: 'not_started' as PaymentStatus,
        }),
      );
      if (err) return { error: err.message };
      await fetchPayments();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to create payment record.' };
    }
  }, [userId, fetchPayments]);

  const reportPayment = useCallback(async (
    paymentId: string,
    transactionReference: string | null,
  ): Promise<{ error: string | null }> => {
    try {
      const { error: err } = await safeSupabaseCall(
        supabase
          .from('payments')
          .update({
            status: 'reported' as PaymentStatus,
            transaction_reference: transactionReference,
            buyer_reported_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentId),
      );
      if (err) return { error: err.message };
      await fetchPayments();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to report payment.' };
    }
  }, [fetchPayments]);

  const confirmPayment = useCallback(async (paymentId: string): Promise<{ error: string | null }> => {
    try {
      const { error: err } = await safeSupabaseCall(
        supabase
          .from('payments')
          .update({
            status: 'confirmed' as PaymentStatus,
            farmer_confirmed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentId),
      );
      if (err) return { error: err.message };
      await fetchPayments();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to confirm payment.' };
    }
  }, [fetchPayments]);

  const disputePayment = useCallback(async (
    paymentId: string,
    disputeNote: string | null,
  ): Promise<{ error: string | null }> => {
    try {
      const { error: err } = await safeSupabaseCall(
        supabase
          .from('payments')
          .update({
            status: 'disputed' as PaymentStatus,
            disputed_at: new Date().toISOString(),
            dispute_note: disputeNote,
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentId),
      );
      if (err) return { error: err.message };
      await fetchPayments();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to dispute payment.' };
    }
  }, [fetchPayments]);

  const cancelPayment = useCallback(async (paymentId: string): Promise<{ error: string | null }> => {
    try {
      const { error: err } = await safeSupabaseCall(
        supabase
          .from('payments')
          .update({
            status: 'cancelled' as PaymentStatus,
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentId),
      );
      if (err) return { error: err.message };
      await fetchPayments();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to cancel payment.' };
    }
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    fetchPayments,
    createPayment,
    reportPayment,
    confirmPayment,
    disputePayment,
    cancelPayment,
  };
}
