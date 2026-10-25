import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { safeSupabaseCall } from '@/lib/supabaseError';
import type { Product, ProductInput } from '@/types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await safeSupabaseCall(
        supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false }),
      );
      if (err) {
        setError(err.message);
      } else {
        setProducts((data as Product[]) ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(async (
    input: ProductInput,
    farmerId: string,
    farmerName: string,
  ): Promise<{ error: string | null }> => {
    try {
      const { error: err } = await safeSupabaseCall(
        supabase.from('products').insert({
          ...input,
          farmer_id: farmerId,
          farmer_name: farmerName,
        }),
      );
      if (err) return { error: err.message };
      await fetchProducts();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to add product.' };
    }
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (id: string): Promise<{ error: string | null }> => {
    try {
      const { error: err } = await safeSupabaseCall(
        supabase.from('products').delete().eq('id', id),
      );
      if (err) return { error: err.message };
      await fetchProducts();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to delete product.' };
    }
  }, [fetchProducts]);

  return { products, loading, error, fetchProducts, addProduct, deleteProduct };
}
