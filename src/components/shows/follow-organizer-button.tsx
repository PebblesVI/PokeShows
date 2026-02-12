'use client';

import { useState } from 'react';
import { UserPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FollowOrganizerButton({ organizerName }: { organizerName: string }) {
  const [showForm, setShowForm] = useState(false);
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
      const res = await fetch('/api/organizer-follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, organizerName }),
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
        <Check className="h-3.5 w-3.5" /> Following
      </span>
    );
  }

  if (!showForm) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowForm(true)}
        className="gap-1.5 text-xs h-7"
      >
        <UserPlus className="h-3.5 w-3.5" />
        Follow
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="inline-flex items-center gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        required
        className="w-40 rounded-md border border-border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <Button type="submit" size="sm" disabled={status === 'loading'} className="text-xs h-7">
        {status === 'loading' ? '...' : 'Follow'}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)} className="text-xs h-7">
        Cancel
      </Button>
    </form>
  );
}
