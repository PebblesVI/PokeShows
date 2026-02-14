import { Metadata } from 'next';
import LeaderboardContent from '@/components/leaderboards/leaderboard-content';
import { BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Leaderboards — Top Pokemon Collectors | PokeShows',
  description:
    'See who tops the leaderboards on PokeShows. Compare collection sizes, sets collected, trades listed, shows attended, and achievements unlocked.',
};

export default function LeaderboardsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          Leaderboards
        </h1>
        <p className="text-muted-foreground mt-2">
          See how you stack up against other collectors. Rankings update in real time
          as the community grows.
        </p>
      </div>
      <LeaderboardContent />
    </div>
  );
}
