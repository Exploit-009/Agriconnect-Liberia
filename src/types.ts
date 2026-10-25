export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  quantity_available: number;
  farmer_name: string;
  county: string;
  description: string;
  image_url: string;
  quality_grade: string;
  is_organic: boolean;
  contact_phone: string;
  farmer_id: string | null;
  created_at: string;
  updated_at: string;
}

export type ProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'farmer_id'>;

export type UserRole = 'farmer' | 'buyer';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  county: string;
  phone: string;
  bio: string;
  avatar_url: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export type EnquiryStatus = 'pending' | 'contacted' | 'closed';

export interface Enquiry {
  id: string;
  product_id: string;
  buyer_id: string;
  farmer_id: string | null;
  message: string;
  quantity_requested: string;
  status: EnquiryStatus;
  contact_phone: string;
  created_at: string;
  updated_at: string;
  product?: Product;
  buyer?: Profile;
}

export type EnquiryInput = {
  product_id: string;
  farmer_id: string | null;
  message: string;
  quantity_requested: string;
  contact_phone: string;
};

export const CATEGORIES = [
  'Grains',
  'Vegetables',
  'Fruits',
  'Roots & Tubers',
  'Livestock',
  'Oils & Fats',
  'Spices',
  'Other',
] as const;

export const COUNTIES = [
  'Bomi',
  'Bong',
  'Gbarpolu',
  'Grand Bassa',
  'Grand Cape Mount',
  'Grand Gedeh',
  'Grand Kru',
  'Lofa',
  'Margibi',
  'Maryland',
  'Montserrado',
  'Nimba',
  'River Cess',
  'River Gee',
  'Sinoe',
] as const;

export const QUALITY_GRADES = ['Premium', 'Grade A', 'Grade B'] as const;

export type PaymentProvider = 'orange_money' | 'mtn_momo';

export type PaymentStatus = 'not_started' | 'reported' | 'confirmed' | 'disputed' | 'cancelled';

export interface FarmerPaymentProfile {
  id: string;
  farmer_id: string;
  provider: PaymentProvider;
  mobile_money_number: string;
  recipient_name: string;
  payment_instructions: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  enquiry_id: string;
  buyer_id: string;
  farmer_id: string;
  agreed_amount_lrd: number;
  provider: PaymentProvider;
  status: PaymentStatus;
  transaction_reference: string | null;
  farmer_confirmed_at: string | null;
  buyer_reported_at: string | null;
  cancelled_at: string | null;
  disputed_at: string | null;
  dispute_note: string | null;
  created_at: string;
  updated_at: string;
  enquiry?: Enquiry;
}

export type PaymentInput = {
  enquiry_id: string;
  farmer_id: string;
  agreed_amount_lrd: number;
  provider: PaymentProvider;
};

export const PAYMENT_PROVIDERS: { value: PaymentProvider; label: string }[] = [
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'mtn_momo', label: 'Lonestar Cell MTN MoMo' },
];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  not_started: 'Not Started',
  reported: 'Reported',
  confirmed: 'Confirmed',
  disputed: 'Disputed',
  cancelled: 'Cancelled',
};
