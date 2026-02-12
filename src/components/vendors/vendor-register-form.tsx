'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { US_STATE_NAMES } from '@/lib/constants';
import { CheckCircle } from 'lucide-react';

const SPECIALTY_OPTIONS = [
  'vintage',
  'graded',
  'japanese',
  'sealed',
  'singles',
  'accessories',
  'bulk',
  'custom',
];

export function VendorRegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  function toggleSpecialty(specialty: string) {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty],
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      website: formData.get('website') as string,
      state: formData.get('state') as string,
      city: formData.get('city') as string,
      description: formData.get('description') as string,
      specialties: selectedSpecialties,
    };

    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to register');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 p-6 text-center">
        <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-1">Registration Submitted!</h3>
        <p className="text-sm text-muted-foreground">
          Your business listing has been submitted. It will appear in the directory shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="vendor-name" className="block text-sm font-medium mb-1">Business Name *</label>
        <Input id="vendor-name" name="name" required placeholder="e.g. Vintage Pokemon Cards LLC" />
      </div>

      <div>
        <label htmlFor="vendor-email" className="block text-sm font-medium mb-1">Email *</label>
        <Input id="vendor-email" name="email" type="email" required placeholder="contact@yourbusiness.com" />
      </div>

      <div>
        <label htmlFor="vendor-website" className="block text-sm font-medium mb-1">Website</label>
        <Input id="vendor-website" name="website" type="url" placeholder="https://..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="vendor-city" className="block text-sm font-medium mb-1">City</label>
          <Input id="vendor-city" name="city" placeholder="e.g. Austin" />
        </div>
        <div>
          <label htmlFor="vendor-state" className="block text-sm font-medium mb-1">State *</label>
          <select
            id="vendor-state"
            name="state"
            required
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select state</option>
            {Object.entries(US_STATE_NAMES).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="vendor-description" className="block text-sm font-medium mb-1">Description</label>
        <textarea
          id="vendor-description"
          name="description"
          rows={3}
          maxLength={2000}
          placeholder="Tell buyers about your business..."
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Specialties</label>
        <div className="flex flex-wrap gap-2">
          {SPECIALTY_OPTIONS.map((specialty) => (
            <button
              key={specialty}
              type="button"
              onClick={() => toggleSpecialty(specialty)}
              className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                selectedSpecialties.includes(specialty)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/30 border-border hover:border-primary/30'
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Submitting...' : 'Register Your Business'}
      </Button>
    </form>
  );
}
