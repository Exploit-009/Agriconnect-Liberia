import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Sprout, AlertCircle } from 'lucide-react';
import type { Route } from '@/hooks/useRouter';
import type { Produce, Category, County, Unit } from '@/types';
import { CATEGORIES, COUNTIES } from '@/types';

interface ListProducePageProps {
  navigate: (r: Route) => void;
  addListing: (p: Produce) => void;
}

interface FormData {
  name: string;
  category: Category;
  county: County;
  farmerName: string;
  village: string;
  priceLRD: string;
  unit: Unit;
  quantityAvailable: string;
  harvestDate: string;
  availability: 'In stock' | 'Limited' | 'Pre-order';
  description: string;
}

interface FormErrors {
  name?: string;
  farmerName?: string;
  village?: string;
  priceLRD?: string;
  quantityAvailable?: string;
  harvestDate?: string;
  description?: string;
}

const UNITS: Unit[] = ['50kg bag', '25kg bag', 'bunch', 'crate', 'kg', 'litre', 'gallon', 'peck'];
const AVAILABILITY_OPTIONS: ('In stock' | 'Limited' | 'Pre-order')[] = ['In stock', 'Limited', 'Pre-order'];

const PLACEHOLDER_IMG = 'https://images.pexels.com/photos/37345040/pexels-photo-37345040.jpeg?auto=compress&cs=tinysrgb&h=600&w=900';

