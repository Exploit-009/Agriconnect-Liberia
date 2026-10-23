import type { Route } from '@/hooks/useRouter';

export function formatLRD(amount: number): string {
  return `LRD ${amount.toLocaleString('en-LR')}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function availabilityColor(status: string): string {
  switch (status) {
    case 'In stock':
      return 'bg-leaf-100 text-leaf-700';
    case 'Limited':
      return 'bg-cream-200 text-cream-800';
    case 'Pre-order':
      return 'bg-forest-100 text-forest-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export function navLink(route: Route): string {
  switch (route.name) {
    case 'home': return '#/';
    case 'marketplace': return '#/marketplace';
    case 'list-produce': return '#/list-produce';
    case 'favorites': return '#/favorites';
    case 'tips': return '#/tips';
    case 'about': return '#/about';
    case 'moderation': return '#/moderation';
    case 'product': return `#/product/${route.id}`;
    case 'farmer': return `#/farmer/${route.id}`;
    case 'enquiry': return `#/enquiry/${route.id}`;
  }
}
