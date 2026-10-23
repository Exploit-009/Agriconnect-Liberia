import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-forest-100 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-forest-50 text-forest-400">
        {icon}
      </div>
      <h3 className="mb-1.5 font-display text-lg font-semibold text-forest-800">{title}</h3>
      <p className="max-w-sm text-sm text-forest-500">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
