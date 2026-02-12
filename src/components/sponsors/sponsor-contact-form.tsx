'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function SponsorContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      businessName: (form.elements.namedItem('businessName') as HTMLInputElement).value,
      sponsorType: (form.elements.namedItem('sponsorType') as HTMLSelectElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch('/api/sponsor-request', {
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
        <p className="font-medium text-green-800 dark:text-green-300">Thanks for your interest!</p>
        <p className="text-sm text-green-600 dark:text-green-400 mt-1">We&apos;ll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Your Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div>
        <label htmlFor="businessName" className="block text-sm font-medium mb-1">Business / Store Name</label>
        <input
          type="text"
          id="businessName"
          name="businessName"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div>
        <label htmlFor="sponsorType" className="block text-sm font-medium mb-1">What are you interested in?</label>
        <select
          id="sponsorType"
          name="sponsorType"
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="cotd">Sponsored Card of the Day</option>
          <option value="vendor">Featured Vendor Listing</option>
          <option value="general">General Sponsorship / Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">Message (optional)</label>
        <textarea
          id="message"
          name="message"
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          placeholder="Tell us about your business, what cards you specialize in, etc."
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
      )}

      <Button type="submit" disabled={status === 'loading'} className="w-full sm:w-auto">
        {status === 'loading' ? 'Sending...' : 'Send Request'}
      </Button>
    </form>
  );
}
