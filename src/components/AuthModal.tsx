import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { safeSupabaseCall } from '@/lib/supabaseError';
import { COUNTIES, type UserRole } from '@/types';
import { X, Sprout, ShoppingBasket, Loader2, Mail, Lock, User as UserIcon, MapPin, Phone, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [role, setRole] = useState<UserRole>('buyer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [county, setCounty] = useState('Montserrado');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setCounty('Montserrado');
    setPhone('');
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setInfo(null);

    if (!email.trim() || (mode !== 'forgot' && !password.trim())) {
      setError('Please enter your email and password.');
      setSubmitting(false);
      return;
    }

    try {
      if (mode === 'forgot') {
        const { error: resetError } = await safeSupabaseCall(
          supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: window.location.origin,
          }),
        );

        if (resetError) {
          setError(resetError.message);
          setSubmitting(false);
          return;
        }

        setInfo('Password reset link sent. Check your email inbox (and spam folder) for instructions to reset your password.');
        setSubmitting(false);
        return;
      }

      if (mode === 'signup') {
        if (!fullName.trim()) {
          setError('Please enter your full name.');
          setSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setSubmitting(false);
          return;
        }

        const { error: signUpError } = await safeSupabaseCall(
          supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName, county, phone, role },
              emailRedirectTo: window.location.origin,
            },
          }),
        );

        if (signUpError) {
          setError(signUpError.message);
          setSubmitting(false);
          return;
        }

        const { data: { session } } = await safeSupabaseCall(supabase.auth.getSession());
        if (!session) {
          setError('Account created! Please sign in with your email and password.');
          setMode('signin');
          setSubmitting(false);
          return;
        }

        setSubmitting(false);
        resetForm();
        onSuccess();
      } else {
        const { error: signInError } = await safeSupabaseCall(
          supabase.auth.signInWithPassword({ email, password }),
        );
        if (signInError) {
          setError(signInError.message);
          setSubmitting(false);
          return;
        }
        setSubmitting(false);
        resetForm();
        onSuccess();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setError(message);
      setSubmitting(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm";
  const labelClass = "block text-xs font-medium text-stone-600 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              {mode === 'forgot' ? (
                <KeyRound className="w-5 h-5 text-emerald-600" />
              ) : (
                <Sprout className="w-5 h-5 text-emerald-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                {mode === 'forgot' ? 'Reset Password' : mode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-xs text-stone-500">
                {mode === 'forgot' ? 'We will email you a reset link' : mode === 'signin' ? 'Sign in to your AgriConnect account' : 'Join the AgriConnect marketplace'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Mode toggle */}
          {mode !== 'forgot' && (
            <div className="flex gap-2 p-1 bg-stone-100 rounded-xl mb-5">
              <button
                onClick={() => { setMode('signin'); setError(null); setInfo(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'signin' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('signup'); setError(null); setInfo(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'signup' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'}`}
              >
                Sign Up
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <button
              onClick={() => { setMode('signin'); setError(null); setInfo(null); }}
              className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </button>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {info && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{info}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className={labelClass}>I am a...</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('farmer')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${role === 'farmer' ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 hover:border-stone-300'}`}
                    >
                      <Sprout className={`w-6 h-6 ${role === 'farmer' ? 'text-emerald-600' : 'text-stone-400'}`} />
                      <span className={`text-sm font-medium ${role === 'farmer' ? 'text-emerald-700' : 'text-stone-600'}`}>Farmer</span>
                      <span className="text-[10px] text-stone-400 text-center">List products for sale</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('buyer')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${role === 'buyer' ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 hover:border-stone-300'}`}
                    >
                      <ShoppingBasket className={`w-6 h-6 ${role === 'buyer' ? 'text-emerald-600' : 'text-stone-400'}`} />
                      <span className={`text-sm font-medium ${role === 'buyer' ? 'text-emerald-700' : 'text-stone-600'}`}>Buyer</span>
                      <span className="text-[10px] text-stone-400 text-center">Browse and enquire</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Full Name *</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input className={inputClass} type="text" placeholder="e.g. Mary Tuah" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>County</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 z-10" />
                      <select className={inputClass} value={county} onChange={(e) => setCounty(e.target.value)}>
                        {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input className={inputClass} type="tel" placeholder="+231 ..." value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className={labelClass}>Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input className={inputClass} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className={labelClass}>Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input className={inputClass} type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>
            )}

            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => { setMode('forgot'); setError(null); setInfo(null); }}
                className="text-xs text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
              >
                Forgot password?
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</>
              ) : mode === 'forgot' ? (
                <><Mail className="w-4 h-4" /> Send Reset Link</>
              ) : mode === 'signin' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
