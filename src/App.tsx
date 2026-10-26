import { useState, useMemo, useCallback } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useEnquiries } from '@/hooks/useEnquiries';
import { useAuth } from '@/hooks/useAuth';
import { ProductCard, ProductCardSkeleton, ProductDetailModal } from '@/components/ProductCard';
import { AddProductModal } from '@/components/AddProductModal';
import { AuthModal } from '@/components/AuthModal';
import { ResetPasswordModal } from '@/components/ResetPasswordModal';
import { EnquiryModal } from '@/components/EnquiryModal';
import { EnquiryCard } from '@/components/EnquiryCard';
import { ToastContainer, createToast } from '@/components/Toast';
import type { ToastData, ToastType } from '@/components/Toast';
import { CATEGORIES, COUNTIES } from '@/types';
import type { Product, EnquiryInput, EnquiryStatus } from '@/types';
import { Sprout, Search, Plus, ShoppingBasket, MapPin, TrendingUp, Users, Leaf, Filter, X, LogOut, Inbox, List, Store, User as UserIcon, Wallet, CreditCard } from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';
import { useFarmerPaymentProfiles } from '@/hooks/useFarmerPaymentProfiles';
import { PaymentModal } from '@/components/PaymentModal';
import { FarmerPaymentProfileModal } from '@/components/FarmerPaymentProfileModal';
import { PaymentsSection } from '@/components/PaymentsSection';
import type { Payment, Enquiry, PaymentProvider } from '@/types';

type SortOption = 'newest' | 'price_low' | 'price_high' | 'name';
type View = 'marketplace' | 'my_listings' | 'my_enquiries' | 'payments';

