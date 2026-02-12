'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

export function GradingQuoteForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      cardCount: parseInt((form.elements.namedItem('cardCount') as HTMLInputElement).value),
      estimatedValue: (form.elements.namedItem('estimatedValue') as HTMLSelectElement).value,
      preferredService: (form.elements.namedItem('preferredService') as HTMLSelectElement).value || null,
      turnaroundPreference: (form.elements.namedItem('turnaroundPreference') as HTMLSelectElement).value || null,
    };

    try {
      const res = await fetch('/api/grading-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 text-center">
        <p className="font-medium text-green-800 dark:text-green-300">Quote request submitted!</p>
        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
          We&apos;ll connect you with grading services that match your needs within 48 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="gq-name" className="block text-sm font-medium mb-1">Your Name</label>
          <input
            type="text"
            id="gq-name"
            name="name"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label htmlFor="gq-email" className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            id="gq-email"
            name="email"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="gq-count" className="block text-sm font-medium mb-1">How many cards?</label>
          <input
            type="number"
            id="gq-count"
            name="cardCount"
            min={1}
            max={10000}
            required
            placeholder="e.g. 10"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label htmlFor="gq-value" className="block text-sm font-medium mb-1">Estimated Total Value</label>
          <select
            id="gq-value"
            name="estimatedValue"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="under-100">Under $100</option>
            <option value="100-500">$100 – $500</option>
            <option value="500-2000">$500 – $2,000</option>
            <option value="2000-10000">$2,000 – $10,000</option>
            <option value="over-10000">Over $10,000</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="gq-service" className="block text-sm font-medium mb-1">Preferred Service</label>
          <select
            id="gq-service"
            name="preferredService"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">No preference</option>
            <option value="PSA">PSA</option>
            <option value="CGC">CGC</option>
            <option value="BGS">BGS</option>
            <option value="ACE">ACE</option>
          </select>
        </div>
        <div>
          <label htmlFor="gq-turnaround" className="block text-sm font-medium mb-1">Turnaround Preference</label>
          <select
            id="gq-turnaround"
            name="turnaroundPreference"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">No preference</option>
            <option value="economy">Economy (lowest cost)</option>
            <option value="standard">Standard</option>
            <option value="express">Express (fastest)</option>
          </select>
        </div>
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
      )}

      <Button type="submit" disabled={status === 'loading'} className="gap-2">
        <Send className="h-4 w-4" />
        {status === 'loading' ? 'Submitting...' : 'Get a Quote'}
      </Button>
    </form>
  );
}
