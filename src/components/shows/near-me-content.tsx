'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { ShowCard } from '@/components/shows/show-card';
import { ShowAlertForm } from '@/components/shows/show-alert-form';
import type { Show } from '@/types/show';

type ShowWithDistance = Show & { distance: number };

const RADIUS_OPTIONS = [25, 50, 100] as const;

export function NearMeContent() {
  const [shows, setShows] = useState<ShowWithDistance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState<number>(50);
  const [geoState, setGeoState] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [zipCode, setZipCode] = useState('');

  const fetchNearby = useCallback(async (lat: number, lng: number, r: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/shows/nearby?lat=${lat}&lng=${lng}&radius=${r}&limit=30`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setShows(data.shows || []);
    } catch {
      setError('Failed to load nearby shows. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const requestLocation = useCallback(() => {
    setGeoState('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setGeoState('granted');
        fetchNearby(latitude, longitude, radius);
      },
      () => {
        setGeoState('denied');
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }, [radius, fetchNearby]);

  // Re-fetch when radius changes (if we have coords)
  useEffect(() => {
    if (coords) {
      fetchNearby(coords.lat, coords.lng, radius);
    }
  }, [radius, coords, fetchNearby]);

  const handleZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipCode.trim()) return;

    // Use the zip-to-coordinates API
    setLoading(true);
    setError(null);

    try {
      // Import the zip lookup on client side
      const cleaned = zipCode.replace(/\D/g, '').slice(0, 5);
      if (cleaned.length < 3) {
        setError('Please enter a valid ZIP code');
        setLoading(false);
        return;
      }

      // Call the nearby API with zip parameter
      const res = await fetch(`/api/shows/nearby?zip=${cleaned}&radius=${radius}&limit=30`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch');
      }
      const data = await res.json();
      setShows(data.shows || []);
      setGeoState('granted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shows for this ZIP code.');
    } finally {
      setLoading(false);
    }
  };

  // Initial state — prompt for location
  if (geoState === 'idle') {
    return (
      <div className="text-center py-16 rounded-xl border border-border bg-muted/30 space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Navigation className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Find Shows Near You</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Allow location access to see Pokemon card shows in your area, or enter your ZIP code below.
          </p>
        </div>
        <button
          onClick={requestLocation}
          className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity"
        >
          <MapPin className="h-4 w-4" />
          Use My Location
        </button>
        <div className="text-muted-foreground text-sm">or</div>
        <form onSubmit={handleZipSubmit} className="flex items-center gap-2 justify-center">
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="Enter ZIP code"
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-primary/20"
            maxLength={5}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Search
          </button>
        </form>
      </div>
    );
  }

  // Requesting permission
  if (geoState === 'requesting') {
    return (
      <div className="text-center py-16">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Requesting your location...</p>
      </div>
    );
  }

  // Denied — show ZIP fallback
  if (geoState === 'denied' && shows.length === 0) {
    return (
      <div className="text-center py-16 rounded-xl border border-border bg-muted/30 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Location Access Denied</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            No worries! Enter your ZIP code to find shows near you.
          </p>
        </div>
        <form onSubmit={handleZipSubmit} className="flex items-center gap-2 justify-center">
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="Enter ZIP code"
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-primary/20"
            maxLength={5}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Search
          </button>
        </form>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      {/* Radius selector */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm font-medium">Radius:</span>
        <div className="flex gap-2">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
                radius === r
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              {r} mi
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-sm text-muted-foreground">Finding shows near you...</p>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-8">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && shows.length === 0 && (
        <div className="text-center py-16 rounded-xl border border-border bg-muted/30">
          <p className="text-lg text-muted-foreground mb-2">No shows found within {radius} miles</p>
          <p className="text-sm text-muted-foreground">
            Try increasing the radius or check back soon — new shows are added daily.
          </p>
        </div>
      )}

      {!loading && shows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shows.map((show) => (
            <div key={show.id} className="relative">
              <ShowCard show={show} />
              <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                {show.distance} mi
              </span>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="mt-8">
          <ShowAlertForm state={shows[0]?.state || 'US'} stateName="your area" />
        </div>
      )}
    </div>
  );
}
