import type { Payment } from '@/types';
import { PAYMENT_PROVIDERS, PAYMENT_STATUS_LABELS } from '@/types';
import { Wallet, Clock, Phone, AlertTriangle, Check, X } from 'lucide-react';

interface PaymentCardProps {
  payment: Payment;
  perspective: 'buyer' | 'farmer';
  onOpen: (payment: Payment) => void;
}

const STATUS_BADGE_STYLES: Record<string, string> = {
  not_started: 'bg-stone-100 text-stone-600 border-stone-200',
  reported: 'bg-blue-100 text-blue-700 border-blue-200',
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  disputed: 'bg-red-100 text-red-700 border-red-200',
  cancelled: 'bg-stone-100 text-stone-500 border-stone-200',
};

export function PaymentCard({ payment, perspective, onOpen }: PaymentCardProps) {
  const enquiry = payment.enquiry;
  const product = enquiry?.product;

  return (
    <button
      onClick={() => onOpen(payment)}
      className="w-full text-left bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          {product?.image_url && (
            <img src={product.image_url} alt={product?.name || ''} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
          )}
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">{product?.name || 'Product removed'}</h3>
            <p className="text-xs text-stone-500">
              {perspective === 'buyer'
                ? `To ${enquiry?.product?.farmer_name || 'farmer'}`
                : `From ${enquiry?.buyer?.full_name || 'a buyer'}`}
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${STATUS_BADGE_STYLES[payment.status]}`}>
          {PAYMENT_STATUS_LABELS[payment.status]}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mb-3">
        <span className="flex items-center gap-1">
          <Wallet className="w-3.5 h-3.5" />
          {Number(payment.agreed_amount_lrd).toLocaleString()} LRD
        </span>
        <span>{PAYMENT_PROVIDERS.find(p => p.value === payment.provider)?.label}</span>
        {payment.transaction_reference && (
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5" /> Ref: {payment.transaction_reference}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {new Date(payment.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
        {payment.status === 'confirmed' && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <Check className="w-3.5 h-3.5" /> Confirmed
          </span>
        )}
        {payment.status === 'disputed' && (
          <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" /> Disputed
          </span>
        )}
        {payment.status === 'cancelled' && (
          <span className="flex items-center gap-1 text-xs text-stone-400 font-medium">
            <X className="w-3.5 h-3.5" /> Cancelled
          </span>
        )}
        {payment.status === 'reported' && perspective === 'farmer' && (
          <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
            <Check className="w-3.5 h-3.5" /> Awaiting your confirmation
          </span>
        )}
        {payment.status === 'not_started' && (
          <span className="text-xs text-stone-400">Tap to start payment record</span>
        )}
        {payment.status === 'reported' && perspective === 'buyer' && (
          <span className="text-xs text-blue-600">Waiting for farmer to confirm</span>
        )}
      </div>
    </button>
  );
}

interface PaymentsSectionProps {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  perspective: 'buyer' | 'farmer';
  onOpenPayment: (payment: Payment) => void;
}

export function PaymentsSection({ payments, loading, error, perspective, onOpenPayment }: PaymentsSectionProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-200 p-5 animate-pulse">
            <div className="h-5 bg-stone-200 rounded w-1/3 mb-3" />
            <div className="h-4 bg-stone-200 rounded w-full mb-2" />
            <div className="h-4 bg-stone-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-7 h-7 text-stone-400" />
        </div>
        <h3 className="text-lg font-semibold text-stone-900 mb-1">No payments yet</h3>
        <p className="text-sm text-stone-500">
          {perspective === 'buyer'
            ? 'When you start a payment record for an enquiry, it will appear here'
            : 'When buyers report payments for your products, they will appear here'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <PaymentCard key={payment.id} payment={payment} perspective={perspective} onOpen={onOpenPayment} />
      ))}
    </div>
  );
}
