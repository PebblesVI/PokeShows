'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { US_STATE_NAMES } from '@/lib/constants';

export function SubmitShowForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get('name') as string,
      venueName: formData.get('venueName') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zipCode: formData.get('zipCode') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      admissionPrice: formData.get('admissionPrice') as string,
      organizerName: formData.get('organizerName') as string,
      websiteUrl: formData.get('websiteUrl') as string,
      description: formData.get('description') as string,
      eventType: formData.get('eventType') as string,
      isPokemonSpecific: formData.get('isPokemonSpecific') === 'on',
    };

    try {
      const res = await fetch('/api/submit-show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setFieldErrors(data.details);
        }
        setError(data.error || 'Failed to submit show');
        setLoading(false);
        return;
      }

      router.push(`/shows/${data.slug}`);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Show Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Show Name *</label>
        <Input id="name" name="name" required placeholder="e.g. Dallas Pokemon Card Show" />
        {fieldErrors.name && <p className="text-xs text-destructive mt-1">{fieldErrors.name[0]}</p>}
      </div>

      {/* Venue */}
      <div>
        <label htmlFor="venueName" className="block text-sm font-medium mb-1">Venue Name *</label>
        <Input id="venueName" name="venueName" required placeholder="e.g. Dallas Convention Center" />
        {fieldErrors.venueName && <p className="text-xs text-destructive mt-1">{fieldErrors.venueName[0]}</p>}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1">Address</label>
        <Input id="address" name="address" placeholder="e.g. 650 S Griffin St" />
      </div>

      {/* City & State */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">City *</label>
          <Input id="city" name="city" required placeholder="e.g. Dallas" />
          {fieldErrors.city && <p className="text-xs text-destructive mt-1">{fieldErrors.city[0]}</p>}
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium mb-1">State *</label>
          <select
            id="state"
            name="state"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select state</option>
            {Object.entries(US_STATE_NAMES).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
          {fieldErrors.state && <p className="text-xs text-destructive mt-1">{fieldErrors.state[0]}</p>}
        </div>
      </div>

      {/* Zip Code */}
      <div>
        <label htmlFor="zipCode" className="block text-sm font-medium mb-1">Zip Code</label>
        <Input id="zipCode" name="zipCode" placeholder="e.g. 75202" maxLength={10} />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-1">Start Date *</label>
          <Input id="startDate" name="startDate" type="date" required />
          {fieldErrors.startDate && <p className="text-xs text-destructive mt-1">{fieldErrors.startDate[0]}</p>}
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium mb-1">End Date</label>
          <Input id="endDate" name="endDate" type="date" />
        </div>
      </div>

      {/* Times */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium mb-1">Start Time</label>
          <Input id="startTime" name="startTime" placeholder="e.g. 10:00 AM" />
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium mb-1">End Time</label>
          <Input id="endTime" name="endTime" placeholder="e.g. 5:00 PM" />
        </div>
      </div>

      {/* Admission */}
      <div>
        <label htmlFor="admissionPrice" className="block text-sm font-medium mb-1">Admission Price</label>
        <Input id="admissionPrice" name="admissionPrice" placeholder="e.g. Free, $5, $10 adults / $5 kids" />
      </div>

      {/* Organizer */}
      <div>
        <label htmlFor="organizerName" className="block text-sm font-medium mb-1">Organizer Name</label>
        <Input id="organizerName" name="organizerName" placeholder="e.g. NTX Card Shows" />
      </div>

      {/* Website */}
      <div>
        <label htmlFor="websiteUrl" className="block text-sm font-medium mb-1">Website URL</label>
        <Input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://..." />
      </div>

      {/* Event Type */}
      <div>
        <label htmlFor="eventType" className="block text-sm font-medium mb-1">Event Type</label>
        <select
          id="eventType"
          name="eventType"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="card_show">Card Show</option>
          <option value="convention">Convention</option>
          <option value="tournament">Tournament</option>
          <option value="meetup">Meetup</option>
        </select>
      </div>

      {/* Pokemon Specific */}
      <div className="flex items-center gap-2">
        <input id="isPokemonSpecific" name="isPokemonSpecific" type="checkbox" className="rounded" />
        <label htmlFor="isPokemonSpecific" className="text-sm">This event is Pokemon-specific</label>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          placeholder="Tell attendees what to expect..."
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Submitting...' : 'Submit Show'}
      </Button>
    </form>
  );
}
