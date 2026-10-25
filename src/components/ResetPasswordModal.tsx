import { useState } from 'react';
import { X, Lock, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<{ error: string | null }>;
}

export function ResetPasswordModal({ isOpen, onClose, onSubmit }: ResetPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = await onSubmit(password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn" onClick={handleClose}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Set New Password</h2>
              <p className="text-xs text-stone-500">Choose a new password for your account</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-1">Password Updated</h3>
              <p className="text-sm text-stone-500 mb-4">Your password has been changed successfully. You can continue using AgriConnect.</p>
              <button onClick={handleClose} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors">
                Continue
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">New Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input className={inputClass} type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input className={inputClass} type="password" placeholder="Re-enter new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
