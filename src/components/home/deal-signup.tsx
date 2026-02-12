'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tag } from 'lucide-react';

export function DealSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/deal-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('You\'re in! Watch your inbox for daily card deals.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-8 text-center max-w-2xl mx-auto">
        <Tag className="mx-auto mb-3 h-8 w-8 text-primary" />
        <p className="text-primary font-semibold text-lg">{message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto rounded-xl border-2 border-primary/30 bg-card p-8">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 rounded-lg bg-primary/10 p-3">
          <Tag className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1">Daily Card Deals</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Get the best card deal every day &mdash; straight to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={status === 'loading'} className="rounded-full px-6">
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
          {status === 'error' && (
            <p className="text-xs text-destructive mt-2">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
