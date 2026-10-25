import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isError = toast.type === 'error';

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-lg border max-w-sm animate-slideUp ${
        isError
          ? 'bg-red-50 border-red-200'
          : 'bg-emerald-50 border-emerald-200'
      }`}
    >
      {isError ? (
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
      )}
      <p className={`text-sm font-medium flex-1 ${isError ? 'text-red-800' : 'text-emerald-800'}`}>
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className={`flex-shrink-0 transition-colors ${isError ? 'text-red-400 hover:text-red-600' : 'text-emerald-400 hover:text-emerald-600'}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

let toastCounter = 0;

export function createToast(message: string, type: ToastType = 'success'): ToastData {
  toastCounter += 1;
  return { id: `toast-${Date.now()}-${toastCounter}`, message, type };
}
