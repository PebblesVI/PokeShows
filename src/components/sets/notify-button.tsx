'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NotifyButtonProps {
  setId: string;
  setName: string;
  releaseDate: string;
}

export function NotifyButton({ setId, setName, releaseDate }: NotifyButtonProps) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch subscriber count on mount
  useEffect(() => {
    fetch(`/api/set-release-alerts?setId=${encodeURIComponent(setId)}`)
      .then(res => res.json())
      .then(data => {
        if (typeof data.count === 'number') {
          setSubscriberCount(data.count);
        }
      })
      .catch(() => {
        // silently ignore
      });

    // Check if already subscribed (stored in localStorage)
    try {
      const subscribed = localStorage.getItem(`set-notify-${setId}`);
      if (subscribed) {
        setSubscribed(true);
      }
    } catch {
      // localStorage might not be available
    }
  }, [setId]);

  async function handleSubscribe(email: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/set-release-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          setId,
          setName,
          releaseDate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to subscribe');
      }

      setSubscribed(true);
      setShowEmailPrompt(false);
      setSubscriberCount(prev => (prev ?? 0) + 1);

      // Store in localStorage
      try {
        localStorage.setItem(`set-notify-${setId}`, 'true');
        localStorage.setItem('pokeshows-email', email);
      } catch {
        // ignore
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  }

  function handleClick() {
    if (subscribed) return;

    // Check localStorage for email
    let storedEmail: string | null = null;
    try {
      storedEmail = localStorage.getItem('pokeshows-email');
    } catch {
      // ignore
    }

    if (storedEmail) {
      handleSubscribe(storedEmail);
    } else {
      setShowEmailPrompt(true);
    }
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailInput.trim()) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    handleSubscribe(emailInput.trim());
  }

  if (showEmailPrompt) {
    return (
      <form onSubmit={handleEmailSubmit} className="flex items-center gap-2">
        <input
          type="email"
          value={emailInput}
          onChange={(e) => {
            setEmailInput(e.target.value);
            setError(null);
          }}
          placeholder="your@email.com"
          className="h-7 w-40 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          autoFocus
        />
        <Button type="submit" size="xs" disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bell className="h-3 w-3" />}
          Notify
        </Button>
        <button
          type="button"
          onClick={() => {
            setShowEmailPrompt(false);
            setError(null);
          }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="xs"
        variant={subscribed ? 'secondary' : 'outline'}
        onClick={handleClick}
        disabled={loading || subscribed}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : subscribed ? (
          <Check className="h-3 w-3" />
        ) : (
          <Bell className="h-3 w-3" />
        )}
        {subscribed ? 'Subscribed' : 'Notify Me'}
      </Button>
      {subscriberCount !== null && subscriberCount > 0 && (
        <Badge variant="outline" className="text-[10px]">
          {subscriberCount} {subscriberCount === 1 ? 'subscriber' : 'subscribers'}
        </Badge>
      )}
      {error && !showEmailPrompt && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
