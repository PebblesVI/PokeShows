'use client';

import { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PriceAlertButtonProps {
  pokemonTcgId: string;
  cardName: string;
  currentPrice: number | null;
}

export function PriceAlertButton({ pokemonTcgId, cardName, currentPrice }: PriceAlertButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('pokeshows-email') || '';
    return '';
  });
  const [targetPrice, setTargetPrice] = useState(
    currentPrice ? (currentPrice * 0.8).toFixed(2) : '',
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !targetPrice) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pokemonTcgId,
          cardName,
          targetPrice: parseFloat(targetPrice),
        }),
      });

      if (res.ok) {
        setStatus('success');
        localStorage.setItem('pokeshows-email', email);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
        <Check className="h-3.5 w-3.5" /> Alert set
      </span>
    );
  }

  if (!showForm) {
    return (
      <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="gap-1.5 text-xs">
        <Bell className="h-3.5 w-3.5" />
        Price Alert
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-background">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        required
        className="rounded-md border border-border px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Alert when below $</span>
        <input
          type="number"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          step="0.01"
          min="0.01"
          required
          className="w-20 rounded-md border border-border px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={status === 'loading'} className="text-xs">
          {status === 'loading' ? 'Setting...' : 'Set Alert'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)} className="text-xs">
          Cancel
        </Button>
      </div>
    </form>
  );
}
