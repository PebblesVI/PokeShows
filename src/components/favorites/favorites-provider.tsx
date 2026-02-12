'use client';

import { createContext, useContext, useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'pokeshows-planner';
const OLD_STORAGE_KEY = 'pokeshows-favorites';

const DEFAULT_CHECKLIST = [false, false, false, false, false, false];

interface PlannerData {
  savedShows: string[];
  notes: Record<string, string>;
  checklist: Record<string, boolean[]>;
}

const EMPTY_PLANNER: PlannerData = {
  savedShows: [],
  notes: {},
  checklist: {},
};

// Cache the snapshot so useSyncExternalStore gets a stable reference
let cachedRaw: string | null = null;
let cachedParsed: PlannerData = EMPTY_PLANNER;

function migrateOldFavorites(): PlannerData | null {
  if (typeof window === 'undefined') return null;
  try {
    const oldRaw = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldRaw) {
      const oldFavorites: string[] = JSON.parse(oldRaw);
      const migrated: PlannerData = {
        savedShows: oldFavorites,
        notes: {},
        checklist: {},
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      localStorage.removeItem(OLD_STORAGE_KEY);
      return migrated;
    }
  } catch {
    // Ignore migration errors
  }
  return null;
}

function getSnapshot(): PlannerData {
  if (typeof window === 'undefined') return cachedParsed;
  try {
    let raw = localStorage.getItem(STORAGE_KEY);

    // If no planner data exists, try migrating from old format
    if (!raw) {
      const migrated = migrateOldFavorites();
      if (migrated) {
        raw = localStorage.getItem(STORAGE_KEY);
      }
    }

    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedParsed = raw ? JSON.parse(raw) : EMPTY_PLANNER;
    }
    return cachedParsed;
  } catch {
    return cachedParsed;
  }
}

function getServerSnapshot(): PlannerData {
  return cachedParsed;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  window.addEventListener('favorites-changed', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('favorites-changed', callback);
  };
}

function savePlannerData(data: PlannerData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('favorites-changed'));
}

interface FavoritesContextType {
  favorites: string[];
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
  getNote: (slug: string) => string;
  setNote: (slug: string, text: string) => void;
  getChecklist: (slug: string) => boolean[];
  toggleChecklistItem: (slug: string, index: number) => void;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
  getNote: () => '',
  setNote: () => {},
  getChecklist: () => [...DEFAULT_CHECKLIST],
  toggleChecklistItem: () => {},
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const plannerData = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const favorites = plannerData.savedShows;

  const isFavorite = useCallback((slug: string) => {
    return favorites.includes(slug);
  }, [favorites]);

  const toggleFavorite = useCallback((slug: string) => {
    const current = getSnapshot();
    const next = current.savedShows.includes(slug)
      ? current.savedShows.filter(s => s !== slug)
      : [...current.savedShows, slug];
    savePlannerData({ ...current, savedShows: next });
  }, []);

  const getNote = useCallback((slug: string) => {
    return plannerData.notes[slug] || '';
  }, [plannerData]);

  const setNote = useCallback((slug: string, text: string) => {
    const current = getSnapshot();
    savePlannerData({
      ...current,
      notes: { ...current.notes, [slug]: text },
    });
  }, []);

  const getChecklist = useCallback((slug: string) => {
    return plannerData.checklist[slug] || [...DEFAULT_CHECKLIST];
  }, [plannerData]);

  const toggleChecklistItem = useCallback((slug: string, index: number) => {
    const current = getSnapshot();
    const existing = current.checklist[slug] || [...DEFAULT_CHECKLIST];
    const updated = [...existing];
    updated[index] = !updated[index];
    savePlannerData({
      ...current,
      checklist: { ...current.checklist, [slug]: updated },
    });
  }, []);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      isFavorite,
      toggleFavorite,
      getNote,
      setNote,
      getChecklist,
      toggleChecklistItem,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
