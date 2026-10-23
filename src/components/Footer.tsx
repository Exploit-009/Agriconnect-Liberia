import { Sprout, AlertTriangle } from 'lucide-react';
import type { Route } from '@/hooks/useRouter';

interface FooterProps {
  navigate: (r: Route) => void;
}

export function Footer({ navigate }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-forest-800 text-forest-100">
      <div className="section-padding mx-auto max-w-7xl py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-400 text-forest-800">
                <Sprout size={20} />
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-base font-bold text-white">AgriConnect</span>
                <span className="text-[10px] font-medium text-leaf-200">Liberia</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-forest-200">
              An independent agricultural marketplace prototype designed for demonstration at a hackathon.
            </p>
            <p className="mt-3 text-xs text-forest-300">
              All listings, farmers, prices, and contacts are demo data.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Marketplace</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate({ name: 'marketplace' })} className="text-forest-200 transition-colors hover:text-leaf-300">Browse produce</button></li>
              <li><button onClick={() => navigate({ name: 'list-produce' })} className="text-forest-200 transition-colors hover:text-leaf-300">List your produce</button></li>
              <li><button onClick={() => navigate({ name: 'favorites' })} className="text-forest-200 transition-colors hover:text-leaf-300">Favorites</button></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate({ name: 'tips' })} className="text-forest-200 transition-colors hover:text-leaf-300">Agricultural tips</button></li>
              <li><button onClick={() => navigate({ name: 'about' })} className="text-forest-200 transition-colors hover:text-leaf-300">About this project</button></li>
              <li><button onClick={() => navigate({ name: 'moderation' })} className="text-forest-200 transition-colors hover:text-leaf-300">Moderation (demo)</button></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Disclaimer</h3>
            <div className="flex items-start gap-2 rounded-xl bg-forest-700/60 p-3 text-xs leading-relaxed text-forest-200">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-cream-400" />
              <p>
                This is a prototype. Not affiliated with or endorsed by any government, the World Bank, or hackathon organisers. No real transactions occur.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-forest-700 pt-6">
          <p className="text-xs text-forest-300">
            © {year} AgriConnect Liberia — Independent prototype. Demo data only.
          </p>
        </div>
      </div>
    </footer>
  );
}
