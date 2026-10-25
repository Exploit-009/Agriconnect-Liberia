import { useState, useEffect } from 'react';
import type { ProductInput } from '@/types';
import { CATEGORIES, COUNTIES, QUALITY_GRADES } from '@/types';
import { X, Loader2, Sprout } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (input: ProductInput, farmerId: string, farmerName: string) => Promise<{ error: string | null }>;
  farmerId: string | null;
  farmerName: string;
}

const UNITS = ['kg', 'bag', 'bunch', 'crate', 'gallon', 'bottle', 'piece', 'basket'];

export function AddProductModal({ isOpen, onClose, onAdd, farmerId, farmerName }: AddProductModalProps) {
  const [form, setForm] = useState<ProductInput>({
    name: '',
    category: 'Grains',
    price: 0,
    unit: 'kg',
    quantity_available: 0,
    farmer_name: '',
    county: 'Montserrado',
    description: '',
    image_url: '',
    quality_grade: 'Grade A',
    is_organic: false,
    contact_phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm((prev) => ({
        ...prev,
        farmer_name: farmerName || prev.farmer_name,
      }));
    }
  }, [isOpen, farmerName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!farmerId) {
      setError('You must be signed in as a farmer to list products.');
      setSubmitting(false);
      return;
    }

    if (!form.name.trim() || form.price <= 0) {
      setError('Please fill in the product name and a valid price.');
      setSubmitting(false);
      return;
    }

    const result = await onAdd(form, farmerId, form.farmer_name || farmerName);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      setForm({
        name: '', category: 'Grains', price: 0, unit: 'kg', quantity_available: 0,
        farmer_name: farmerName, county: 'Montserrado', description: '', image_url: '',
        quality_grade: 'Grade A', is_organic: false, contact_phone: '',
      });
      setSubmitting(false);
      onClose();
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm";
  const labelClass = "block text-xs font-medium text-stone-600 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">List a Product</h2>
              <p className="text-xs text-stone-500">Add your produce to the marketplace</p>
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

          <div>
            <label className={labelClass}>Product Name *</label>
            <input className={inputClass} type="text" placeholder="e.g. Fresh Cassava" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Quality Grade</label>
              <select className={inputClass} value={form.quality_grade} onChange={(e) => setForm({ ...form, quality_grade: e.target.value })}>
                {QUALITY_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Price (LRD) *</label>
              <input className={inputClass} type="number" min="0" step="1" placeholder="0" value={form.price || ''} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} required />
            </div>
            <div>
              <label className={labelClass}>Unit</label>
              <select className={inputClass} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Qty Available</label>
              <input className={inputClass} type="number" min="0" step="1" placeholder="0" value={form.quantity_available || ''} onChange={(e) => setForm({ ...form, quantity_available: parseInt(e.target.value) || 0 })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Farmer / Farm Name</label>
              <input className={inputClass} type="text" placeholder="e.g. Mary Tuah" value={form.farmer_name} onChange={(e) => setForm({ ...form, farmer_name: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>County</label>
              <select className={inputClass} value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })}>
                {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Contact Phone</label>
            <input className={inputClass} type="tel" placeholder="+231 ..." value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea className={inputClass + " resize-none"} rows={3} placeholder="Describe your product..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <label className={labelClass}>Image URL (optional)</label>
            <input className={inputClass} type="url" placeholder="https://..." value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_organic} onChange={(e) => setForm({ ...form, is_organic: e.target.checked })} className="w-4 h-4 rounded accent-emerald-600" />
            <span className="text-sm text-stone-700">Organically grown (no chemical fertilizers or pesticides)</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" /> Listing...</>) : 'List Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
