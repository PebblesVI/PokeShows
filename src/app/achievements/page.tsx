import { Metadata } from 'next';
import AchievementGrid from '@/components/achievements/achievement-grid';
import { Trophy } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Achievements — Track Your Collecting Milestones | PokeShows',
  description:
    'Unlock achievements as you grow your Pokemon card collection, attend shows, make trades, and engage with the community on PokeShows.',
};

export default function AchievementsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          Achievements
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your collecting milestones and unlock achievements as you build your
          collection, attend shows, trade cards, and engage with the community.
        </p>
      </div>
      <AchievementGrid />
    </div>
  );
}
