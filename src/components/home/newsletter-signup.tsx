'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('You\'re subscribed! We\'ll keep you posted on upcoming shows.');
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
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center max-w-xl mx-auto">
        <p className="text-primary font-medium">{message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto text-center">
      <h3 className="text-xl font-bold mb-2">Never Miss a Show</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Get weekly updates on upcoming Pokemon card shows in your area.
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
  );
}
