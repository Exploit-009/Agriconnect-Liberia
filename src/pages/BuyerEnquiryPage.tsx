import { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertCircle, MessageCircle, Send } from 'lucide-react';
import type { Route } from '@/hooks/useRouter';
import type { Produce } from '@/types';
import { formatLRD } from '@/lib/utils';
import { EmptyState } from '@/components/EmptyState';

interface BuyerEnquiryPageProps {
  navigate: (r: Route) => void;
  produce: Produce | undefined;
}

interface FormData {
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  quantityRequested: string;
  message: string;
}

interface FormErrors {
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  quantityRequested?: string;
  message?: string;
}

export function BuyerEnquiryPage({ navigate, produce }: BuyerEnquiryPageProps) {
  const [form, setForm] = useState<FormData>({
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
    quantityRequested: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  if (!produce) {
    return (
      <div className="section-padding mx-auto max-w-7xl py-12">
        <EmptyState
          icon={<MessageCircle size={28} />}
          title="Listing not found"
          message="This produce listing may have been removed or does not exist."
          action={<button onClick={() => navigate({ name: 'marketplace' })} className="btn-primary">Back to marketplace</button>}
        />
      </div>
    );
  }

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.buyerName.trim()) e.buyerName = 'Your name is required';
    if (!form.buyerPhone.trim()) e.buyerPhone = 'Phone number is required';
    else if (!/^[0-9+\-\s()]{7,}$/.test(form.buyerPhone.trim())) e.buyerPhone = 'Enter a valid phone number (at least 7 digits)';
    if (form.buyerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.buyerEmail.trim()))
      e.buyerEmail = 'Enter a valid email address or leave blank';
    if (!form.quantityRequested.trim() || isNaN(Number(form.quantityRequested)) || Number(form.quantityRequested) <= 0)
      e.quantityRequested = 'Enter a valid quantity (greater than 0)';
    if (!form.message.trim() || form.message.trim().length < 10)
      e.message = 'Message must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) setSubmitted(true);
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
          <h1 className="font-display text-2xl font-bold text-forest-900">Enquiry recorded</h1>
          <p className="mt-3 text-sm text-forest-500">
            Thank you, {form.buyerName}. Your enquiry about <span className="font-semibold text-forest-700">{produce.name}</span> has been recorded in the prototype.
          </p>
          <div className="mt-4 rounded-xl bg-cream-50 p-4 text-left text-xs leading-relaxed text-cream-800 ring-1 ring-cream-200">
            <p className="font-semibold">Important: This is a prototype.</p>
            <p className="mt-1">
              Your enquiry was not actually delivered to {produce.farmerName}. No message was sent. This form only demonstrates how a real enquiry flow would work.
            </p>
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={() => navigate({ name: 'marketplace' })} className="btn-primary">Back to marketplace</button>
            <button onClick={() => navigate({ name: 'product', id: produce.id })} className="btn-secondary">View listing</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in section-padding mx-auto max-w-2xl py-8">
      <button onClick={() => navigate({ name: 'product', id: produce.id })} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-forest-500 transition-colors hover:text-forest-700">
        <ArrowLeft size={16} />
        Back to listing
      </button>

      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-leaf-600">
            <MessageCircle size={20} />
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold text-forest-900">Send an enquiry</h1>
        <p className="mt-1.5 text-sm text-forest-500">
          Fill in your details and the farmer will receive your enquiry. Fields marked with <span className="text-gold-600">*</span> are required.
        </p>
      </div>

      {/* Product summary */}
      <div className="mb-5 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft">
        <img src={produce.images[0]} alt={produce.name} className="h-16 w-16 rounded-xl object-cover" />
        <div>
          <p className="text-sm font-semibold text-forest-800">{produce.name}</p>
          <p className="text-xs text-forest-400">{produce.farmerName} • {produce.county}</p>
          <p className="text-sm font-bold text-forest-700">{formatLRD(produce.priceLRD)} <span className="text-xs font-normal text-forest-400">/ {produce.unit}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-4 shadow-card sm:p-8" noValidate>
        <div>
          <label htmlFor="buyerName" className="label-field">Your name <span className="text-gold-600">*</span></label>
          <input
            id="buyerName"
            type="text"
            value={form.buyerName}
            onChange={e => update('buyerName', e.target.value)}
            placeholder="e.g. John Doe"
            className="input-field"
            aria-invalid={!!errors.buyerName}
            aria-describedby={errors.buyerName ? 'buyerName-error' : undefined}
          />
          {errors.buyerName && <p id="buyerName-error" className="mt-1.5 flex items-center gap-1 text-xs text-red-600" role="alert"><AlertCircle size={12} /> {errors.buyerName}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="buyerPhone" className="label-field">Phone number <span className="text-gold-600">*</span></label>
            <input
              id="buyerPhone"
              type="tel"
              value={form.buyerPhone}
              onChange={e => update('buyerPhone', e.target.value)}
              placeholder="e.g. +231 88 123 4567"
              className="input-field"
              aria-invalid={!!errors.buyerPhone}
              aria-describedby={errors.buyerPhone ? 'buyerPhone-error' : undefined}
            />
            {errors.buyerPhone && <p id="buyerPhone-error" className="mt-1.5 flex items-center gap-1 text-xs text-red-600" role="alert"><AlertCircle size={12} /> {errors.buyerPhone}</p>}
          </div>
          <div>
            <label htmlFor="buyerEmail" className="label-field">Email <span className="text-forest-300">(optional)</span></label>
            <input
              id="buyerEmail"
              type="email"
              value={form.buyerEmail}
              onChange={e => update('buyerEmail', e.target.value)}
              placeholder="you@example.com"
              className="input-field"
              aria-invalid={!!errors.buyerEmail}
              aria-describedby={errors.buyerEmail ? 'buyerEmail-error' : undefined}
            />
            {errors.buyerEmail && <p id="buyerEmail-error" className="mt-1.5 flex items-center gap-1 text-xs text-red-600" role="alert"><AlertCircle size={12} /> {errors.buyerEmail}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="quantityRequested" className="label-field">Quantity requested ({produce.unit}) <span className="text-gold-600">*</span></label>
          <input
            id="quantityRequested"
            type="number"
            min="1"
            step="1"
            value={form.quantityRequested}
            onChange={e => update('quantityRequested', e.target.value)}
            placeholder={`e.g. 10 (${produce.unit}s)`}
            className="input-field"
            aria-invalid={!!errors.quantityRequested}
            aria-describedby={errors.quantityRequested ? 'quantityRequested-error' : undefined}
          />
          {errors.quantityRequested && <p id="quantityRequested-error" className="mt-1.5 flex items-center gap-1 text-xs text-red-600" role="alert"><AlertCircle size={12} /> {errors.quantityRequested}</p>}
        </div>

        <div>
          <label htmlFor="message" className="label-field">Message to farmer <span className="text-gold-600">*</span></label>
          <textarea
            id="message"
            rows={4}
            value={form.message}
            onChange={e => update('message', e.target.value)}
            placeholder="Introduce yourself and describe what you need. When can you collect? Do you need delivery? (minimum 10 characters)"
            className="input-field resize-none"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
          {errors.message && <p id="message-error" className="mt-1.5 flex items-center gap-1 text-xs text-red-600" role="alert"><AlertCircle size={12} /> {errors.message}</p>}
        </div>

        <div className="rounded-xl bg-cream-50 p-3 text-xs text-cream-800 ring-1 ring-cream-200">
          Prototype notice: This form does not send a real message. Your enquiry is not delivered to the farmer — it only demonstrates the enquiry flow.
        </div>

        <button type="submit" className="btn-primary w-full text-base">
          <Send size={18} />
          Send enquiry
        </button>
      </form>
    </div>
  );
}
