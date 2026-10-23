import { useState } from 'react';
import { ArrowLeft, Heart, MapPin, User, Calendar, Package, MessageCircle, ChevronLeft, ChevronRight, Truck } from 'lucide-react';
import type { Route } from '@/hooks/useRouter';
import type { Produce } from '@/types';
import { formatLRD, formatDate, availabilityColor } from '@/lib/utils';
import { DemoBadge } from '@/components/DemoBadge';
import { EmptyState } from '@/components/EmptyState';

interface ProductDetailPageProps {
  navigate: (r: Route) => void;
  produce: Produce | undefined;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

export function ProductDetailPage({ navigate, produce, isFavorite, toggleFavorite }: ProductDetailPageProps) {
  const [imageIndex, setImageIndex] = useState(0);

  if (!produce) {
    return (
      <div className="section-padding mx-auto max-w-7xl py-12">
        <EmptyState
          icon={<Package size={28} />}
          title="Listing not found"
          message="This produce listing may have been removed or does not exist."
          action={<button onClick={() => navigate({ name: 'marketplace' })} className="btn-primary">Back to marketplace</button>}
        />
      </div>
    );
  }

  const fav = isFavorite(produce.id);
  const nextImage = () => setImageIndex(i => (i + 1) % produce.images.length);
  const prevImage = () => setImageIndex(i => (i - 1 + produce.images.length) % produce.images.length);

  return (
    <div className="animate-fade-in section-padding mx-auto max-w-5xl py-6">
      {/* Breadcrumb */}
      <button onClick={() => navigate({ name: 'marketplace' })} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-forest-500 transition-colors hover:text-forest-700">
        <ArrowLeft size={16} />
        Back to marketplace
      </button>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Image gallery */}
        <div>
          <div className="relative overflow-hidden rounded-2xl shadow-card">
            <img
              src={produce.images[imageIndex]}
              alt={produce.name}
              className="h-72 w-full object-cover sm:h-96"
            />
            {produce.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} className="text-forest-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} className="text-forest-700" />
                </button>
              </>
            )}
            <div className="absolute left-3 top-3">
              <span className={`chip ${availabilityColor(produce.availability)} backdrop-blur-sm`}>
                {produce.availability}
              </span>
            </div>
          </div>
          {produce.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {produce.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  className={`h-16 w-20 overflow-hidden rounded-lg border-2 transition-all ${
                    i === imageIndex ? 'border-leaf-500' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img} alt={`${produce.name} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className="chip bg-leaf-50 text-leaf-700">{produce.category}</span>
            {produce.isDemoData && <DemoBadge />}
            {produce.userCreated && <DemoBadge label="User listing" />}
          </div>

          <h1 className="font-display text-2xl font-bold text-forest-900 sm:text-3xl">{produce.name}</h1>

          <p className="mt-4 text-3xl font-bold text-forest-700">{formatLRD(produce.priceLRD)}</p>
          <p className="text-sm text-forest-400">per {produce.unit}</p>

          {/* Info grid */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-forest-50 p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-forest-400"><MapPin size={13} /> County</p>
              <p className="mt-1 text-sm font-semibold text-forest-800">{produce.county}</p>
            </div>
            <div className="rounded-xl bg-forest-50 p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-forest-400"><Package size={13} /> Quantity</p>
              <p className="mt-1 text-sm font-semibold text-forest-800">{produce.quantityAvailable} {produce.unit}s</p>
            </div>
            <div className="rounded-xl bg-forest-50 p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-forest-400"><Calendar size={13} /> Harvested</p>
              <p className="mt-1 text-sm font-semibold text-forest-800">{formatDate(produce.harvestDate)}</p>
            </div>
            <div className="rounded-xl bg-forest-50 p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-forest-400"><Truck size={13} /> Availability</p>
              <p className="mt-1 text-sm font-semibold text-forest-800">{produce.availability}</p>
            </div>
          </div>

          {/* Farmer link */}
          <button
            onClick={() => navigate({ name: 'farmer', id: produce.farmerId })}
            className="mt-4 flex items-center gap-3 rounded-xl border border-forest-100 p-3 text-left transition-colors hover:bg-forest-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf-100 text-leaf-600">
              <User size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-forest-800">{produce.farmerName}</p>
              <p className="text-xs text-forest-400">View farmer profile</p>
            </div>
          </button>

          {/* Description */}
          <div className="mt-4">
            <h2 className="mb-1.5 text-sm font-semibold text-forest-800">About this produce</h2>
            <p className="text-sm leading-relaxed text-forest-600">{produce.description}</p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button onClick={() => navigate({ name: 'enquiry', id: produce.id })} className="btn-primary flex-1 text-base">
              <MessageCircle size={18} />
              Send enquiry
            </button>
            <button
              onClick={() => toggleFavorite(produce.id)}
              className={`flex h-12 w-12 items-center justify-center rounded-full shadow-soft transition-all active:scale-95 ${
                fav ? 'bg-gold-50 ring-2 ring-gold-400' : 'bg-white ring-1 ring-forest-200'
              }`}
              aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={fav}
            >
              <Heart size={20} className={fav ? 'fill-gold-500 text-gold-500' : 'text-forest-400'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
