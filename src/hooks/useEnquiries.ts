import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { safeSupabaseCall } from '@/lib/supabaseError';
import type { Enquiry, EnquiryInput, EnquiryStatus } from '@/types';

export function useEnquiries(userId: string | null) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEnquiries = useCallback(async () => {
    if (!userId) {
      setEnquiries([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await safeSupabaseCall(
        supabase
          .from('enquiries')
          .select(`
            *,
            product:products(*),
            buyer:profiles!enquiries_buyer_id_fkey(*)
          `)
          .order('created_at', { ascending: false }),
      );
      if (err) {
        setError(err.message);
      } else {
        setEnquiries(data as Enquiry[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load enquiries.');
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const createEnquiry = useCallback(async (
    input: EnquiryInput,
    buyerId: string,
  ): Promise<{ error: string | null }> => {
    try {
      const { error: err } = await safeSupabaseCall(
        supabase.from('enquiries').insert({
          ...input,
          buyer_id: buyerId,
        }),
      );
      if (err) return { error: err.message };
      await fetchEnquiries();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to send enquiry.' };
    }
  }, [fetchEnquiries]);

  const updateEnquiryStatus = useCallback(async (
    id: string,
    status: EnquiryStatus,
  ): Promise<{ error: string | null }> => {
    try {
      const { error: err } = await safeSupabaseCall(
        supabase
          .from('enquiries')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id),
      );
      if (err) return { error: err.message };
      await fetchEnquiries();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to update enquiry.' };
    }
  }, [fetchEnquiries]);

  const deleteEnquiry = useCallback(async (id: string): Promise<{ error: string | null }> => {
    try {
      const { error: err } = await safeSupabaseCall(
        supabase.from('enquiries').delete().eq('id', id),
      );
      if (err) return { error: err.message };
      await fetchEnquiries();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to delete enquiry.' };
    }
  }, [fetchEnquiries]);

  return { enquiries, loading, error, fetchEnquiries, createEnquiry, updateEnquiryStatus, deleteEnquiry };
}
