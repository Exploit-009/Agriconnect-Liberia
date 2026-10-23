import { Wheat, Sprout, Cookie, Banana, Carrot, TreePalm, Apple, Dot, Droplet } from 'lucide-react';
import type { Category } from '@/types';

const ICONS: Record<Category, typeof Wheat> = {
  'Rice': Wheat,
  'Cassava': Sprout,
  'Cocoa': Cookie,
  'Plantain': Banana,
  'Vegetables': Carrot,
  'Palm Products': TreePalm,
  'Fruits': Apple,
  'Legumes': Dot,
  'Rubber': Droplet,
};

interface CategoryIconProps {
  category: Category;
  size?: number;
  className?: string;
}

export function CategoryIcon({ category, size = 24, className = '' }: CategoryIconProps) {
  const Icon = ICONS[category] ?? Dot;
  return <Icon size={size} className={className} />;
}

export const CATEGORY_ICON_MAP = ICONS;
