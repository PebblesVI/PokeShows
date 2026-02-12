'use client';

import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ReviewForm({ showSlug }: { showSlug: string }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('pokeshows-email') || '';
    return '';
  });
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !email || !displayName) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showSlug, email, displayName, rating, text }),
      });

      if (res.ok) {
        setStatus('success');
        localStorage.setItem('pokeshows-email', email);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to submit review');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Failed to submit review');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6 text-center">
        <p className="text-green-700 dark:text-green-400 font-medium">Thanks for your review!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">Leave a Review</h3>

      {/* Star rating */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-0.5"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (hoveredRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground/30'
              }`}
            />
          </button>
        ))}
        {rating > 0 && <span className="text-sm text-muted-foreground ml-2">{rating}/5</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          required
          maxLength={50}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (not shown publicly)"
          required
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share your experience (optional)"
        maxLength={1000}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      {status === 'error' && (
        <p className="text-sm text-red-500">{errorMsg}</p>
      )}

      <Button type="submit" disabled={rating === 0 || !email || !displayName || status === 'loading'} className="gap-2">
        <Send className="h-4 w-4" />
        {status === 'loading' ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}
