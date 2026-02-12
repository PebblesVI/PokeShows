'use client';

import { createContext, useContext, useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'pokeshows-wishlist';

interface WishlistCard {
  cardId: string;
  name: string;
  setName: string;
  imageSmall: string;
  rarity: string | null;
  addedAt: string;
}

let cachedRaw: string | null = null;
let cachedParsed: WishlistCard[] = [];

function getSnapshot(): WishlistCard[] {
  if (typeof window === 'undefined') return cachedParsed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedParsed = raw ? JSON.parse(raw) : [];
    }
    return cachedParsed;
  } catch {
    return cachedParsed;
  }
}

function getServerSnapshot(): WishlistCard[] {
  return cachedParsed;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  window.addEventListener('wishlist-changed', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('wishlist-changed', callback);
  };
}

interface WishlistContextType {
  wishlist: WishlistCard[];
  isInWishlist: (cardId: string) => boolean;
  addCard: (card: Omit<WishlistCard, 'addedAt'>) => void;
  removeCard: (cardId: string) => void;
  toggleCard: (card: Omit<WishlistCard, 'addedAt'>) => void;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  isInWishlist: () => false,
  addCard: () => {},
  removeCard: () => {},
  toggleCard: () => {},
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const wishlist = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isInWishlist = useCallback((cardId: string) => {
    return wishlist.some(c => c.cardId === cardId);
  }, [wishlist]);

  const addCard = useCallback((card: Omit<WishlistCard, 'addedAt'>) => {
    const current = getSnapshot();
    if (current.some(c => c.cardId === card.cardId)) return;
    const next = [...current, { ...card, addedAt: new Date().toISOString() }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('wishlist-changed'));
  }, []);

  const removeCard = useCallback((cardId: string) => {
    const current = getSnapshot();
    const next = current.filter(c => c.cardId !== cardId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('wishlist-changed'));
  }, []);

  const toggleCard = useCallback((card: Omit<WishlistCard, 'addedAt'>) => {
    const current = getSnapshot();
    if (current.some(c => c.cardId === card.cardId)) {
      const next = current.filter(c => c.cardId !== card.cardId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      const next = [...current, { ...card, addedAt: new Date().toISOString() }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    window.dispatchEvent(new Event('wishlist-changed'));
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlist, isInWishlist, addCard, removeCard, toggleCard }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
