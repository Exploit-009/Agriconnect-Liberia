import { useState } from 'react';
import type { Product } from '@/types';
import { MapPin, Phone, Leaf, Package, BadgeCheck, Trash2, MessageSquare, Loader2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onDelete?: (id: string) => void;
  onEnquire?: (product: Product) => void;
  canDelete: boolean;
  canEnquire: boolean;
}

const GRADE_COLORS: Record<string, string> = {
  'Premium': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Grade A': 'bg-blue-100 text-blue-700 border-blue-200',
  'Grade B': 'bg-amber-100 text-amber-700 border-amber-200',
};

export function ProductCard({ product, onClick, onDelete, onEnquire, canDelete, canEnquire }: ProductCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete || deleting) return;
    setDeleting(true);
    await onDelete(product.id);
    setDeleting(false);
  };

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-lg hover:border-emerald-300 transition-all duration-300 cursor-pointer flex flex-col"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden bg-stone-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${GRADE_COLORS[product.quality_grade] || 'bg-stone-100 text-stone-700 border-stone-200'}`}>
            {product.quality_grade}
          </span>
          {product.is_organic && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-600 text-white flex items-center gap-1">
              <Leaf className="w-3 h-3" /> Organic
            </span>
          )}
        </div>
        {canDelete && onDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-stone-500 hover:text-red-600 disabled:opacity-40"
            title="Remove listing"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-stone-900 text-lg leading-tight">{product.name}</h3>
        </div>
        <span className="text-xs text-stone-500 mb-3">{product.category}</span>

        <p className="text-sm text-stone-600 line-clamp-2 mb-3 flex-1">{product.description}</p>

        <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-3">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{product.county}</span>
          <span className="text-stone-300">·</span>
          <span>{product.farmer_name}</span>
        </div>

        <div className="flex items-end justify-between pt-3 border-t border-stone-100">
          <div>
            <p className="text-2xl font-bold text-stone-900">
              {Number(product.price).toLocaleString()}
              <span className="text-sm font-normal text-stone-500"> LRD/{product.unit}</span>
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-stone-500">
            <Package className="w-3.5 h-3.5" />
            <span>{product.quantity_available} {product.unit}{product.quantity_available !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {canEnquire && onEnquire && (
          <button
            onClick={(e) => { e.stopPropagation(); onEnquire(product); }}
            className="mt-3 w-full py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" /> Enquire
          </button>
        )}
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 animate-pulse">
      <div className="h-48 bg-stone-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-stone-200 rounded w-2/3" />
        <div className="h-4 bg-stone-200 rounded w-1/3" />
        <div className="h-4 bg-stone-200 rounded w-full" />
        <div className="h-4 bg-stone-200 rounded w-1/2" />
        <div className="h-8 bg-stone-200 rounded w-1/3 mt-2" />
      </div>
    </div>
  );
}

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onEnquire?: (product: Product) => void;
  canEnquire: boolean;
}

export function ProductDetailModal({ product, onClose, onEnquire, canEnquire }: ProductDetailModalProps) {
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64 overflow-hidden rounded-t-2xl bg-stone-100">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors text-stone-700"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${GRADE_COLORS[product.quality_grade] || 'bg-stone-100 text-stone-700 border-stone-200'}`}>
              {product.quality_grade}
            </span>
            {product.is_organic && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-600 text-white flex items-center gap-1">
                <Leaf className="w-3 h-3" /> Organic
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          <span className="text-xs text-emerald-600 font-medium uppercase tracking-wide">{product.category}</span>
          <h2 className="text-2xl font-bold text-stone-900 mt-1 mb-3">{product.name}</h2>

          <p className="text-stone-600 leading-relaxed mb-5">{product.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-stone-50 rounded-xl p-4">
              <p className="text-xs text-stone-500 mb-1">Price</p>
              <p className="text-xl font-bold text-stone-900">
                {Number(product.price).toLocaleString()} <span className="text-sm font-normal text-stone-500">LRD/{product.unit}</span>
              </p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4">
              <p className="text-xs text-stone-500 mb-1">Available</p>
              <p className="text-xl font-bold text-stone-900">{product.quantity_available} <span className="text-sm font-normal text-stone-500">{product.unit}{product.quantity_available !== 1 ? 's' : ''}</span></p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-stone-700">
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-stone-500">Farmer</p>
                <p className="font-medium">{product.farmer_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-stone-700">
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-stone-500">Location</p>
                <p className="font-medium">{product.county} County</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-stone-700">
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
                <Phone className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-stone-500">Contact</p>
                <p className="font-medium">{product.contact_phone}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800 transition-colors"
            >
              Close
            </button>
            {canEnquire && onEnquire && (
              <button
                onClick={() => onEnquire(product)}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> Enquire
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
