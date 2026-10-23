import { useCallback, useEffect, useState } from 'react';
import type { Produce } from '@/types';
import { demoProduce } from '@/data';

const STORAGE_KEY = 'agriconnect_user_listings';
const removedKey = 'agriconnect_removed_listings';

const storageAvailable = (() => {
  try {
    const test = '__test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
})();

function loadUserListings(): Produce[] {
  if (!storageAvailable) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as Produce[] : [];
  } catch {
    return [];
  }
}

function loadRemovedIds(): string[] {
  if (!storageAvailable) return [];
  try {
    const raw = window.localStorage.getItem(removedKey);
    return raw ? JSON.parse(raw) as string[] : [];
  } catch {
    return [];
  }
}

export function useListings() {
  const [userListings, setUserListings] = useState<Produce[]>(loadUserListings);
  const [removedIds, setRemovedIds] = useState<string[]>(loadRemovedIds);

  useEffect(() => {
    if (!storageAvailable) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userListings));
    } catch { /* ignore */ }
  }, [userListings]);

  useEffect(() => {
    if (!storageAvailable) return;
    try {
      window.localStorage.setItem(removedKey, JSON.stringify(removedIds));
    } catch { /* ignore */ }
  }, [removedIds]);

  const allProduce: Produce[] = [
    ...userListings,
    ...demoProduce.filter(p => !removedIds.includes(p.id)),
  ];

  const addListing = useCallback((produce: Produce) => {
    setUserListings(prev => [produce, ...prev]);
  }, []);

  const removeListing = useCallback((id: string) => {
    setUserListings(prev => prev.filter(p => p.id !== id));
    setRemovedIds(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const restoreListing = useCallback((id: string) => {
    setRemovedIds(prev => prev.filter(rid => rid !== id));
  }, []);

  const getProduceById = useCallback((id: string): Produce | undefined =>
    allProduce.find(p => p.id === id),
  [allProduce]);

  return { allProduce, addListing, removeListing, restoreListing, getProduceById, removedIds, userListings };
}
