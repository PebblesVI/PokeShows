'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Library,
  Award,
  Trophy,
  Layers,
  MapPin,
  Calendar,
  Star,
  MessageSquare,
  ArrowRightLeft,
  Repeat,
  Bell,
  MessageCircle,
  RefreshCw,
  Lock,
} from 'lucide-react';
import type { Achievement } from '@/lib/achievements';
import { CATEGORY_LABELS } from '@/lib/achievements';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Library,
  Award,
  Trophy,
  Layers,
  MapPin,
  Calendar,
  Star,
  MessageSquare,
  ArrowRightLeft,
  Repeat,
  Bell,
  MessageCircle,
};

const CATEGORY_BORDER_COLORS: Record<Achievement['category'], string> = {
  collection: 'border-blue-500',
  shows: 'border-green-500',
  trading: 'border-orange-500',
  engagement: 'border-purple-500',
};

const CATEGORY_TEXT_COLORS: Record<Achievement['category'], string> = {
  collection: 'text-blue-500',
  shows: 'text-green-500',
  trading: 'text-orange-500',
  engagement: 'text-purple-500',
};

const CATEGORY_BG_COLORS: Record<Achievement['category'], string> = {
  collection: 'bg-blue-500/10',
  shows: 'bg-green-500/10',
  trading: 'bg-orange-500/10',
  engagement: 'bg-purple-500/10',
};

interface AchievementData extends Achievement {
  unlocked: boolean;
  unlockedAt: string | null;
}

interface NewlyUnlockedAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: string;
}

export default function AchievementGrid() {
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<NewlyUnlockedAchievement[]>([]);
  const [email, setEmail] = useState<string | null>(null);

  const fetchAchievements = useCallback(async (userEmail: string) => {
    try {
      const res = await fetch(`/api/achievements?email=${encodeURIComponent(userEmail)}`);
      if (!res.ok) return;
      const data = await res.json();
      setAchievements(data.achievements);
      setUnlockedCount(data.unlockedCount);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem('pokeshows-email');
    if (storedEmail) {
      setEmail(storedEmail);
      fetchAchievements(storedEmail);
    } else {
      setLoading(false);
    }
  }, [fetchAchievements]);

  const checkForNew = async () => {
    if (!email) return;
    setChecking(true);
    setNewlyUnlocked([]);
    try {
      const res = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.newlyUnlocked.length > 0) {
        setNewlyUnlocked(data.newlyUnlocked);
      }
      // Refresh the full list
      await fetchAchievements(email);
    } catch (err) {
      console.error('Failed to check achievements:', err);
    } finally {
      setChecking(false);
    }
  };

  if (!loading && !email) {
    return (
      <div className="text-center py-16">
        <Lock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">
          Sign in to track your achievements and collecting milestones.
        </p>
        <Button asChild>
          <a href="/collection">Go to Collection</a>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Progress skeleton */}
        <div className="rounded-xl border border-border p-6">
          <div className="h-4 bg-muted rounded-full w-48 mb-3 animate-pulse" />
          <div className="h-3 bg-muted rounded-full w-full animate-pulse" />
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Group by category
  const categories: Achievement['category'][] = ['collection', 'shows', 'trading', 'engagement'];
  const grouped = categories.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    achievements: achievements.filter((a) => a.category === cat),
  }));

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">
            {unlockedCount} of {totalCount} achievements unlocked
          </p>
          <span className="text-sm text-muted-foreground">{progressPercent}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-4">
          <Button
            onClick={checkForNew}
            disabled={checking}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking...' : 'Check for New Achievements'}
          </Button>
        </div>
      </div>

      {/* Newly Unlocked Toast */}
      {newlyUnlocked.length > 0 && (
        <div className="rounded-xl border-2 border-primary bg-primary/5 p-4">
          <p className="text-sm font-semibold text-primary mb-2">
            New Achievements Unlocked!
          </p>
          <div className="flex flex-wrap gap-2">
            {newlyUnlocked.map((a) => {
              const Icon = ICON_MAP[a.icon];
              return (
                <Badge key={a.id} variant="default" className="gap-1 py-1 px-3">
                  {Icon && <Icon className="h-3 w-3" />}
                  {a.name}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievement Grid by Category */}
      {grouped.map((group) => (
        <section key={group.category}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className={CATEGORY_TEXT_COLORS[group.category]}>
              {group.label}
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {group.achievements.filter((a) => a.unlocked).length}/{group.achievements.length}
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.achievements.map((achievement) => {
              const Icon = ICON_MAP[achievement.icon];
              const isUnlocked = achievement.unlocked;

              return (
                <div
                  key={achievement.id}
                  className={`rounded-xl border p-4 transition-all ${
                    isUnlocked
                      ? `${CATEGORY_BORDER_COLORS[achievement.category]} ${CATEGORY_BG_COLORS[achievement.category]}`
                      : 'border-border opacity-40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        isUnlocked
                          ? CATEGORY_TEXT_COLORS[achievement.category]
                          : 'text-muted-foreground'
                      }`}
                    >
                      {Icon ? (
                        <Icon className="h-5 w-5" />
                      ) : (
                        <Sparkles className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isUnlocked ? achievement.description : achievement.requirement}
                      </p>
                      {isUnlocked && achievement.unlockedAt && (
                        <p className="text-[10px] text-muted-foreground mt-1.5">
                          Unlocked{' '}
                          {new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                      {!isUnlocked && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <Lock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">Locked</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
