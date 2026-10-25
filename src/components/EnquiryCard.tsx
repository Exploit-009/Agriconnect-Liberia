import { useState } from 'react';
import type { Enquiry, EnquiryStatus } from '@/types';
import { Clock, Phone, Package, Trash2, MessageSquare, Loader2, Wallet } from 'lucide-react';

interface EnquiryCardProps {
  enquiry: Enquiry;
  perspective: 'buyer' | 'farmer';
  onStatusChange?: (id: string, status: EnquiryStatus) => void;
  onDelete?: (id: string) => void;
  onPay?: () => void;
}

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  contacted: 'bg-blue-100 text-blue-700 border-blue-200',
  closed: 'bg-stone-100 text-stone-600 border-stone-200',
};

export function EnquiryCard({ enquiry, perspective, onStatusChange, onDelete, onPay }: EnquiryCardProps) {
  const product = enquiry.product;
  const buyer = enquiry.buyer;
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete || deleting) return;
    setDeleting(true);
    await onDelete(enquiry.id);
    setDeleting(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          {product?.image_url && (
            <img src={product.image_url} alt={product?.name || ''} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
          )}
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">{product?.name || 'Product removed'}</h3>
            <p className="text-xs text-stone-500">
              {perspective === 'buyer' ? (
                <>From {product?.farmer_name || 'Unknown farmer'} · {product?.county}</>
              ) : (
                <>From {buyer?.full_name || 'A buyer'} · {buyer?.email}</>
              )}
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${STATUS_STYLES[enquiry.status]}`}>
          {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
        </span>
      </div>

      <div className="flex items-start gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-stone-600 leading-relaxed">{enquiry.message}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mb-3">
        {enquiry.quantity_requested && (
          <span className="flex items-center gap-1">
            <Package className="w-3.5 h-3.5" />
            {enquiry.quantity_requested}
          </span>
        )}
        {enquiry.contact_phone && (
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5" />
            {enquiry.contact_phone}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {new Date(enquiry.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
        {perspective === 'farmer' && onStatusChange ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Update status:</span>
            <select
              value={enquiry.status}
              onChange={(e) => onStatusChange(enquiry.id, e.target.value as EnquiryStatus)}
              className="px-2.5 py-1.5 rounded-lg bg-stone-100 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer border-0"
            >
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3">
          {onPay && (
            <button
              onClick={onPay}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              <Wallet className="w-3.5 h-3.5" /> Payment
            </button>
          )}
          {perspective === 'buyer' && onDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
