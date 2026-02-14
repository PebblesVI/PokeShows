'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SponsorBookButtonProps {
  type: string;
  label: string;
}

export function SponsorBookButton({ type, label }: SponsorBookButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleClick = async () => {
    let email = localStorage.getItem('pokeshows-email') || '';

    if (!email) {
      const prompted = window.prompt('Enter your email to continue:');
      if (!prompted) return;
      email = prompted.trim();
      if (!email) return;
      localStorage.setItem('pokeshows-email', email);
    }

    setLoading(true);
    setError(false);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          type,
          metadata: {},
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.fallback) {
        window.location.href = data.fallback;
        return;
      }

      // No URL returned — show fallback
      setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Online checkout is not available right now.
        </p>
        <Link
          href="/sponsors"
          className="text-sm text-primary hover:underline font-medium"
        >
          Contact us instead
        </Link>
      </div>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant="outline"
      size="sm"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        label
      )}
    </Button>
  );
}
