import { useState } from 'react';
import { LayoutDashboard, Trash2, RotateCcw, Search, ShieldCheck, Package } from 'lucide-react';
import type { Produce } from '@/types';
import { formatLRD, formatDate } from '@/lib/utils';
import { DemoBadge } from '@/components/DemoBadge';
import { EmptyState } from '@/components/EmptyState';

interface ModerationPageProps {
  allProduce: Produce[];
  removeListing: (id: string) => void;
  restoreListing: (id: string) => void;
  removedIds: string[];
}

export function ModerationPage({ allProduce, removeListing, restoreListing, removedIds }: ModerationPageProps) {
  const [search, setSearch] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = allProduce.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.farmerName.toLowerCase().includes(search.toLowerCase()) ||
    p.county.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in section-padding mx-auto max-w-4xl py-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-100 text-forest-600">
            <LayoutDashboard size={20} />
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold text-forest-900 sm:text-3xl">Moderation panel</h1>
        <p className="mt-1.5 text-sm text-forest-500">
          Demonstration panel for reviewing and removing listings. Changes are stored locally in your browser.
        </p>
      </div>

      {/* Notice */}
      <div className="mb-6 flex items-start gap-3 rounded-xl bg-forest-50 p-4">
        <ShieldCheck size={18} className="mt-0.5 flex-shrink-0 text-forest-500" />
        <p className="text-xs leading-relaxed text-forest-600">
          This is a demo moderation interface. In a real platform, this would be restricted to trained moderators with proper authentication and audit logging. Removing a listing here only affects your local browser — other users would not be affected in this prototype.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search listings to moderate..."
          className="w-full rounded-full border border-forest-200 bg-white py-3 pl-11 pr-4 text-sm shadow-soft focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
          aria-label="Search listings"
        />
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white p-3 text-center shadow-soft">
          <p className="text-2xl font-bold text-forest-700">{allProduce.length}</p>
          <p className="text-xs text-forest-400">Active listings</p>
        </div>
        <div className="rounded-xl bg-white p-3 text-center shadow-soft">
          <p className="text-2xl font-bold text-cream-700">{allProduce.filter(p => p.userCreated).length}</p>
          <p className="text-xs text-forest-400">User-created</p>
        </div>
        <div className="rounded-xl bg-white p-3 text-center shadow-soft">
          <p className="text-2xl font-bold text-red-500">{removedIds.length}</p>
          <p className="text-xs text-forest-400">Removed</p>
        </div>
      </div>

      {/* Active listings */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-forest-400">Active listings</h2>
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package size={28} />}
          title="No listings found"
          message={search ? "No listings match your search." : "There are no active listings to moderate."}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <div key={p.id} className="card flex items-center gap-3 p-3 sm:p-4">
              <img src={p.images[0]} alt={p.name} className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="truncate text-sm font-semibold text-forest-800">{p.name}</h3>
                  {p.userCreated && <DemoBadge label="User listing" />}
                </div>
                <p className="truncate text-xs text-forest-400">
                  {p.farmerName} • {p.county} • {formatLRD(p.priceLRD)} / {p.unit}
                </p>
                <p className="text-xs text-forest-300">Listed {formatDate(p.createdAt)}</p>
              </div>
              {confirmId === p.id ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { removeListing(p.id); setConfirmId(null); }}
                    className="rounded-full bg-red-500 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-red-600"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="rounded-full bg-forest-50 px-3 py-2 text-xs font-medium text-forest-600 transition-colors hover:bg-forest-100"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(p.id)}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 transition-colors hover:bg-red-100"
                  aria-label={`Remove ${p.name}`}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Removed listings */}
      {removedIds.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-forest-400">Removed listings ({removedIds.length})</h2>
          <div className="rounded-2xl border border-forest-100 bg-forest-50/50 p-4">
            <p className="mb-3 text-xs text-forest-500">These listings have been removed from the marketplace. You can restore them.</p>
            <div className="space-y-2">
              {removedIds.map(id => (
                <div key={id} className="flex items-center justify-between rounded-lg bg-white px-4 py-2.5 shadow-soft">
                  <span className="text-sm text-forest-500">Listing ID: <code className="text-xs text-forest-400">{id}</code></span>
                  <button
                    onClick={() => restoreListing(id)}
                    className="flex items-center gap-1.5 rounded-full bg-leaf-50 px-3 py-1.5 text-xs font-medium text-leaf-700 transition-colors hover:bg-leaf-100"
                  >
                    <RotateCcw size={13} />
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
