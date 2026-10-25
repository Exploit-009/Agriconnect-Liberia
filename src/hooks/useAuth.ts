import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { safeSupabaseCall } from '@/lib/supabaseError';
import type { Profile, UserRole } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to load profile:', error.message);
      return null;
    }
    return data as Profile;
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadProfile(currentUser.id).then((p) => {
          if (mounted) {
            setProfile(p);
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true);
      }
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        (async () => {
          const p = await loadProfile(currentUser.id);
          if (mounted) setProfile(p);
          if (mounted) setLoading(false);
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    role: UserRole,
    fullName: string,
    county: string,
    phone: string,
  ): Promise<{ error: string | null }> => {
    const { error } = await safeSupabaseCall(
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, county, phone, role },
          emailRedirectTo: window.location.origin,
        },
      }),
    );

    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signIn = useCallback(async (
    email: string,
    password: string,
  ): Promise<{ error: string | null }> => {
    const { error } = await safeSupabaseCall(
      supabase.auth.signInWithPassword({ email, password }),
    );
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await safeSupabaseCall(supabase.auth.signOut());
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await loadProfile(user.id);
      setProfile(p);
    }
  }, [user, loadProfile]);

  const updatePassword = useCallback(async (newPassword: string): Promise<{ error: string | null }> => {
    const { error } = await safeSupabaseCall(
      supabase.auth.updateUser({ password: newPassword }),
    );
    if (error) return { error: error.message };
    setPasswordRecovery(false);
    return { error: null };
  }, []);

  return { user, profile, loading, passwordRecovery, signUp, signIn, signOut, refreshProfile, updatePassword };
}
