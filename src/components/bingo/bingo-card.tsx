'use client';

import { useState, useSyncExternalStore, useCallback } from 'react';
import { Check, Share2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'pokeshows-bingo';

interface BingoData {
  month: string; // YYYY-MM
  completed: boolean[];
}

const BINGO_GOALS = [
  'Visit a card show',
  'Pull a holo rare',
  'Trade with someone',
  'Buy a booster box',
  'Complete a set page',
  'Find a card under $1',
  'Grade a card',
  'Win a tournament match',
  'Sell a card',
  'Teach someone to play',
  'Open a vintage pack',
  'Get a card signed',
  'FREE',
  'Find a full art',
  'Trade with a kid',
  'Buy from local shop',
  'Organize your binders',
  'Discover a new set',
  'Pull an alt art',
  'Share a pull online',
  'Build a new deck',
  'Attend 2+ shows',
  'Find a misprint',
  'Complete a challenge',
  'Help a new collector',
];

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

let cachedRaw: string | null = null;
let cachedParsed: BingoData = { month: '', completed: [] };

function getSnapshot(): BingoData {
  if (typeof window === 'undefined') return cachedParsed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      const parsed: BingoData = raw ? JSON.parse(raw) : { month: '', completed: [] };
      // Reset if month changed
      const currentMonth = getCurrentMonth();
      if (parsed.month !== currentMonth) {
        const fresh: BingoData = {
          month: currentMonth,
          completed: new Array(25).fill(false),
        };
        fresh.completed[12] = true; // FREE space
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        cachedParsed = fresh;
      } else {
        cachedParsed = parsed;
      }
    }
    return cachedParsed;
  } catch {
    return cachedParsed;
  }
}

function getServerSnapshot(): BingoData {
  return { month: getCurrentMonth(), completed: new Array(25).fill(false) };
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  window.addEventListener('bingo-changed', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('bingo-changed', callback);
  };
}

function checkBingo(completed: boolean[]): boolean {
  // Check rows
  for (let r = 0; r < 5; r++) {
    if (completed.slice(r * 5, r * 5 + 5).every(Boolean)) return true;
  }
  // Check columns
  for (let c = 0; c < 5; c++) {
    if ([0, 1, 2, 3, 4].every(r => completed[r * 5 + c])) return true;
  }
  // Check diagonals
  if ([0, 6, 12, 18, 24].every(i => completed[i])) return true;
  if ([4, 8, 12, 16, 20].every(i => completed[i])) return true;
  return false;
}

export function BingoCard() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const completed = data.completed.length === 25 ? data.completed : new Array(25).fill(false);
  const hasBingo = checkBingo(completed);
  const completedCount = completed.filter(Boolean).length;

  const toggleSquare = useCallback((index: number) => {
    if (index === 12) return; // FREE space always stays
    const current = getSnapshot();
    const next = [...current.completed];
    next[index] = !next[index];
    const updated: BingoData = { ...current, completed: next };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    cachedRaw = null; // Invalidate cache
    window.dispatchEvent(new Event('bingo-changed'));
  }, []);

  const resetCard = () => {
    const fresh: BingoData = {
      month: getCurrentMonth(),
      completed: new Array(25).fill(false),
    };
    fresh.completed[12] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    cachedRaw = null;
    window.dispatchEvent(new Event('bingo-changed'));
  };

  const shareResults = async () => {
    const grid = completed.map(c => c ? '🟨' : '⬜');
    let text = `PokeShows Bingo - ${data.month}\n`;
    for (let r = 0; r < 5; r++) {
      text += grid.slice(r * 5, r * 5 + 5).join('') + '\n';
    }
    text += `${completedCount}/25 complete${hasBingo ? ' - BINGO!' : ''}\npokeshows.com/bingo`;

    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch {
      // Fallback
    }
  };

  const monthLabel = new Date(data.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">{monthLabel} Challenge</p>
          <p className="text-sm font-medium">{completedCount}/25 complete</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={shareResults} className="gap-1.5">
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
          <Button variant="outline" size="sm" onClick={resetCard} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      {hasBingo && (
        <div className="mb-4 p-3 rounded-lg bg-primary/10 text-primary font-bold text-center text-lg">
          BINGO! You got a line!
        </div>
      )}

      <div className="grid grid-cols-5 gap-1.5">
        {['B', 'I', 'N', 'G', 'O'].map((letter) => (
          <div
            key={letter}
            className="text-center font-bold text-lg py-2 bg-primary text-primary-foreground rounded-lg"
          >
            {letter}
          </div>
        ))}
        {BINGO_GOALS.map((goal, i) => {
          const isCompleted = completed[i];
          const isFree = i === 12;

          return (
            <button
              key={i}
              onClick={() => toggleSquare(i)}
              className={`aspect-square rounded-lg border text-[10px] sm:text-xs p-1 flex flex-col items-center justify-center text-center transition-all duration-200 ${
                isCompleted
                  ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                  : 'border-border hover:border-primary/20 text-muted-foreground'
              }`}
            >
              {isCompleted && <Check className="h-3 w-3 mb-0.5 shrink-0" />}
              <span className="leading-tight">{isFree ? 'FREE' : goal}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
