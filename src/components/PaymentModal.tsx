import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { safeSupabaseCall } from '@/lib/supabaseError';
import type { Enquiry, Payment, PaymentProvider, FarmerPaymentProfile } from '@/types';
import { PAYMENT_PROVIDERS, PAYMENT_STATUS_LABELS } from '@/types';
import { X, Wallet, Phone, Loader2, Check, AlertTriangle, ArrowLeft, Send } from 'lucide-react';

interface PaymentModalProps {
  enquiry: Enquiry | null;
  isOpen: boolean;
  onClose: () => void;
  buyerId: string | null;
  perspective: 'buyer' | 'farmer';
  onCreatePayment: (provider: PaymentProvider, amountLrd: number, farmerId: string) => Promise<{ error: string | null }>;
  onReportPayment: (paymentId: string, transactionReference: string | null) => Promise<{ error: string | null }>;
  onConfirmPayment: (paymentId: string) => Promise<{ error: string | null }>;
  onDisputePayment: (paymentId: string, disputeNote: string | null) => Promise<{ error: string | null }>;
  onCancelPayment: (paymentId: string) => Promise<{ error: string | null }>;
}

const STATUS_BADGE_STYLES: Record<string, string> = {
  not_started: 'bg-stone-100 text-stone-600 border-stone-200',
  reported: 'bg-blue-100 text-blue-700 border-blue-200',
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  disputed: 'bg-red-100 text-red-700 border-red-200',
  cancelled: 'bg-stone-100 text-stone-500 border-stone-200',
};

function useFarmerProfilesForBuyer(farmerId: string | null) {
  const [profiles, setProfiles] = useState<FarmerPaymentProfile[]>([]);

  const fetch = useCallback(async () => {
    if (!farmerId) { setProfiles([]); return; }
    const { data } = await safeSupabaseCall(
      supabase.from('farmer_payment_profiles').select('*').eq('farmer_id', farmerId).eq('is_active', true).order('created_at', { ascending: true }),
    );
    setProfiles((data as FarmerPaymentProfile[]) || []);
  }, [farmerId]);

  useEffect(() => { fetch(); }, [fetch]);

  return profiles;
}

