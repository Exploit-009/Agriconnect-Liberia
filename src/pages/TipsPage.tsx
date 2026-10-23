import { useState } from 'react';
import { ShieldCheck, Lightbulb, BookOpen, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { demoTips } from '@/data';

export function TipsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'verified' | 'community'>('all');

  const filtered = demoTips.filter(t => {
    if (filter === 'verified') return t.isExpertVerified;
    if (filter === 'community') return !t.isExpertVerified;
    return true;
  });

  const categories = [...new Set(demoTips.map(t => t.category))];

  return (
    <div className="animate-fade-in section-padding mx-auto max-w-4xl py-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
            <Lightbulb size={20} />
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold text-forest-900 sm:text-3xl">Agricultural tips</h1>
        <p className="mt-1.5 text-sm text-forest-500">
          Practical farming guidance for Liberian conditions. All tips are demo data for demonstration purposes.
        </p>
      </div>

      {/* Important notice */}
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-cream-200 bg-cream-50 p-4">
        <Info size={18} className="mt-0.5 flex-shrink-0 text-cream-700" />
        <p className="text-sm leading-relaxed text-cream-800">
          Tips marked <strong>"Expert verified"</strong> are based on established agricultural extension guidance. Tips marked <strong>"Community tip"</strong> are general practical information shared for discussion — they have not been verified by an agricultural expert. Always consult your local extension officer before making important farming decisions.
        </p>
      </div>

      {/* Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`chip ${filter === 'all' ? 'bg-forest-600 text-white' : 'bg-forest-50 text-forest-600 hover:bg-forest-100'}`}
        >
          <BookOpen size={13} /> All tips ({demoTips.length})
        </button>
        <button
          onClick={() => setFilter('verified')}
          className={`chip ${filter === 'verified' ? 'bg-leaf-600 text-white' : 'bg-leaf-50 text-leaf-700 hover:bg-leaf-100'}`}
        >
          <ShieldCheck size={13} /> Expert verified ({demoTips.filter(t => t.isExpertVerified).length})
        </button>
        <button
          onClick={() => setFilter('community')}
          className={`chip ${filter === 'community' ? 'bg-cream-300 text-cream-900' : 'bg-cream-50 text-cream-700 hover:bg-cream-100'}`}
        >
          <Lightbulb size={13} /> Community ({demoTips.filter(t => !t.isExpertVerified).length})
        </button>
      </div>

      {/* Tips list */}
      <div className="space-y-3">
        {filtered.map(tip => {
          const isExpanded = expandedId === tip.id;
          return (
            <article key={tip.id} className="card overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : tip.id)}
                className="flex w-full items-start justify-between gap-3 p-5 text-left"
                aria-expanded={isExpanded}
              >
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="chip bg-forest-50 text-forest-600">{tip.category}</span>
                    {tip.isExpertVerified ? (
                      <span className="chip bg-leaf-50 text-leaf-700">
                        <ShieldCheck size={11} /> Expert verified
                      </span>
                    ) : (
                      <span className="chip bg-cream-100 text-cream-800">
                        <Lightbulb size={11} /> Community tip
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-base font-semibold text-forest-900">{tip.title}</h2>
                </div>
                <span className="mt-1 flex-shrink-0 text-forest-400">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
              </button>
              {isExpanded && (
                <div className="animate-slide-down border-t border-forest-50 px-5 pb-5 pt-4">
                  <p className="text-sm leading-relaxed text-forest-600">{tip.content}</p>
                  <p className="mt-3 rounded-lg bg-forest-50 px-3 py-2 text-xs text-forest-400">
                    Source: {tip.source}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Category overview */}
      <div className="mt-10 rounded-2xl bg-forest-50 p-6">
        <h2 className="mb-3 font-display text-base font-semibold text-forest-800">Topics covered</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <span key={c} className="chip bg-white text-forest-600 ring-1 ring-forest-100">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