export function ListProducePage({ navigate, addListing }: ListProducePageProps) {
  const [form, setForm] = useState<FormData>({
    name: '',
    category: 'Rice',
    county: 'Margibi',
    farmerName: '',
    village: '',
    priceLRD: '',
    unit: '50kg bag',
    quantityAvailable: '',
    harvestDate: '',
    availability: 'In stock',
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Produce name is required';
    if (!form.farmerName.trim()) e.farmerName = 'Your name is required';
    if (!form.village.trim()) e.village = 'Village or town is required';
    if (!form.priceLRD.trim() || isNaN(Number(form.priceLRD)) || Number(form.priceLRD) <= 0)
      e.priceLRD = 'Enter a valid price in LRD (greater than 0)';
    if (!form.quantityAvailable.trim() || isNaN(Number(form.quantityAvailable)) || Number(form.quantityAvailable) <= 0)
      e.quantityAvailable = 'Enter a valid quantity (greater than 0)';
    if (!form.harvestDate) e.harvestDate = 'Harvest date is required';
    if (!form.description.trim() || form.description.trim().length < 10)
      e.description = 'Description must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const newProduce: Produce = {
      id: `user-${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      county: form.county,
      farmerId: `user-farmer-${Date.now()}`,
      farmerName: form.farmerName.trim(),
      priceLRD: Number(form.priceLRD),
      unit: form.unit,
      quantityAvailable: Number(form.quantityAvailable),
      harvestDate: form.harvestDate,
      availability: form.availability,
      description: `Demo data (user-created). ${form.description.trim()}`,
      images: [PLACEHOLDER_IMG],
      isDemoData: true,
      userCreated: true,
      createdAt: new Date().toISOString(),
    };

    addListing(newProduce);
    setSubmitted(true);
  };

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [key as keyof FormErrors]: undefined }));
    }
  };

  if (submitted) {
    return (
      <div className="animate-fade-in section-padding mx-auto max-w-2xl py-12">
        <div className="rounded-3xl bg-white p-8 text-center shadow-card sm:p-12">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-leaf-100 text-leaf-600">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="font-display text-2xl font-bold text-forest-900">Listing created</h1>
          <p className="mt-3 text-sm text-forest-500">
            Your produce listing has been added to the prototype marketplace. It is stored locally in your browser and will appear in the marketplace and moderation panel.
          </p>
          <p className="mt-3 text-xs text-forest-400">
            Note: This is a prototype. No data is sent to a server, and the listing is not visible to anyone else.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={() => navigate({ name: 'marketplace' })} className="btn-primary">
              View marketplace
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setForm({
                  name: '', category: 'Rice', county: 'Margibi', farmerName: '', village: '',
                  priceLRD: '', unit: '50kg bag', quantityAvailable: '', harvestDate: '',
                  availability: 'In stock', description: '',
                });
              }}
              className="btn-secondary"
            >
              Add another listing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in section-padding mx-auto max-w-2xl py-8">
      <button onClick={() => navigate({ name: 'marketplace' })} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-forest-500 transition-colors hover:text-forest-700">
        <ArrowLeft size={16} />
        Back to marketplace
      </button>

      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-leaf-600">
            <Sprout size={20} />
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold text-forest-900">List your produce</h1>
        <p className="mt-1.5 text-sm text-forest-500">
          Share what you have available so buyers can find you. Fields marked with <span className="text-gold-600">*</span> are required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-4 shadow-card sm:p-8" noValidate>
        {/* Produce name */}
        <div>
          <label htmlFor="name" className="label-field">Produce name <span className="text-gold-600">*</span></label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="e.g. Upland Rice (Cleaned)"
            className="input-field"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && <p id="name-error" className="mt-1.5 flex items-center gap-1 text-xs text-red-600" role="alert"><AlertCircle size={12} /> {errors.name}</p>}
        </div>

        {/* Category + County */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="label-field">Category</label>
            <select id="category" value={form.category} onChange={e => update('category', e.target.value as Category)} className="input-field">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="county" className="label-field">County</label>
            <select id="county" value={form.county} onChange={e => update('county', e.target.value as County)} className="input-field">
              {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Farmer name + village */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="farmerName" className="label-field">Your name <span className="text-gold-600">*</span></label>
            <input
              id="farmerName"
              type="text"
              value={form.farmerName}
              onChange={e => update('farmerName', e.target.value)}
              placeholder="e.g. Mary Tuah"
              className="input-field"
              aria-invalid={!!errors.farmerName}
              aria-describedby={errors.farmerName ? 'farmerName-error' : undefined}
            />
            {errors.farmerName && <p id="farmerName-error" className="mt-1.5 flex items-center gap-1 text-xs text-red-600" role="alert"><AlertCircle size={12} /> {errors.farmerName}</p>}
          </div>
          <div>
            <label htmlFor="village" className="label-field">Village / Town <span className="text-gold-600">*</span></label>
            <input
              id="village"
              type="text"
              value={form.village}
              onChange={e => update('village', e.target.value)}
              placeholder="e.g. Kakata"
              className="input-field"
              aria-invalid={!!errors.village}
              aria-describedby={errors.village ? 'village-error' : undefined}
            />
            {errors.village && <p id="village-error" className="mt-1.5 flex items-center gap-1 text-xs text-red-600" role="alert"><AlertCircle size={12} /> {errors.village}</p>}
          </div>
        </div>

        {/* Price + unit */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="priceLRD" className="label-field">Price (LRD) <span className="text-gold-600">*</span></label>
            <input
              id="priceLRD"
              type="number"
              min="1"
              step="1"
              value={form.priceLRD}
              onChange={e => update('priceLRD', e.target.value)}
              placeholder="e.g. 3500"
              className="input-field"
              aria-invalid={!!errors.priceLRD}
              aria-describedby={errors.priceLRD ? 'priceLRD-error' : undefined}
            />
            {errors.priceLRD && <p id="priceLRD-error" className="mt-1.5 flex items-center gap-1 text-xs text-red-600" role="alert"><AlertCircle size={12} /> {errors.priceLRD}</p>}
          </div>
          <div>
            <label htmlFor="unit" className="label-field">Unit</label>
            <select id="unit" value={form.unit} onChange={e => update('unit', e.target.value as Unit)} className="input-field">
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {/* Quantity + harvest date */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="quantityAvailable" className="label-field">Quantity available <span className="text-gold-600">*</span></label>
            <input
              id="quantityAvailable"
              type="number"
              min="1"
              step="1"
              value={form.quantityAvailable}
              onChange={e => update('quantityAvailable', e.target.value)}
              placeholder="e.g. 40"
              className="input-field"
              aria-invalid={!!errors.quantityAvailable}
              aria-describedby={errors.quantityAvailable ? 'quantityAvailable-error' : undefined}
            />
            {errors.quantityAvailable && <p id="quantityAvailable-error" className="mt-1.5 flex items-center gap-1 text-xs text-red-600" role="alert"><AlertCircle size={12} /> {errors.quantityAvailable}</p>}
          </div>
          <div>
            <label htmlFor="harvestDate" className="label-field">Harvest date <span className="text-gold-600">*</span></label>
            <input
              id="harvestDate"
              type="date"
              value={form.harvestDate}
              onChange={e => update('harvestDate', e.target.value)}
              className="input-field"
              aria-invalid={!!errors.harvestDate}
              aria-describedby={errors.harvestDate ? 'harvestDate-error' : undefined}
            />
            {errors.harvestDate && <p id="harvestDate-error" className="mt-1.5 flex items-center gap-1 text-xs text-red-600" role="alert"><AlertCircle size={12} /> {errors.harvestDate}</p>}
          </div>
        </div>

        {/* Availability */}
        <div>
          <label htmlFor="availability" className="label-field">Availability status</label>
          <select id="availability" value={form.availability} onChange={e => update('availability', e.target.value as FormData['availability'])} className="input-field">
            {AVAILABILITY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="label-field">Description <span className="text-gold-600">*</span></label>
          <textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={e => update('description', e.target.value)}
            placeholder="Describe the produce: quality, variety, storage notes, etc. (minimum 10 characters)"
            className="input-field resize-none"
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          {errors.description && <p id="description-error" className="mt-1.5 flex items-center gap-1 text-xs text-red-600" role="alert"><AlertCircle size={12} /> {errors.description}</p>}
        </div>

        {/* Note */}
        <div className="rounded-xl bg-cream-50 p-3 text-xs text-cream-800 ring-1 ring-cream-200">
          This is a prototype. Your listing will be stored only in your browser and marked as demo data. No real information is sent to any server.
        </div>

        {/* Submit */}
        <button type="submit" className="btn-primary w-full text-base">
          <Sprout size={18} />
          Create listing
        </button>
      </form>
    </div>
  );
}
