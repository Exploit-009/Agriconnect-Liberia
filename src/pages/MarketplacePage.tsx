import { useMemo, useState } from 'react';
import { SlidersHorizontal, ChevronDown, X, Search, PackageSearch } from 'lucide-react';
import type { Route } from '@/hooks/useRouter';
import type { Produce, Category, County } from '@/types';
import { CATEGORIES, COUNTIES } from '@/types';
import { ProduceCard } from '@/components/ProduceCard';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState } from '@/components/EmptyState';

interface MarketplacePageProps {
  navigate: (r: Route) => void;
  allProduce: Produce[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';

export function MarketplacePage({ navigate, allProduce, isFavorite, toggleFavorite }: MarketplacePageProps) {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedCounties, setSelectedCounties] = useState<County[]>([]);
  const [sort, setSort] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const toggleCategory = (cat: Category) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };
  const toggleCounty = (c: County) => {
    setSelectedCounties(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedCounties([]);
    setSearch('');
    setSort('newest');
  };

  const filtered = useMemo(() => {
    let result = [...allProduce];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.county.toLowerCase().includes(q) ||
        p.farmerName.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    if (selectedCounties.length > 0) {
      result = result.filter(p => selectedCounties.includes(p.county));
    }

    switch (sort) {
      case 'price-low': result.sort((a, b) => a.priceLRD - b.priceLRD); break;
      case 'price-high': result.sort((a, b) => b.priceLRD - a.priceLRD); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'newest':
      default: result.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
    }

    return result;
  }, [allProduce, search, selectedCategories, selectedCounties, sort]);

  const activeFilterCount = selectedCategories.length + selectedCounties.length;
  const hasFilters = activeFilterCount > 0 || search.trim().length > 0;

  return (
    <div className="animate-fade-in section-padding mx-auto max-w-7xl py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-forest-900 sm:text-3xl">Marketplace</h1>
        <p className="mt-1.5 text-sm text-forest-500">
          Browse fresh produce from Liberian farmers. All listings are demo data.
        </p>
      </div>

      {/* Search + sort row */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} className="w-full sm:flex-1" />
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(s => !s)}
            className={`btn-secondary flex-1 sm:flex-none ${showFilters || activeFilterCount > 0 ? 'bg-leaf-50 ring-leaf-300' : ''}`}
            aria-expanded={showFilters}
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-leaf-500 px-1 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="relative flex-1 sm:flex-none">
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="w-full appearance-none rounded-full border border-forest-200 bg-white py-3 pl-4 pr-10 text-sm font-medium text-forest-700 shadow-soft transition-colors focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
              aria-label="Sort by"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name (A–Z)</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
          </div>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="animate-slide-down mb-6 rounded-2xl border border-forest-100 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-forest-800">Filter results</h2>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs font-medium text-leaf-600 hover:text-leaf-700">
                Clear all
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="mb-5">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-forest-400">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`chip ${
                    selectedCategories.includes(cat)
                      ? 'bg-forest-600 text-white'
                      : 'bg-forest-50 text-forest-600 hover:bg-forest-100'
                  }`}
                  aria-pressed={selectedCategories.includes(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Counties */}
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-forest-400">County</p>
            <div className="flex flex-wrap gap-2">
              {COUNTIES.map(c => (
                <button
                  key={c}
                  onClick={() => toggleCounty(c)}
                  className={`chip ${
                    selectedCounties.includes(c)
                      ? 'bg-forest-600 text-white'
                      : 'bg-forest-50 text-forest-600 hover:bg-forest-100'
                  }`}
                  aria-pressed={selectedCounties.includes(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {(selectedCategories.length > 0 || selectedCounties.length > 0) && !showFilters && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {selectedCategories.map(c => (
            <button key={c} onClick={() => toggleCategory(c)} className="chip bg-forest-50 text-forest-600 hover:bg-forest-100">
              {c}
              <X size={12} />
            </button>
          ))}
          {selectedCounties.map(c => (
            <button key={c} onClick={() => toggleCounty(c)} className="chip bg-forest-50 text-forest-600 hover:bg-forest-100">
              {c}
              <X size={12} />
            </button>
          ))}
          <button onClick={clearFilters} className="text-xs font-medium text-leaf-600 hover:text-leaf-700">
            Clear all
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-forest-500">
          <span className="font-semibold text-forest-700">{filtered.length}</span> {filtered.length === 1 ? 'result' : 'results'}
        </p>
      </div>

      {/* Results grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(p => (
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
        <EmptyState
          icon={<PackageSearch size={28} />}
          title="No produce found"
          message={hasFilters
            ? "Try adjusting your search or filters to find what you're looking for."
            : "There are no listings to display yet."}
          action={
            hasFilters ? (
              <button onClick={clearFilters} className="btn-primary">
                <X size={16} />
                Clear filters
              </button>
            ) : (
              <button onClick={() => navigate({ name: 'list-produce' })} className="btn-primary">
                <Search size={16} />
                List produce
              </button>
            )
          }
        />
      )}
    </div>
  );
}
