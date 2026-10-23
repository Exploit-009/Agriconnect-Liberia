export type County =
  | 'Margibi'
  | 'Montserrado'
  | 'Bong'
  | 'Nimba'
  | 'Lofa'
  | 'Grand Bassa';

export type Category =
  | 'Rice'
  | 'Cassava'
  | 'Cocoa'
  | 'Plantain'
  | 'Vegetables'
  | 'Palm Products'
  | 'Fruits'
  | 'Legumes'
  | 'Rubber';

export type Unit = '50kg bag' | '25kg bag' | 'bunch' | 'crate' | 'kg' | 'litre' | 'gallon' | 'peck';

export interface Produce {
  id: string;
  name: string;
  category: Category;
  county: County;
  farmerId: string;
  farmerName: string;
  priceLRD: number;
  unit: Unit;
  quantityAvailable: number;
  harvestDate: string;
  availability: 'In stock' | 'Limited' | 'Pre-order';
  description: string;
  images: string[];
  isDemoData: boolean;
  userCreated?: boolean;
  createdAt: string;
}

export interface Farmer {
  id: string;
  name: string;
  county: County;
  village: string;
  specialties: Category[];
  bio: string;
  image: string;
  yearsFarming: number;
  isDemoData: boolean;
}

export interface Tip {
  id: string;
  title: string;
  category: string;
  content: string;
  isExpertVerified: boolean;
  source: string;
}

export const COUNTIES: County[] = [
  'Margibi',
  'Montserrado',
  'Bong',
  'Nimba',
  'Lofa',
  'Grand Bassa',
];

export const CATEGORIES: Category[] = [
  'Rice',
  'Cassava',
  'Cocoa',
  'Plantain',
  'Vegetables',
  'Palm Products',
  'Fruits',
  'Legumes',
  'Rubber',
];

export const CATEGORY_ICONS: Record<Category, string> = {
  'Rice': 'Wheat',
  'Cassava': 'Sprout',
  'Cocoa': 'Cookie',
  'Plantain': 'Banana',
  'Vegetables': 'Carrot',
  'Palm Products': 'TreePalm',
  'Fruits': 'Apple',
  'Legumes': 'Dot',
  'Rubber': 'Droplet',
};
