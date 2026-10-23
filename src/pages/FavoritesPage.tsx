import { Heart, Store } from 'lucide-react';
import type { Route } from '@/hooks/useRouter';
import type { Produce } from '@/types';
import { ProduceCard } from '@/components/ProduceCard';
import { EmptyState } from '@/components/EmptyState';

interface FavoritesPageProps {
  navigate: (r: Route) => void;
  allProduce: Produce[];
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  storageAvailable: boolean;
}

export function FavoritesPage({ navigate, allProduce, favorites, isFavorite, toggleFavorite, storageAvailable }: FavoritesPageProps) {
  const favProduce = allProduce.filter(p => favorites.includes(p.id));

  return (
    <div className="animate-fade-in section-padding mx-auto max-w-7xl py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-forest-900 sm:text-3xl">Your favorites</h1>
        <p className="mt-1.5 text-sm text-forest-500">
          {storageAvailable
            ? 'Saved listings are stored in your browser and persist across visits.'
            : 'Browser storage is unavailable — favorites will not persist after page reload.'}
        </p>
      </div>

      {favProduce.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-forest-500">
            <span className="font-semibold text-forest-700">{favProduce.length}</span> saved {favProduce.length === 1 ? 'listing' : 'listings'}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favProduce.map(p => (
              <ProduceCard
                key={p.id}
                produce={p}
                navigate={navigate}
                isFavorite={isFavorite(p.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<Heart size={28} />}
          title="No favorites yet"
          message="Tap the heart icon on any listing to save it here for quick access later."
          action={<button onClick={() => navigate({ name: 'marketplace' })} className="btn-primary"><Store size={16} /> Browse produce</button>}
        />
      )}
    </div>
  );
}
