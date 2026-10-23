import { useCallback, useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'marketplace' }
  | { name: 'product'; id: string }
  | { name: 'farmer'; id: string }
  | { name: 'list-produce' }
  | { name: 'enquiry'; id: string }
  | { name: 'favorites' }
  | { name: 'tips' }
  | { name: 'about' }
  | { name: 'moderation' };

function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '');
  const parts = clean.split('/').filter(Boolean);

  if (parts.length === 0) return { name: 'home' };
  switch (parts[0]) {
    case 'marketplace':
      return { name: 'marketplace' };
    case 'product':
      return parts[1] ? { name: 'product', id: parts[1] } : { name: 'marketplace' };
    case 'farmer':
      return parts[1] ? { name: 'farmer', id: parts[1] } : { name: 'marketplace' };
    case 'list-produce':
      return { name: 'list-produce' };
    case 'enquiry':
      return parts[1] ? { name: 'enquiry', id: parts[1] } : { name: 'marketplace' };
    case 'favorites':
      return { name: 'favorites' };
    case 'tips':
      return { name: 'tips' };
    case 'about':
      return { name: 'about' };
    case 'moderation':
      return { name: 'moderation' };
    default:
      return { name: 'home' };
  }
}

function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'marketplace':
      return '#/marketplace';
    case 'product':
      return `#/product/${route.id}`;
    case 'farmer':
      return `#/farmer/${route.id}`;
    case 'list-produce':
      return '#/list-produce';
    case 'enquiry':
      return `#/enquiry/${route.id}`;
    case 'favorites':
      return '#/favorites';
    case 'tips':
      return '#/tips';
    case 'about':
      return '#/about';
    case 'moderation':
      return '#/moderation';
  }
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const handler = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((target: Route) => {
    const hash = routeToHash(target);
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      window.scrollTo(0, 0);
    }
    setRoute(target);
  }, []);

  return { route, navigate };
}
