import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { safeSupabaseCall } from '@/lib/supabaseError';
import type { FarmerPaymentProfile, PaymentProvider } from '@/types';

export function useFarmerPaymentProfiles(farmerId: string | null) {
  const [profiles, setProfiles] = useState<FarmerPaymentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    if (!farmerId) {
      setProfiles([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await safeSupabaseCall(
        supabase
          .from('farmer_payment_profiles')
          .select('*')
          .eq('farmer_id', farmerId)
          .order('created_at', { ascending: true }),
      );
      if (err) {
        setError(err.message);
      } else {
        setProfiles(data as FarmerPaymentProfile[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment profiles.');
    }
    setLoading(false);
  }, [farmerId]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const upsertProfile = useCallback(async (
    provider: PaymentProvider,
    mobileMoneyNumber: string,
    recipientName: string,
    paymentInstructions: string | null,
  ): Promise<{ error: string | null }> => {
    if (!farmerId) return { error: 'You must be signed in.' };
    try {
      const { data: existing } = await safeSupabaseCall(
        supabase
          .from('farmer_payment_profiles')
          .select('id')
          .eq('farmer_id', farmerId)
          .eq('provider', provider)
          .maybeSingle(),
      );

      if (existing) {
        const { error: err } = await safeSupabaseCall(
          supabase
            .from('farmer_payment_profiles')
            .update({
              mobile_money_number: mobileMoneyNumber,
              recipient_name: recipientName,
              payment_instructions: paymentInstructions,
              updated_at: new Date().toISOString(),
            })
            .eq('id', (existing as { id: string }).id),
        );
        if (err) return { error: err.message };
      } else {
        const { error: err } = await safeSupabaseCall(
          supabase.from('farmer_payment_profiles').insert({
            farmer_id: farmerId,
            provider,
            mobile_money_number: mobileMoneyNumber,
            recipient_name: recipientName,
            payment_instructions: paymentInstructions,
          }),
        );
        if (err) return { error: err.message };
      }
      await fetchProfiles();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to save payment profile.' };
    }
  }, [farmerId, fetchProfiles]);

  const toggleActive = useCallback(async (id: string, isActive: boolean): Promise<{ error: string | null }> => {
    try {
      const { error: err } = await safeSupabaseCall(
        supabase
          .from('farmer_payment_profiles')
          .update({ is_active: isActive, updated_at: new Date().toISOString() })
          .eq('id', id),
      );
      if (err) return { error: err.message };
      await fetchProfiles();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to update payment profile.' };
    }
  }, [fetchProfiles]);

  const deleteProfile = useCallback(async (id: string): Promise<{ error: string | null }> => {
    try {
      const { error: err } = await safeSupabaseCall(
        supabase.from('farmer_payment_profiles').delete().eq('id', id),
      );
      if (err) return { error: err.message };
      await fetchProfiles();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to delete payment profile.' };
    }
  }, [fetchProfiles]);

  return { profiles, loading, error, fetchProfiles, upsertProfile, toggleActive, deleteProfile };
}
