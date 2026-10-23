import { Info } from 'lucide-react';

interface DemoBadgeProps {
  label?: string;
  className?: string;
}

export function DemoBadge({ label = 'Demo data', className = '' }: DemoBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-cream-100 px-2.5 py-1 text-xs font-medium text-cream-800 ring-1 ring-cream-300 ${className}`}
    >
      <Info size={11} />
      {label}
    </span>
  );
}
