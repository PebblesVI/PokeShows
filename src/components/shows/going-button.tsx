'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'pokeshows-going';

let cachedRaw: string | null = null;
let cachedParsed: string[] = [];

function getSnapshot(): string[] {
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

function getServerSnapshot(): string[] {
  return cachedParsed;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  window.addEventListener('going-changed', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('going-changed', callback);
  };
}

export function GoingButton({ showSlug, size = 'icon' }: { showSlug: string; size?: 'icon' | 'default' }) {
  const goingSlugs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isGoing = goingSlugs.includes(showSlug);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/shows/going?slug=${encodeURIComponent(showSlug)}`)
      .then(r => r.json())
      .then(d => setCount(d.count ?? 0))
      .catch(() => {});
  }, [showSlug, isGoing]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let email = localStorage.getItem('pokeshows-email') || '';

    // Prompt for email if not already stored (for pre-show kit emails)
    if (!isGoing && !email) {
      const prompted = window.prompt(
        'Enter your email to get a free Show Day Prep Kit with price guides and supply checklists 2 days before the show (optional):'
      );
      if (prompted && prompted.includes('@')) {
        email = prompted.trim();
        localStorage.setItem('pokeshows-email', email);
      }
    }

    try {
      const res = await fetch('/api/shows/going', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showSlug, email, action: isGoing ? 'remove' : 'add' }),
      });

      if (res.ok) {
        const current = getSnapshot();
        const next = isGoing
          ? current.filter(s => s !== showSlug)
          : [...current, showSlug];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event('going-changed'));
      }
    } catch {
      // Silently fail
    }
  };

  if (size === 'default') {
    return (
      <Button
        variant={isGoing ? 'default' : 'outline'}
        size="sm"
        onClick={handleToggle}
        className="gap-2"
      >
        <Users className="h-4 w-4" />
        {isGoing ? "I'm Going!" : "I'm Going"}
        {count !== null && count > 0 && (
          <span className="text-xs opacity-75">({count})</span>
        )}
      </Button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
        isGoing
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-muted-foreground hover:bg-accent/20'
      }`}
      aria-label={isGoing ? 'Cancel going' : 'Mark as going'}
    >
      <Users className="h-3 w-3" />
      {count !== null && count > 0 && <span>{count} going</span>}
    </button>
  );
}
