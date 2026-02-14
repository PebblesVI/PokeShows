'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart3, Users } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  slug: string;
  value: number;
}

const TABS = [
  { value: 'collection_size', label: 'Most Cards', unit: 'cards' },
  { value: 'sets_collected', label: 'Most Sets', unit: 'sets' },
  { value: 'trades', label: 'Most Trades', unit: 'for trade' },
  { value: 'shows_attended', label: 'Most Shows', unit: 'shows' },
  { value: 'achievements', label: 'Most Achievements', unit: 'unlocked' },
] as const;

function getMedalEmoji(rank: number): string {
  if (rank === 1) return '\u{1F947}';
  if (rank === 2) return '\u{1F948}';
  if (rank === 3) return '\u{1F949}';
  return '';
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 mt-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-border p-4 animate-pulse"
        >
          <div className="w-8 h-5 bg-muted rounded" />
          <div className="flex-1 h-4 bg-muted rounded w-32" />
          <div className="w-12 h-4 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

export default function LeaderboardContent() {
  const [activeTab, setActiveTab] = useState<string>('collection_size');
  const [data, setData] = useState<Record<string, LeaderboardEntry[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const fetchLeaderboard = useCallback(async (type: string) => {
    if (data[type]) return; // Already cached
    setLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const res = await fetch(`/api/leaderboards?type=${type}`);
      if (!res.ok) return;
      const json = await res.json();
      setData((prev) => ({ ...prev, [type]: json.leaderboard }));
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  }, [data]);

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab, fetchLeaderboard]);

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex-wrap h-auto gap-1">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {loading[tab.value] ? (
              <LoadingSkeleton />
            ) : data[tab.value] && data[tab.value].length > 0 ? (
              <div className="mt-4">
                {/* Table Header */}
                <div className="flex items-center gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span className="w-12">Rank</span>
                  <span className="flex-1">Collector</span>
                  <span className="w-20 text-right">{tab.unit}</span>
                </div>

                {/* Table Rows */}
                <div className="space-y-1">
                  {data[tab.value].map((entry) => {
                    const medal = getMedalEmoji(entry.rank);
                    const isTopThree = entry.rank <= 3;

                    return (
                      <div
                        key={`${entry.slug}-${entry.rank}`}
                        className={`flex items-center gap-4 rounded-xl border p-4 transition-colors hover:border-primary/30 ${
                          isTopThree
                            ? 'border-primary/20 bg-primary/5'
                            : 'border-border'
                        }`}
                      >
                        <span className="w-12 text-sm font-bold">
                          {medal ? (
                            <span className="text-lg">{medal}</span>
                          ) : (
                            <span className="text-muted-foreground">#{entry.rank}</span>
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          {entry.slug ? (
                            <Link
                              href={`/collector/${entry.slug}`}
                              className="text-sm font-medium hover:text-primary transition-colors truncate block"
                            >
                              {entry.displayName}
                            </Link>
                          ) : (
                            <span className="text-sm font-medium text-muted-foreground truncate block">
                              {entry.displayName}
                            </span>
                          )}
                        </div>
                        <span className="w-20 text-right text-sm font-semibold">
                          {entry.value.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No data yet. Be the first on the leaderboard!
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Bottom CTA */}
      <div className="mt-12 text-center rounded-xl border border-border p-8">
        <BarChart3 className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-muted-foreground mb-4">
          Climb the ranks by growing your collection and attending shows.
        </p>
        <Button asChild>
          <Link href="/collection">Start Building Your Collection</Link>
        </Button>
      </div>
    </div>
  );
}