export default function App() {
  const { user, profile, loading: authLoading, passwordRecovery, signOut, updatePassword } = useAuth();
  const { products, loading, error, addProduct, deleteProduct } = useProducts();
  const { enquiries, loading: enquiriesLoading, createEnquiry, updateEnquiryStatus, deleteEnquiry } = useEnquiries(user?.id ?? null);
  const { payments, loading: paymentsLoading, error: paymentsError, createPayment, reportPayment, confirmPayment, disputePayment, cancelPayment } = usePayments(user?.id ?? null);
  const isFarmer = profile?.role === 'farmer';
  const isBuyer = profile?.role === 'buyer';
  const { profiles: farmerPayProfiles, upsertProfile, toggleActive, deleteProfile } = useFarmerPaymentProfiles(isFarmer ? user?.id ?? null : null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [countyFilter, setCountyFilter] = useState<string>('All');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<View>('marketplace');
  const [enquiryProduct, setEnquiryProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [paymentEnquiry, setPaymentEnquiry] = useState<Enquiry | null>(null);
  const [paymentPerspective, setPaymentPerspective] = useState<'buyer' | 'farmer'>('buyer');
  const [showPaymentProfileModal, setShowPaymentProfileModal] = useState(false);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToasts((prev) => [...prev, createToast(message, type)]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const filtered = useMemo(() => {
    let result = [...products];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.farmer_name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'All') result = result.filter(p => p.category === categoryFilter);
    if (countyFilter !== 'All') result = result.filter(p => p.county === countyFilter);
    if (organicOnly) result = result.filter(p => p.is_organic);

    switch (sortBy) {
      case 'price_low': result.sort((a, b) => a.price - b.price); break;
      case 'price_high': result.sort((a, b) => b.price - a.price); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [products, search, categoryFilter, countyFilter, organicOnly, sortBy]);

  const myListings = useMemo(() => {
    if (!user) return [];
    return products.filter(p => p.farmer_id === user.id);
  }, [products, user]);

  const myEnquiries = useMemo(() => {
    if (!user) return [];
    return enquiries.filter(e =>
      isFarmer ? e.farmer_id === user.id : e.buyer_id === user.id
    );
  }, [enquiries, user, isFarmer]);

  const activeFilterCount = (categoryFilter !== 'All' ? 1 : 0) + (countyFilter !== 'All' ? 1 : 0) + (organicOnly ? 1 : 0);

  const clearFilters = () => {
    setCategoryFilter('All');
    setCountyFilter('All');
    setOrganicOnly(false);
  };

  const handleDelete = useCallback(async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    const result = await deleteProduct(id);
    setDeletingId(null);
    if (result.error) {
      showToast('Failed to delete product: ' + result.error, 'error');
    } else {
      showToast('Product removed from marketplace.');
      setSelectedProduct(null);
    }
  }, [deletingId, deleteProduct, showToast]);

  const handleListProductClick = () => {
    if (!user || !isFarmer) {
      setShowAuthModal(true);
    } else {
      setShowAddModal(true);
    }
  };

  
  const handleEnquireClick = (product: Product) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!product.farmer_id) {
      showToast(
        'This sample listing has no registered farmer to receive enquiries yet.',
        'error'
      );
      return;
    }

    setEnquiryProduct(product);
  };


  const handleEnquirySubmit = async (input: EnquiryInput): Promise<{ error: string | null }> => {
    if (!user) return { error: 'You must be signed in to send an enquiry.' };
    const result = await createEnquiry(input, user.id);
    if (!result.error) {
      showToast('Enquiry sent! The farmer will be able to see your message.');
    }
    return result;
  };

  
  
const handleStatusChange = async (id: string, status: EnquiryStatus) => {
  const result = await updateEnquiryStatus(id, status);

  if (result.error) {
    showToast(`Failed to update enquiry status: ${result.error}`, 'error');
  } else {
    showToast('Enquiry status updated.');
  }
};


  const handleEnquiryDelete = async (id: string) => {
    const result = await deleteEnquiry(id);
    if (result.error) {
      showToast('Failed to delete enquiry: ' + result.error, 'error');
    } else {
      showToast('Enquiry removed.');
    }
  };

  const handleAddProduct = async (
    input: import('@/types').ProductInput,
    farmerId: string,
    farmerName: string,
  ): Promise<{ error: string | null }> => {
    const result = await addProduct(input, farmerId, farmerName);
    if (!result.error) {
      showToast('Product listed on the marketplace!');
    }
    return result;
  };

  const stats = useMemo(() => {
    const counties = new Set(products.map(p => p.county));
    const farmers = new Set(products.map(p => p.farmer_name));
    const organic = products.filter(p => p.is_organic).length;
    return { total: products.length, counties: counties.size, farmers: farmers.size, organic };
  }, [products]);

  const handleOpenPaymentForEnquiry = (enquiry: Enquiry, p: 'buyer' | 'farmer') => {
    setPaymentEnquiry(enquiry);
    setPaymentPerspective(p);
  };

  const handleOpenPayment = (payment: Payment) => {
    const enquiry = enquiries.find(e => e.id === payment.enquiry_id);
    if (enquiry) {
      setPaymentEnquiry(enquiry);
      setPaymentPerspective(payment.buyer_id === user?.id ? 'buyer' : 'farmer');
    }
  };

  const handleCreatePayment = async (provider: PaymentProvider, amountLrd: number, farmerId: string): Promise<{ error: string | null }> => {
    if (!user || !paymentEnquiry) return { error: 'Missing enquiry or user.' };
    const result = await createPayment({
      enquiry_id: paymentEnquiry.id,
      farmer_id: farmerId,
      agreed_amount_lrd: amountLrd,
      provider,
    }, user.id);
    if (!result.error) {
      showToast('Payment record created.');
    }
    return result;
  };

  const handleReportPayment = async (paymentId: string, txRef: string | null): Promise<{ error: string | null }> => {
    const result = await reportPayment(paymentId, txRef);
    if (!result.error) showToast('Transfer reported. Waiting for farmer confirmation.');
    return result;
  };

  const handleConfirmPayment = async (paymentId: string): Promise<{ error: string | null }> => {
    const result = await confirmPayment(paymentId);
    if (!result.error) showToast('Payment confirmed.');
    return result;
  };

  const handleDisputePayment = async (paymentId: string, note: string | null): Promise<{ error: string | null }> => {
    const result = await disputePayment(paymentId, note);
    if (!result.error) showToast('Payment marked as disputed.');
    return result;
  };

  const handleCancelPayment = async (paymentId: string): Promise<{ error: string | null }> => {
    const result = await cancelPayment(paymentId);
    if (!result.error) showToast('Payment cancelled.');
    return result;
  };

  const handleSavePaymentProfile = async (
    provider: PaymentProvider,
    mobileMoneyNumber: string,
    recipientName: string,
    paymentInstructions: string | null,
  ): Promise<{ error: string | null }> => {
    const result = await upsertProfile(provider, mobileMoneyNumber, recipientName, paymentInstructions);
    if (!result.error) showToast('Payment details saved.');
    return result;
  };

  const canDeleteProduct = (product: Product) => !!user && product.farmer_id === user.id;
  const canEnquireProduct = !!user && isBuyer && !isFarmer;
  const isOwnProduct = (product: Product) => !!user && product.farmer_id === user.id;

  const displayName = profile?.full_name || user?.email || '';
  const farmerName = profile?.full_name || '';

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-stone-900 text-lg leading-tight">AgriConnect</h1>
                <p className="text-[10px] text-emerald-600 font-medium leading-tight tracking-wide uppercase">Liberia</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {/* Navigation for signed-in users */}
                  {isFarmer && (
                    <button
                      onClick={() => setView('my_listings')}
                      className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'my_listings' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600 hover:bg-stone-100'}`}
                    >
                      <Store className="w-4 h-4" /> My Listings
                    </button>
                  )}
                  {isFarmer && (
                    <button
                      onClick={() => setShowPaymentProfileModal(true)}
                      className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-stone-600 hover:bg-stone-100"
                    >
                      <CreditCard className="w-4 h-4" /> Payment Setup
                    </button>
                  )}
                  <button
                    onClick={() => setView('my_enquiries')}
                    className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'my_enquiries' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    <Inbox className="w-4 h-4" /> {isFarmer ? 'Enquiries' : 'My Enquiries'}
                    {myEnquiries.length > 0 && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                        {myEnquiries.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setView('payments')}
                    className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'payments' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    <Wallet className="w-4 h-4" /> Payments
                    {payments.length > 0 && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                        {payments.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setView('marketplace')}
                    className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'marketplace' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    <List className="w-4 h-4" /> Browse
                  </button>

                  {/* User menu */}
                  <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                    <div className="hidden md:flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-stone-900 leading-tight">{displayName}</p>
                        <p className="text-[10px] text-stone-500 leading-tight capitalize">{profile?.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={signOut}
                      className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-red-600 transition-colors"
                      title="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl font-semibold text-sm hover:bg-stone-800 transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
              <button
                onClick={handleListProductClick}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">List Product</span>
                <span className="sm:hidden">List</span>
              </button>
            </div>
          </div>

          {/* Mobile nav for signed-in users */}
          {user && (
            <div className="flex items-center gap-1 pb-2 sm:hidden">
              <button
                onClick={() => setView('marketplace')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === 'marketplace' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600'}`}
              >
                <List className="w-3.5 h-3.5" /> Browse
              </button>
              {isFarmer && (
                <button
                  onClick={() => setView('my_listings')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === 'my_listings' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600'}`}
                >
                  <Store className="w-3.5 h-3.5" /> Listings
                </button>
              )}
              <button
                onClick={() => setView('my_enquiries')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === 'my_enquiries' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600'}`}
              >
                <Inbox className="w-3.5 h-3.5" /> Enquiries
                {myEnquiries.length > 0 && <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">{myEnquiries.length}</span>}
              </button>
              <button
                onClick={() => setView('payments')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === 'payments' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600'}`}
              >
                <Wallet className="w-3.5 h-3.5" /> Payments
                {payments.length > 0 && <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">{payments.length}</span>}
              </button>
              {isFarmer && (
                <button
                  onClick={() => setShowPaymentProfileModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-stone-600"
                >
                  <CreditCard className="w-3.5 h-3.5" /> Setup
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Marketplace View */}
      {view === 'marketplace' && (
        <>
          {/* Hero */}
          <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-stone-900">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'url(https://images.pexels.com/photos/10403500/pexels-photo-10403500.jpeg?auto=compress&cs=tinysrgb&h=650&w=940)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }} />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-emerald-100 text-xs font-medium mb-5">
                  <Leaf className="w-3.5 h-3.5" />
                  Connecting farmers with buyers across Liberia
                </span>
                <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  Fresh produce, direct from the farm
                </h2>
                <p className="text-emerald-100 text-lg leading-relaxed mb-8">
                  Browse quality agricultural products from farmers across all 15 counties of Liberia.
                  Compare prices, contact farmers directly, and support local agriculture.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingBasket className="w-4 h-4 text-emerald-300" />
                      <span className="text-2xl font-bold text-white">{stats.total}</span>
                    </div>
                    <p className="text-xs text-emerald-200">Products Listed</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-emerald-300" />
                      <span className="text-2xl font-bold text-white">{stats.farmers}</span>
                    </div>
                    <p className="text-xs text-emerald-200">Farmers</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-emerald-300" />
                      <span className="text-2xl font-bold text-white">{stats.counties}</span>
                    </div>
                    <p className="text-xs text-emerald-200">Counties</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Leaf className="w-4 h-4 text-emerald-300" />
                      <span className="text-2xl font-bold text-white">{stats.organic}</span>
                    </div>
                    <p className="text-xs text-emerald-200">Organic</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Search & Filters Bar */}
          <div className="sticky top-16 z-30 bg-white border-b border-stone-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search products, farmers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    showFilters || activeFilterCount > 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-transparent'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2.5 rounded-xl bg-stone-100 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer border-0"
                >
                  <option value="newest">Newest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>

              {showFilters && (
                <div className="mt-3 pt-3 border-t border-stone-100 animate-slideDown">
                  <div className="flex flex-wrap items-end gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-500 mb-1.5">Category</label>
                      <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-stone-100 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer border-0">
                        <option value="All">All Categories</option>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-500 mb-1.5">County</label>
                      <select value={countyFilter} onChange={(e) => setCountyFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-stone-100 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer border-0">
                        <option value="All">All Counties</option>
                        {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pb-2">
                      <input type="checkbox" checked={organicOnly} onChange={(e) => setOrganicOnly(e.target.checked)} className="w-4 h-4 rounded accent-emerald-600" />
                      <span className="text-sm text-stone-700">Organic only</span>
                    </label>
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium pb-2">
                        <X className="w-3.5 h-3.5" /> Clear all
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category Pills */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              <button
                onClick={() => setCategoryFilter('All')}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  categoryFilter === 'All'
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
                }`}
              >
                All Products
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    categoryFilter === cat
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-stone-500">
                {loading ? 'Loading...' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-stone-400" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-1">No products found</h3>
                <p className="text-sm text-stone-500 mb-4">Try adjusting your search or filters</p>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-sm text-emerald-600 font-medium hover:text-emerald-700">
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((product) => (
  <ProductCard
    key={product.id}
    product={product}
    onClick={() => setSelectedProduct(product)}
    onDelete={canDeleteProduct(product) ? handleDelete : undefined}
    onEnquire={
      canEnquireProduct &&
      !!product.farmer_id &&
      !isOwnProduct(product)
        ? handleEnquireClick
        : undefined
    }
    canDelete={canDeleteProduct(product)}
    canEnquire={
      canEnquireProduct &&
      !!product.farmer_id &&
      !isOwnProduct(product)
    }
                  />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* My Listings View (Farmers) */}
      {view === 'my_listings' && isFarmer && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>My Listings</h2>
              <p className="text-sm text-stone-500 mt-1">{myListings.length} product{myListings.length !== 1 ? 's' : ''} listed by you</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          {myListings.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <Store className="w-7 h-7 text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-1">No listings yet</h3>
              <p className="text-sm text-stone-500 mb-4">Start selling by adding your first product</p>
              <button onClick={() => setShowAddModal(true)} className="text-sm text-emerald-600 font-medium hover:text-emerald-700">
                Add a product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {myListings.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => setSelectedProduct(product)}
                  onDelete={handleDelete}
                  canDelete={true}
                  canEnquire={false}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* My Enquiries View */}
      {view === 'my_enquiries' && user && (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              {isFarmer ? 'Product Enquiries' : 'My Enquiries'}
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              {isFarmer
                ? 'Enquiries from buyers interested in your products'
                : 'Enquiries you have sent to farmers'}
            </p>
          </div>

          {enquiriesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-stone-200 p-5 animate-pulse">
                  <div className="h-5 bg-stone-200 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-stone-200 rounded w-full mb-2" />
                  <div className="h-4 bg-stone-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : myEnquiries.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-7 h-7 text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-1">
                {isFarmer ? 'No enquiries yet' : 'No enquiries sent'}
              </h3>
              <p className="text-sm text-stone-500 mb-4">
                {isFarmer
                  ? 'When buyers enquire about your products, they will appear here'
                  : 'Browse the marketplace and enquire about products you are interested in'}
              </p>
              <button onClick={() => setView('marketplace')} className="text-sm text-emerald-600 font-medium hover:text-emerald-700">
                Go to marketplace
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myEnquiries.map((enquiry) => (
                <EnquiryCard
                  key={enquiry.id}
                  enquiry={enquiry}
                  perspective={isFarmer ? 'farmer' : 'buyer'}
                  onStatusChange={isFarmer ? handleStatusChange : undefined}
                  onDelete={isBuyer ? handleEnquiryDelete : undefined}
                  onPay={enquiry.farmer_id ? () => handleOpenPaymentForEnquiry(enquiry, isFarmer ? 'farmer' : 'buyer') : undefined}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* Payments View */}
      {view === 'payments' && user && (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Payments</h2>
              <p className="text-sm text-stone-500 mt-1">
                {isFarmer ? 'Payments from buyers for your products' : 'Your payment records to farmers'}
              </p>
            </div>
            {isFarmer && (
              <button
                onClick={() => setShowPaymentProfileModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
              >
                <CreditCard className="w-4 h-4" /> Payment Setup
              </button>
            )}
          </div>

          <PaymentsSection
            payments={payments}
            loading={paymentsLoading}
            error={paymentsError}
            perspective={isFarmer ? 'farmer' : 'buyer'}
            onOpenPayment={handleOpenPayment}
          />
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Sprout className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-stone-900 text-sm">AgriConnect Liberia</p>
                <p className="text-xs text-stone-500">Connecting farmers with buyers</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Prices in Liberian Dollars (LRD)</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
<ProductDetailModal
  product={selectedProduct}
  onClose={() => setSelectedProduct(null)}
  onEnquire={
    canEnquireProduct &&
    selectedProduct &&
    !!selectedProduct.farmer_id &&
    !isOwnProduct(selectedProduct)
      ? handleEnquireClick
      : undefined
  }
  canEnquire={
    canEnquireProduct &&
    !!selectedProduct &&
    !!selectedProduct.farmer_id &&
    !isOwnProduct(selectedProduct)
  }
      />
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProduct}
        farmerId={user?.id ?? null}
        farmerName={farmerName}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
      <ResetPasswordModal
        isOpen={passwordRecovery}
        onClose={() => { /* controlled by auth state */ }}
        onSubmit={updatePassword}
      />
      <EnquiryModal
        product={enquiryProduct}
        isOpen={!!enquiryProduct}
        onClose={() => setEnquiryProduct(null)}
        onSubmit={handleEnquirySubmit}
        defaultPhone={profile?.phone}
      />
      <PaymentModal
        enquiry={paymentEnquiry}
        isOpen={!!paymentEnquiry}
        onClose={() => setPaymentEnquiry(null)}
        buyerId={user?.id ?? null}
        perspective={paymentPerspective}
        onCreatePayment={handleCreatePayment}
        onReportPayment={handleReportPayment}
        onConfirmPayment={handleConfirmPayment}
        onDisputePayment={handleDisputePayment}
        onCancelPayment={handleCancelPayment}
      />
      {isFarmer && (
        <FarmerPaymentProfileModal
          isOpen={showPaymentProfileModal}
          onClose={() => setShowPaymentProfileModal(false)}
          farmerId={user?.id ?? null}
          existingProfiles={farmerPayProfiles}
          onSave={handleSavePaymentProfile}
          onToggleActive={toggleActive}
          onDelete={deleteProfile}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
