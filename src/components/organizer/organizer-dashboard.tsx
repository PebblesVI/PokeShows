'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, Star, Megaphone, Calendar, Loader2 } from 'lucide-react';

interface OrganizerShow {
  id: number;
  slug: string;
  name: string;
  startDate: string;
  endDate: string | null;
  city: string;
  state: string;
  attendeeCount: number;
  isFeatured: boolean;
}

export function OrganizerDashboard() {
  const [organizerName, setOrganizerName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [shows, setShows] = useState<OrganizerShow[]>([]);
  const [loading, setLoading] = useState(false);
  const [boostingSlug, setBoostingSlug] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('pokeshows-organizer-name');
    if (saved) {
      setOrganizerName(saved);
    }
  }, []);

  useEffect(() => {
    if (!organizerName) return;

    const fetchShows = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/organizer/shows?organizerName=${encodeURIComponent(organizerName)}`,
        );
        const data = await res.json();
        setShows(data.shows || []);
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [organizerName]);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    localStorage.setItem('pokeshows-organizer-name', trimmed);
    setOrganizerName(trimmed);
  };

  const handleChangeName = () => {
    localStorage.removeItem('pokeshows-organizer-name');
    setOrganizerName(null);
    setShows([]);
    setNameInput('');
  };

  const handleBoost = async (showSlug: string) => {
    let email = localStorage.getItem('pokeshows-email') || '';

    if (!email) {
      const prompted = window.prompt('Enter your email to continue:');
      if (!prompted) return;
      email = prompted.trim();
      if (!email) return;
      localStorage.setItem('pokeshows-email', email);
    }

    setBoostingSlug(showSlug);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          type: 'show_promotion',
          metadata: { showSlug },
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
      setBoostingSlug(null);
    }
  };

  // Stats
  const totalShows = shows.length;
  const totalAttendees = shows.reduce((sum, s) => sum + s.attendeeCount, 0);
  const featuredCount = shows.filter((s) => s.isFeatured).length;

  // Name entry form
  if (!organizerName) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <div className="rounded-xl border border-border p-8 text-center">
          <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Organizer Dashboard</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            Enter your organizer name to view and manage your shows.
          </p>
          <form onSubmit={handleSaveName} className="space-y-4">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Pokemon Card Events LLC"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button type="submit" className="w-full">
              View My Shows
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Viewing shows for <strong>{organizerName}</strong>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleChangeName}>
            Change Name
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-border p-4 text-center">
          <BarChart3 className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{totalShows}</p>
          <p className="text-xs text-muted-foreground">Total Shows</p>
        </div>
        <div className="rounded-xl border border-border p-4 text-center">
          <Users className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{totalAttendees}</p>
          <p className="text-xs text-muted-foreground">Total Attendees</p>
        </div>
        <div className="rounded-xl border border-border p-4 text-center">
          <Star className="h-5 w-5 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{featuredCount}</p>
          <p className="text-xs text-muted-foreground">Featured Shows</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!loading && shows.length === 0 && (
        <div className="rounded-xl border border-border p-12 text-center">
          <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No shows found</h2>
          <p className="text-sm text-muted-foreground mb-4">
            We couldn&apos;t find any shows matching &ldquo;{organizerName}&rdquo;. Submit your first show to get started!
          </p>
          <Link href="/submit">
            <Button>Submit a Show</Button>
          </Link>
        </div>
      )}

      {/* Shows Table */}
      {!loading && shows.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Show</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Location</th>
                  <th className="text-center px-4 py-3 font-medium">Attendees</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shows.map((show) => (
                  <tr key={show.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/shows/${show.slug}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {show.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(show.startDate)}
                      {show.endDate && show.endDate !== show.startDate
                        ? ` - ${formatDate(show.endDate)}`
                        : ''}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {show.city}, {show.state}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {show.attendeeCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {show.isFeatured ? (
                        <span className="inline-block text-xs font-semibold text-yellow-700 dark:text-yellow-400 bg-yellow-200/50 dark:bg-yellow-800/30 px-2 py-0.5 rounded-full">
                          Featured
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Standard</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!show.isFeatured && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBoost(show.slug)}
                          disabled={boostingSlug === show.slug}
                        >
                          {boostingSlug === show.slug ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Boosting...
                            </>
                          ) : (
                            <>
                              <Megaphone className="h-3.5 w-3.5" />
                              Boost This Show
                            </>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
