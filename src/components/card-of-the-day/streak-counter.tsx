'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { Flame } from 'lucide-react';

const STORAGE_KEY = 'pokeshows-cotd-streak';

interface StreakData {
  currentStreak: number;
  lastVisit: string; // YYYY-MM-DD
}

const EMPTY: StreakData = { currentStreak: 0, lastVisit: '' };

let cachedRaw: string | null = null;
let cachedParsed: StreakData = EMPTY;

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function getSnapshot(): StreakData {
  if (typeof window === 'undefined') return cachedParsed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedParsed = raw ? JSON.parse(raw) : EMPTY;
    }
    return cachedParsed;
  } catch {
    return cachedParsed;
  }
}

function getServerSnapshot(): StreakData {
  return cachedParsed;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  window.addEventListener('streak-changed', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('streak-changed', callback);
  };
}

function recordVisit() {
  const today = getTodayStr();
  const yesterday = getYesterdayStr();
  const current = getSnapshot();

  if (current.lastVisit === today) return; // Already visited today

  let newStreak: number;
  if (current.lastVisit === yesterday) {
    newStreak = current.currentStreak + 1;
  } else {
    newStreak = 1; // Reset streak
  }

  const updated: StreakData = { currentStreak: newStreak, lastVisit: today };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('streak-changed'));
}

export function StreakCounter() {
  const streak = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    recordVisit();
  }, []);

  if (streak.currentStreak < 2) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm font-semibold">
      <Flame className="h-4 w-4" />
      <span>{streak.currentStreak}-day streak</span>
    </div>
  );
}
