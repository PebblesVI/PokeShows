'use client';

import { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShowAlertFormProps {
  state: string;
  city?: string;
  stateName?: string;
}

export function ShowAlertForm({ state, city, stateName }: ShowAlertFormProps) {
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('pokeshows-email') || '';
    return '';
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/show-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, state, city: city || '' }),
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
      <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 flex items-center gap-2">
        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
        <p className="text-sm text-green-700 dark:text-green-400">
          You&apos;ll be notified when new shows are added{city ? ` in ${city}` : stateName ? ` in ${stateName}` : ''}.
        </p>
      </div>
    );
  }

  const locationLabel = city || stateName || state;

  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Get Notified About New Shows</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        We&apos;ll email you when new shows are added in {locationLabel}.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          required
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <Button type="submit" size="sm" disabled={status === 'loading'}>
          {status === 'loading' ? 'Saving...' : 'Notify Me'}
        </Button>
      </form>
      {status === 'error' && (
        <p className="text-xs text-red-500 mt-2">Something went wrong. Please try again.</p>
      )}
    </div>
  );
}
