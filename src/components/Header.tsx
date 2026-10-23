import { useState } from 'react';
import { Menu, X, Sprout, Heart, LayoutDashboard, Info, Store, ListPlus, Lightbulb } from 'lucide-react';
import type { Route } from '@/hooks/useRouter';

interface HeaderProps {
  route: Route;
  navigate: (r: Route) => void;
  favoritesCount: number;
}

const NAV_ITEMS: { label: string; route: Route; icon: typeof Store }[] = [
  { label: 'Marketplace', route: { name: 'marketplace' }, icon: Store },
  { label: 'List Produce', route: { name: 'list-produce' }, icon: ListPlus },
  { label: 'Tips', route: { name: 'tips' }, icon: Lightbulb },
  { label: 'About', route: { name: 'about' }, icon: Info },
  { label: 'Moderation', route: { name: 'moderation' }, icon: LayoutDashboard },
];

export function Header({ route, navigate, favoritesCount }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (r: Route) => route.name === r.name;

  const handleNav = (r: Route) => {
    navigate(r);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-forest-700 text-white shadow-md">
      <div className="section-padding mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => handleNav({ name: 'home' })}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            aria-label="AgriConnect Liberia home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-400 text-forest-800">
              <Sprout size={20} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight">AgriConnect</span>
              <span className="text-[10px] font-medium text-leaf-200">Liberia</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.route.name}
                  onClick={() => handleNav(item.route)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive(item.route)
                      ? 'bg-forest-600 text-white'
                      : 'text-forest-100 hover:bg-forest-600/60'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNav({ name: 'favorites' })}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                isActive({ name: 'favorites' }) ? 'bg-forest-600' : 'hover:bg-forest-600/60'
              }`}
              aria-label={`Favorites${favoritesCount > 0 ? ` (${favoritesCount})` : ''}`}
            >
              <Heart size={20} className={isActive({ name: 'favorites' }) ? 'fill-gold-400 text-gold-400' : ''} />
              {favoritesCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-forest-900">
                  {favoritesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleNav({ name: 'marketplace' })}
              className="hidden rounded-full bg-leaf-400 px-4 py-2 text-sm font-bold text-forest-900 transition-colors hover:bg-leaf-300 sm:block"
            >
              Browse produce
            </button>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-forest-600/60 md:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="animate-slide-down border-t border-forest-600 bg-forest-700 md:hidden">
          <nav className="section-padding mx-auto max-w-7xl py-3" aria-label="Mobile navigation">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.route.name}
                  onClick={() => handleNav(item.route)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    isActive(item.route)
                      ? 'bg-forest-600 text-white'
                      : 'text-forest-100 hover:bg-forest-600/60'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={() => handleNav({ name: 'marketplace' })}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-leaf-400 px-4 py-3 text-sm font-bold text-forest-900"
            >
              Browse produce
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