export function PaymentModal({
  enquiry, isOpen, onClose, buyerId, perspective,
  onCreatePayment, onReportPayment, onConfirmPayment, onDisputePayment, onCancelPayment,
}: PaymentModalProps) {
  const [existingPayment, setExistingPayment] = useState<Payment | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [step, setStep] = useState<'view' | 'create' | 'dispute'>('view');
  const [provider, setProvider] = useState<PaymentProvider>('orange_money');
  const [amountLrd, setAmountLrd] = useState('');
  const [transactionReference, setTransactionReference] = useState('');
  const [disputeNote, setDisputeNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const farmerId = enquiry?.farmer_id ?? null;
  const farmerProfiles = useFarmerProfilesForBuyer(farmerId);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !enquiry) return;
    setStep('view'); setError(null); setTransactionReference(''); setDisputeNote('');
    (async () => {
      setLoadingPayment(true);
      const { data } = await safeSupabaseCall(
        supabase.from('payments').select('*').eq('enquiry_id', enquiry.id).maybeSingle(),
      );
      setExistingPayment(data as Payment | null);
      if (data) { setProvider((data as Payment).provider); setAmountLrd(String((data as Payment).agreed_amount_lrd)); }
      else { setAmountLrd(enquiry.product ? String(enquiry.product.price) : ''); }
      setLoadingPayment(false);
    })();
  }, [isOpen, enquiry]);

  const refreshPayment = async () => {
    if (!enquiry) return;
    const { data } = await safeSupabaseCall(
      supabase.from('payments').select('*').eq('enquiry_id', enquiry.id).maybeSingle(),
    );
    setExistingPayment(data as Payment | null);
  };

  if (!isOpen || !enquiry) return null;

  const handleCreate = async () => {
    const amount = parseFloat(amountLrd);
    if (!amount || amount <= 0 || isNaN(amount)) { setError('Please enter a valid amount greater than zero.'); return; }
    if (!farmerId) { setError('Farmer information is missing.'); return; }
    setSubmitting(true); setError(null);
    const result = await onCreatePayment(provider, amount, farmerId);
    setSubmitting(false);
    if (result.error) { setError(result.error); } else { await refreshPayment(); setStep('view'); }
  };

  const handleReport = async () => {
    if (!existingPayment) return;
    setSubmitting(true); setError(null);
    const result = await onReportPayment(existingPayment.id, transactionReference.trim() || null);
    setSubmitting(false);
    if (result.error) { setError(result.error); } else { await refreshPayment(); }
  };

  const handleConfirm = async () => {
    if (!existingPayment) return;
    setSubmitting(true); setError(null);
    const result = await onConfirmPayment(existingPayment.id);
    setSubmitting(false);
    if (result.error) { setError(result.error); } else { await refreshPayment(); }
  };

  const handleDispute = async () => {
    if (!existingPayment) return;
    setSubmitting(true); setError(null);
    const result = await onDisputePayment(existingPayment.id, disputeNote.trim() || null);
    setSubmitting(false);
    if (result.error) { setError(result.error); } else { await refreshPayment(); setStep('view'); }
  };

  const handleCancel = async () => {
    if (!existingPayment) return;
    setSubmitting(true); setError(null);
    const result = await onCancelPayment(existingPayment.id);
    setSubmitting(false);
    if (result.error) { setError(result.error); } else { await refreshPayment(); }
  };

  const product = enquiry.product;
  const isPendingEnquiry = enquiry.status === 'pending';
  const canFarmerConfirm = perspective === 'farmer' && existingPayment && (existingPayment.status === 'reported' || existingPayment.status === 'disputed');
  const canFarmerDispute = perspective === 'farmer' && existingPayment && existingPayment.status !== 'confirmed' && existingPayment.status !== 'cancelled';
  const canCancel = existingPayment && (existingPayment.status === 'not_started' || existingPayment.status === 'reported');
  const profilesHiddenForBuyer = perspective === 'buyer' && farmerProfiles.length === 0 && isPendingEnquiry;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label="Payment">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            {step !== 'view' && (
              <button onClick={() => setStep('view')} aria-label="Back" className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-400">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-lg">Payment</h2>
              <p className="text-xs text-stone-500">{product?.name || 'Product'}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {loadingPayment ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 text-emerald-600 animate-spin" /></div>
          ) : step === 'create' ? (
            <>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">Agreed Amount (LRD)</label>
                <input type="number" step="0.01" min="1" value={amountLrd} onChange={(e) => setAmountLrd(e.target.value)}
                  placeholder="Enter the agreed amount"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-100 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all" />
                <p className="text-xs text-stone-400 mt-1">The amount you and the farmer agreed on. This may differ from the listed price.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">Payment Provider</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_PROVIDERS.map((p) => (
                    <button key={p.value} onClick={() => setProvider(p.value)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${provider === p.value ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              {farmerProfiles.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-medium text-emerald-800">Farmer's Mobile Money Details</p>
                  {farmerProfiles.filter(p => p.provider === provider).map((p) => (
                    <div key={p.id} className="text-sm text-emerald-900">
                      <p className="font-medium">{p.recipient_name}</p>
                      <p className="text-xs">{PAYMENT_PROVIDERS.find(pp => pp.value === p.provider)?.label}: {p.mobile_money_number}</p>
                      {p.payment_instructions && <p className="text-xs text-emerald-700 mt-1">{p.payment_instructions}</p>}
                    </div>
                  ))}
                  {farmerProfiles.filter(p => p.provider === provider).length === 0 && (
                    <p className="text-xs text-emerald-700">The farmer has not set up this provider.</p>
                  )}
                </div>
              )}
              {farmerProfiles.length === 0 && !profilesHiddenForBuyer && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs text-amber-800">The farmer has not configured mobile money details yet. You can still create a record.</p>
                </div>
              )}
              {profilesHiddenForBuyer && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs text-amber-800">The farmer's payment details will be available once they respond to your enquiry. You can still create a payment record with the provider you both agree on.</p>
                </div>
              )}
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
              <button onClick={handleCreate} disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                Create Payment Record
              </button>
            </>
          ) : step === 'dispute' ? (
            <>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800 leading-relaxed">Disputes must be resolved directly with the mobile money provider. AgriConnect cannot reverse or verify transfers.</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">Dispute Note (optional)</label>
                <textarea value={disputeNote} onChange={(e) => setDisputeNote(e.target.value)} placeholder="Briefly describe the issue" rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-100 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none" />
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
              <button onClick={handleDispute} disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                Mark as Disputed
              </button>
            </>
          ) : existingPayment ? (
            <>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${STATUS_BADGE_STYLES[existingPayment.status]}`}>{PAYMENT_STATUS_LABELS[existingPayment.status]}</span>
                <span className="text-lg font-bold text-stone-900">{Number(existingPayment.agreed_amount_lrd).toLocaleString()} LRD</span>
              </div>
              <div className="space-y-2 bg-stone-50 rounded-xl p-4 border border-stone-100">
                <div className="flex items-center justify-between text-sm"><span className="text-stone-500">Provider</span><span className="font-medium text-stone-900">{PAYMENT_PROVIDERS.find(p => p.value === existingPayment.provider)?.label}</span></div>
                {existingPayment.transaction_reference && <div className="flex items-center justify-between text-sm"><span className="text-stone-500">Transaction Ref</span><span className="font-medium text-stone-900">{existingPayment.transaction_reference}</span></div>}
                {existingPayment.buyer_reported_at && <div className="flex items-center justify-between text-sm"><span className="text-stone-500">Buyer Reported</span><span className="font-medium text-stone-900">{new Date(existingPayment.buyer_reported_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>}
                {existingPayment.farmer_confirmed_at && <div className="flex items-center justify-between text-sm"><span className="text-stone-500">Farmer Confirmed</span><span className="font-medium text-stone-900">{new Date(existingPayment.farmer_confirmed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>}
                {existingPayment.dispute_note && <div className="pt-2 border-t border-stone-200"><span className="text-xs text-stone-500">Dispute Note</span><p className="text-sm text-stone-700 mt-1">{existingPayment.dispute_note}</p></div>}
              </div>

              {perspective === 'buyer' && farmerProfiles.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1">
                  <p className="text-xs font-medium text-emerald-800">Farmer's Payment Details</p>
                  {farmerProfiles.filter(p => p.provider === existingPayment.provider).map((p) => (
                    <div key={p.id} className="text-sm text-emerald-900">
                      <p className="font-medium">{p.recipient_name}</p>
                      <p className="text-xs">{p.mobile_money_number}</p>
                      {p.payment_instructions && <p className="text-xs text-emerald-700 mt-1">{p.payment_instructions}</p>}
                    </div>
                  ))}
                </div>
              )}

              {perspective === 'buyer' && existingPayment.status === 'not_started' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1.5">Transaction Reference (optional)</label>
                    <input type="text" value={transactionReference} onChange={(e) => setTransactionReference(e.target.value)} placeholder="Non-sensitive reference"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-100 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all" />
                  </div>
                  <button onClick={handleReport} disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Report Transfer Sent
                  </button>
                </>
              )}

              {perspective === 'buyer' && existingPayment.status === 'reported' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3"><p className="text-xs text-blue-800">You have reported this transfer. Wait for the farmer to confirm receipt.</p></div>
              )}

              {perspective === 'farmer' && canFarmerConfirm && (
                <button onClick={handleConfirm} disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Confirm Payment Received
                </button>
              )}

              {perspective === 'farmer' && existingPayment.status === 'confirmed' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /><p className="text-xs text-emerald-800">You have confirmed receipt of this payment.</p>
                </div>
              )}

              {perspective === 'farmer' && canFarmerDispute && (
                <button onClick={() => setStep('dispute')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors">
                  <AlertTriangle className="w-4 h-4" /> Mark as Disputed
                </button>
              )}

              {canCancel && (
                <button onClick={handleCancel} disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-stone-500 hover:text-red-600 text-sm font-medium transition-colors disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />} Cancel Payment
                </button>
              )}

              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
            </>
          ) : (
            <>
              {perspective === 'buyer' ? (
                <>
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 space-y-2">
                    <div className="flex items-center justify-between text-sm"><span className="text-stone-500">Product</span><span className="font-medium text-stone-900">{product?.name}</span></div>
                    <div className="flex items-center justify-between text-sm"><span className="text-stone-500">Listed Price</span><span className="font-medium text-stone-900">{product ? product.price.toLocaleString() : '-'} LRD</span></div>
                    <p className="text-xs text-stone-400 pt-1">The agreed amount may differ from the listed price.</p>
                  </div>
                  {farmerProfiles.length > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
                      <p className="text-xs font-medium text-emerald-800">Farmer's Available Providers</p>
                      {farmerProfiles.map((p) => (
                        <div key={p.id} className="text-xs text-emerald-900"><span className="font-medium">{PAYMENT_PROVIDERS.find(pp => pp.value === p.provider)?.label}</span>: {p.recipient_name} · {p.mobile_money_number}</div>
                      ))}
                    </div>
                  )}
                  {profilesHiddenForBuyer && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="text-xs text-amber-800">The farmer's mobile money details will be shown here once they respond to your enquiry (status: contacted or closed).</p>
                    </div>
                  )}
                  {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
                  <button onClick={() => setStep('create')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors">
                    <Wallet className="w-4 h-4" /> Start Payment Record
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3"><Wallet className="w-6 h-6 text-stone-400" /></div>
                  <h3 className="text-sm font-semibold text-stone-900 mb-1">No payment record yet</h3>
                  <p className="text-xs text-stone-500">The buyer has not started a payment record. You will be able to confirm receipt once they report a transfer.</p>
                </div>
              )}
            </>
          )}

          <div className="bg-stone-50 border border-stone-100 rounded-xl p-3">
            <p className="text-xs text-stone-500 leading-relaxed">AgriConnect does not process, hold, or transfer money. Payments are made directly between buyer and farmer using mobile money.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
