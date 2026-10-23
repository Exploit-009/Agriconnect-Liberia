import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search produce, county, farmer...', className = '' }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={18}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-forest-200 bg-white py-3 pl-11 pr-10 text-sm text-forest-900 placeholder:text-forest-400 shadow-soft transition-colors focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
        aria-label="Search marketplace"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-forest-400 transition-colors hover:bg-forest-50 hover:text-forest-600"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
