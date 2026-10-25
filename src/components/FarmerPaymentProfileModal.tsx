import { useState, useEffect } from 'react';
import type { FarmerPaymentProfile, PaymentProvider } from '@/types';
import { PAYMENT_PROVIDERS } from '@/types';
import { X, Wallet, Phone, User, Loader2, Save, Trash2 } from 'lucide-react';

interface FarmerPaymentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmerId: string | null;
  existingProfiles: FarmerPaymentProfile[];
  onSave: (
    provider: PaymentProvider,
    mobileMoneyNumber: string,
    recipientName: string,
    paymentInstructions: string | null,
  ) => Promise<{ error: string | null }>;
  onToggleActive: (id: string, isActive: boolean) => Promise<{ error: string | null }>;
  onDelete: (id: string) => Promise<{ error: string | null }>;
}

export function FarmerPaymentProfileModal({
  isOpen, onClose, existingProfiles, onSave, onToggleActive, onDelete,
}: FarmerPaymentProfileModalProps) {
  const [provider, setProvider] = useState<PaymentProvider>('orange_money');
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const existing = existingProfiles.find(p => p.provider === provider);
    if (existing) {
      setMobileMoneyNumber(existing.mobile_money_number);
      setRecipientName(existing.recipient_name);
      setPaymentInstructions(existing.payment_instructions || '');
    } else {
      setMobileMoneyNumber('');
      setRecipientName('');
      setPaymentInstructions('');
    }
    setError(null);
  }, [provider, isOpen, existingProfiles]);

  if (!isOpen) return null;

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    return /^[0-9]{8,15}$/.test(cleaned);
  };

  const handleSave = async () => {
    setError(null);
    if (!mobileMoneyNumber.trim()) { setError('Mobile money number is required.'); return; }
    if (!validatePhone(mobileMoneyNumber)) { setError('Please enter a valid phone number (8-15 digits).'); return; }
    if (!recipientName.trim()) { setError('Recipient name is required.'); return; }
    setSaving(true);
    const result = await onSave(provider, mobileMoneyNumber.trim(), recipientName.trim(), paymentInstructions.trim() || null);
    setSaving(false);
    if (result.error) { setError(result.error); } else { onClose(); }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    setTogglingId(id);
    await onToggleActive(id, !currentActive);
    setTogglingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label="Mobile money details">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-lg">Mobile Money Details</h2>
              <p className="text-xs text-stone-500">Configure how buyers pay you</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {existingProfiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Active Providers</p>
              {existingProfiles.map((p) => (
                <div key={p.id} className={`rounded-xl border p-3 ${p.is_active ? 'border-emerald-200 bg-emerald-50/50' : 'border-stone-200 bg-stone-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-stone-900">{PAYMENT_PROVIDERS.find(pp => pp.value === p.provider)?.label || p.provider}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggle(p.id, p.is_active)} disabled={togglingId === p.id}
                        className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${p.is_active ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                        {togglingId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : p.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                        className="text-xs p-1 text-stone-400 hover:text-red-600 transition-colors">
                        {deletingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600">{p.recipient_name} · {p.mobile_money_number}</p>
                  {p.payment_instructions && <p className="text-xs text-stone-400 mt-1">{p.payment_instructions}</p>}
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Provider</label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_PROVIDERS.map((p) => (
                <button key={p.value} onClick={() => setProvider(p.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${provider === p.value ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Mobile Money Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input type="tel" value={mobileMoneyNumber} onChange={(e) => setMobileMoneyNumber(e.target.value)}
                placeholder="e.g. 0880123456"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Recipient / Account Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Name registered with the provider"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Payment Instructions (optional)</label>
            <textarea value={paymentInstructions} onChange={(e) => setPaymentInstructions(e.target.value)}
              placeholder="Any notes for the buyer" rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-100 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none" />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-800 leading-relaxed">Never share your mobile money PIN, password, or OTP. AgriConnect only stores your receiving number and instructions.</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {existingProfiles.find(p => p.provider === provider) ? 'Update' : 'Save'} Payment Details
          </button>
        </div>
      </div>
    </div>
  );
}
