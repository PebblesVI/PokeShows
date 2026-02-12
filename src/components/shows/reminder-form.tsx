'use client';

import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';

interface ReminderFormProps {
  showSlug: string;
  showName: string;
  showDate: string;
}

const TIMING_OPTIONS = [
  { value: '1d', label: '1 day before' },
  { value: '3d', label: '3 days before' },
  { value: '7d', label: '1 week before' },
] as const;

export function ReminderForm({ showSlug, showName, showDate }: ReminderFormProps) {
  const [email, setEmail] = useState('');
  const [timing, setTiming] = useState<string>('1d');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill email from localStorage (newsletter signup)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pokeshows-email');
      if (stored) setEmail(stored);
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, showSlug, remindBefore: timing }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to set reminder');
      }

      setStatus('success');
      // Save email for future use
      try {
        localStorage.setItem('pokeshows-email', email);
      } catch {
        // ignore
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (status === 'success') {
    return (
      <div id="reminder" className="rounded-xl border border-border p-5 bg-green-50 dark:bg-green-950/20">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <Check className="h-5 w-5" />
          <span className="font-medium">Reminder set!</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          We&apos;ll email you before {showName}.
        </p>
      </div>
    );
  }

  return (
    <div id="reminder" className="rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Set a Reminder</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={timing}
          onChange={(e) => setTiming(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {TIMING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {status === 'loading' ? 'Setting...' : 'Remind Me'}
        </button>
        {status === 'error' && (
          <p className="text-xs text-red-500">{errorMsg}</p>
        )}
      </form>
    </div>
  );
}
