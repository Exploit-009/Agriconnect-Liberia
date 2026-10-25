import { useState } from 'react';
import type { Product, EnquiryInput } from '@/types';
import { X, Loader2, MessageSquare, Package } from 'lucide-react';

interface EnquiryModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: EnquiryInput) => Promise<{ error: string | null }>;
  defaultPhone?: string;
}

export function EnquiryModal({ product, isOpen, onClose, onSubmit, defaultPhone }: EnquiryModalProps) {
  const [message, setMessage] = useState('');

  if (!isOpen || !product) return null;
  const [quantity, setQuantity] = useState('');
  const [phone, setPhone] = useState(defaultPhone || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!message.trim()) {
      setError('Please enter a message for the farmer.');
      setSubmitting(false);
      return;
    }

    const input: EnquiryInput = {
      product_id: product.id,
      farmer_id: product.farmer_id,
      message: message.trim(),
      quantity_requested: quantity.trim(),
      contact_phone: phone.trim(),
    };

    const result = await onSubmit(input);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      setMessage('');
      setQuantity('');
      setSubmitting(false);
      onClose();
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm";
  const labelClass = "block text-xs font-medium text-stone-600 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Enquire About Product</h2>
              <p className="text-xs text-stone-500">{product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="bg-stone-50 rounded-xl p-3 flex items-center gap-3">
            <Package className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-stone-900">{product.name}</p>
              <p className="text-xs text-stone-500">{Number(product.price).toLocaleString()} LRD/{product.unit} · {product.farmer_name} · {product.county}</p>
            </div>
          </div>

          <div>
            <label className={labelClass}>Quantity Needed</label>
            <input className={inputClass} type="text" placeholder="e.g. 5 bags, 10 kg" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>

          <div>
            <label className={labelClass}>Your Phone (for farmer to call back)</label>
            <input className={inputClass} type="tel" placeholder="+231 ..." value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div>
            <label className={labelClass}>Message to Farmer *</label>
            <textarea className={inputClass + " resize-none"} rows={4} placeholder="I'm interested in buying your product. When can I collect it?" value={message} onChange={(e) => setMessage(e.target.value)} required />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Enquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
