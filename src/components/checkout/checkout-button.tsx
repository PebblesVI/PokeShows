'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  type: string;
  label: string;
  metadata?: Record<string, string>;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function CheckoutButton({
  type,
  label,
  metadata,
  className,
  variant = 'default',
  size = 'default',
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

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

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          type,
          metadata: metadata || {},
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

      if (data.error) {
        alert(data.error);
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
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
