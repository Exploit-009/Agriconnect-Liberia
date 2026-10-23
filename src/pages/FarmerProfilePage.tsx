import { ArrowLeft, MapPin, Sprout, Calendar, Package } from 'lucide-react';
import type { Route } from '@/hooks/useRouter';
import type { Produce, Farmer } from '@/types';
import { ProduceCard } from '@/components/ProduceCard';
import { DemoBadge } from '@/components/DemoBadge';
import { EmptyState } from '@/components/EmptyState';

interface FarmerProfilePageProps {
  navigate: (r: Route) => void;
  farmer: Farmer | undefined;
  allProduce: Produce[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

export function FarmerProfilePage({ navigate, farmer, allProduce, isFavorite, toggleFavorite }: FarmerProfilePageProps) {
  if (!farmer) {
    return (
      <div className="section-padding mx-auto max-w-7xl py-12">
        <EmptyState
          icon={<Sprout size={28} />}
          title="Farmer not found"
          message="This farmer profile may not exist."
          action={<button onClick={() => navigate({ name: 'marketplace' })} className="btn-primary">Back to marketplace</button>}
        />
      </div>
    );
  }

  const farmerProduce = allProduce.filter(p => p.farmerId === farmer.id);

  return (
    <div className="animate-fade-in section-padding mx-auto max-w-5xl py-6">
      <button onClick={() => navigate({ name: 'marketplace' })} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-forest-500 transition-colors hover:text-forest-700">
        <ArrowLeft size={16} />
        Back to marketplace
      </button>

      {/* Profile header */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="h-32 bg-gradient-to-r from-forest-600 to-leaf-500 sm:h-40" />
        <div className="section-padding mx-auto max-w-5xl px-4 pb-6 sm:px-6">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end">
            <img
              src={farmer.image}
              alt={farmer.name}
              className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-md sm:h-28 sm:w-28"
            />
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-xl font-bold text-forest-900 sm:text-2xl">{farmer.name}</h1>
                {farmer.isDemoData && <DemoBadge />}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-forest-500">
                <MapPin size={14} />
                {farmer.village}, {farmer.county} County
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-forest-50 p-3 text-center">
              <Calendar size={16} className="mx-auto mb-1 text-forest-400" />
              <p className="text-lg font-bold text-forest-700">{farmer.yearsFarming}</p>
              <p className="text-xs text-forest-400">Years farming</p>
            </div>
            <div className="rounded-xl bg-forest-50 p-3 text-center">
              <Sprout size={16} className="mx-auto mb-1 text-forest-400" />
              <p className="text-lg font-bold text-forest-700">{farmer.specialties.length}</p>
              <p className="text-xs text-forest-400">Specialties</p>
            </div>
            <div className="rounded-xl bg-forest-50 p-3 text-center">
              <Package size={16} className="mx-auto mb-1 text-forest-400" />
              <p className="text-lg font-bold text-forest-700">{farmerProduce.length}</p>
              <p className="text-xs text-forest-400">Active listings</p>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-forest-800">About the farmer</h2>
            <p className="text-sm leading-relaxed text-forest-600">{farmer.bio}</p>
          </div>

          {/* Specialties */}
          <div className="mt-4">
            <h2 className="mb-2 text-sm font-semibold text-forest-800">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {farmer.specialties.map(s => (
                <span key={s} className="chip bg-leaf-50 text-leaf-700">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Farmer's produce */}
      <div className="mt-8">
        <h2 className="mb-4 font-display text-lg font-semibold text-forest-900">Produce from this farmer</h2>
        {farmerProduce.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {farmerProduce.map(p => (
              <ProduceCard
                key={p.id}
                produce={p}
                navigate={navigate}
                isFavorite={isFavorite(p.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-forest-500">No active listings from this farmer.</p>
        )}
      </div>
    </div>
  );
}
