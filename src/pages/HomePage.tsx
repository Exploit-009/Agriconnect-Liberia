import { Search, ArrowRight, Sprout, Handshake, ShoppingBasket, Store, MapPin, TrendingUp } from 'lucide-react';
import type { Route } from '@/hooks/useRouter';
import type { Produce } from '@/types';
import { CATEGORIES, COUNTIES } from '@/types';
import { ProduceCard } from '@/components/ProduceCard';
import { CategoryIcon } from '@/components/CategoryIcon';
import { DemoBadge } from '@/components/DemoBadge';

interface HomePageProps {
  navigate: (r: Route) => void;
  allProduce: Produce[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

export function HomePage({ navigate, allProduce, isFavorite, toggleFavorite }: HomePageProps) {
  const featured = allProduce.slice(0, 6);
  const heroImage = 'https://images.pexels.com/photos/34411687/pexels-photo-34411687.jpeg?auto=compress&cs=tinysrgb&h=800&w=1200';

  return (
    <div className="animate-fade-in overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden bg-forest-700">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Farmer working in field" className="h-full w-full object-cover opacity-25" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-800/70 via-forest-700/80 to-forest-800/90" />
        </div>
        <div className="relative section-padding mx-auto max-w-7xl py-10 sm:py-16 lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2">
              <DemoBadge label="Prototype • Demo data" />
            </div>
            <h1 className="font-display text-2xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Connecting Liberian farmers with buyers, direct from the field.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-forest-100 sm:text-lg">
              Browse fresh produce from across Liberia's counties. Rice from Margibi, cassava from Bong, cocoa from Nimba — all in one marketplace.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigate({ name: 'marketplace' })} className="btn-gold text-base">
                <ShoppingBasket size={18} />
                Browse produce
              </button>
              <button onClick={() => navigate({ name: 'list-produce' })} className="btn-secondary bg-white/10 text-white ring-white/30 hover:bg-white/20">
                <Sprout size={18} />
                List your produce
              </button>
            </div>

            {/* Quick stats */}
            <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4 max-w-md">
              <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-sm sm:p-3">
                <p className="text-xl font-bold text-leaf-300 sm:text-2xl">{allProduce.length}+</p>
                <p className="text-[11px] text-forest-200 sm:text-xs">Listings</p>
              </div>
              <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-sm sm:p-3">
                <p className="text-xl font-bold text-leaf-300 sm:text-2xl">{COUNTIES.length}</p>
                <p className="text-[11px] text-forest-200 sm:text-xs">Counties</p>
              </div>
              <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-sm sm:p-3">
                <p className="text-xl font-bold text-leaf-300 sm:text-2xl">{CATEGORIES.length}</p>
                <p className="text-[11px] text-forest-200 sm:text-xs">Categories</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search bar */}
      <section className="section-padding mx-auto max-w-7xl -mt-6 relative z-10 sm:-mt-8">
        <div className="card p-2">
          <button
            onClick={() => navigate({ name: 'marketplace' })}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm text-forest-400 transition-colors hover:bg-forest-50"
          >
            <Search size={20} className="text-forest-400" />
            Search for rice, cassava, cocoa, plantain...
            <ArrowRight size={18} className="ml-auto text-forest-400" />
          </button>
        </div>
      </section>

      {/* Popular categories */}
      <section className="section-padding mx-auto max-w-7xl mt-10 sm:mt-12">
        <div className="mb-5 flex items-end justify-between sm:mb-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-forest-900 sm:text-2xl">Popular categories</h2>
            <p className="mt-1 text-sm text-forest-500">Explore produce by type</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 sm:grid-cols-4 lg:grid-cols-9">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => navigate({ name: 'marketplace' })}
              className="card group flex flex-col items-center gap-2 p-4 hover:shadow-card-hover"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-leaf-50 text-leaf-600 transition-colors group-hover:bg-leaf-100">
                <CategoryIcon category={cat} size={22} />
              </span>
              <span className="text-center text-xs font-medium text-forest-700">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured produce */}
      <section className="section-padding mx-auto max-w-7xl mt-12 sm:mt-14">
        <div className="mb-5 flex items-end justify-between sm:mb-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-forest-900 sm:text-2xl">Featured produce</h2>
            <p className="mt-1 text-sm text-forest-500">Fresh from Liberian farms — demo data</p>
          </div>
          <button onClick={() => navigate({ name: 'marketplace' })} className="btn-ghost text-leaf-600 hover:bg-leaf-50 flex-shrink-0">
            <span className="hidden sm:inline">View all</span>
            <span className="sm:hidden">All</span>
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map(p => (
            <ProduceCard
              key={p.id}
              produce={p}
              navigate={navigate}
              isFavorite={isFavorite(p.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding mx-auto max-w-7xl mt-14 sm:mt-16">
        <div className="rounded-3xl bg-forest-50 p-5 sm:p-8 lg:p-12">
          <h2 className="text-center font-display text-xl font-semibold text-forest-900 sm:text-2xl">How it works</h2>
          <p className="mt-2 text-center text-sm text-forest-500">Three simple steps to connect farmers and buyers</p>
          <div className="mt-8 grid gap-6 sm:gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-100 text-forest-600">
                <Sprout size={26} />
              </div>
              <h3 className="mb-1.5 font-display text-base font-semibold text-forest-800">1. Farmers list produce</h3>
              <p className="text-sm text-forest-500">Farmers share what they have, how much, and where it's grown.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-600">
                <Search size={26} />
              </div>
              <h3 className="mb-1.5 font-display text-base font-semibold text-forest-800">2. Buyers browse & search</h3>
              <p className="text-sm text-forest-500">Buyers search by crop, county, or farmer to find what they need.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-100 text-cream-700">
                <Handshake size={26} />
              </div>
              <h3 className="mb-1.5 font-display text-base font-semibold text-forest-800">3. Send an enquiry</h3>
              <p className="text-sm text-forest-500">Buyers send an enquiry directly to the farmer. No middleman needed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Counties */}
      <section className="section-padding mx-auto max-w-7xl mt-12 sm:mt-14">
        <div className="mb-5 sm:mb-6">
          <h2 className="font-display text-lg font-semibold text-forest-900 sm:text-2xl">Produce by county</h2>
          <p className="mt-1 text-sm text-forest-500">Discover produce from different regions of Liberia</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {COUNTIES.map(county => {
            const count = allProduce.filter(p => p.county === county).length;
            return (
              <button
                key={county}
                onClick={() => navigate({ name: 'marketplace' })}
                className="card group flex items-center gap-3 p-4 hover:shadow-card-hover"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-forest-50 text-forest-500">
                  <MapPin size={18} />
                </span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-forest-800">{county}</p>
                  <p className="text-xs text-forest-400">{count} listings</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding mx-auto max-w-7xl mt-14 sm:mt-16">
        <div className="overflow-hidden rounded-3xl bg-forest-700 px-5 py-10 text-center sm:px-12 sm:py-16">
          <TrendingUp size={32} className="mx-auto mb-4 text-leaf-400" />
          <h2 className="font-display text-xl font-bold text-white sm:text-3xl">Ready to explore the marketplace?</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-forest-100">
            Browse fresh produce from across Liberia. This is a prototype — all data is for demonstration.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={() => navigate({ name: 'marketplace' })} className="btn-gold text-base">
              <Store size={18} />
              Browse produce
            </button>
            <button onClick={() => navigate({ name: 'about' })} className="btn-secondary bg-white/10 text-white ring-white/30 hover:bg-white/20">
              Learn about this project
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
