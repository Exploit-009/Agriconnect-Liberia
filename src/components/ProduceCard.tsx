import { Heart, MapPin, User } from 'lucide-react';
import type { Produce } from '@/types';
import type { Route } from '@/hooks/useRouter';
import { formatLRD, formatDate, availabilityColor } from '@/lib/utils';

interface ProduceCardProps {
  produce: Produce;
  navigate: (r: Route) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export function ProduceCard({ produce, navigate, isFavorite, onToggleFavorite }: ProduceCardProps) {
  return (
    <article
      className="card group cursor-pointer overflow-hidden hover:shadow-card-hover"
      onClick={() => navigate({ name: 'product', id: produce.id })}
      role="article"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate({ name: 'product', id: produce.id });
        }
      }}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden sm:h-48">
        <img
          src={produce.images[0]}
          alt={produce.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex gap-1.5">
          <span className={`chip ${availabilityColor(produce.availability)} backdrop-blur-sm`}>
            {produce.availability}
          </span>
        </div>
        <button
          onClick={e => {
            e.stopPropagation();
            onToggleFavorite(produce.id);
          }}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorite}
        >
          <Heart
            size={18}
            className={isFavorite ? 'fill-gold-500 text-gold-500' : 'text-forest-400'}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="chip bg-leaf-50 text-leaf-700">{produce.category}</span>
        </div>
        <h3 className="mb-1.5 line-clamp-1 font-display text-base font-semibold text-forest-900">
          {produce.name}
        </h3>
        <div className="mb-3 flex flex-col gap-1 text-xs text-forest-500">
          <span className="flex items-center gap-1">
            <MapPin size={12} className="flex-shrink-0" />
            {produce.county}
          </span>
          <span className="flex items-center gap-1">
            <User size={12} className="flex-shrink-0" />
            {produce.farmerName}
          </span>
        </div>

        <div className="flex items-end justify-between border-t border-forest-50 pt-3">
          <div>
            <p className="text-lg font-bold text-forest-700">{formatLRD(produce.priceLRD)}</p>
            <p className="text-xs text-forest-400">per {produce.unit}</p>
          </div>
          <div className="text-right text-xs text-forest-400">
            <p>{produce.quantityAvailable} {produce.unit}s</p>
            <p>Harvested {formatDate(produce.harvestDate)}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
