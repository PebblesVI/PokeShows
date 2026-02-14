import { Metadata } from 'next';
import { ProLandingPage } from '@/components/pro/pro-landing-page';

export const metadata: Metadata = {
  title: 'PokeShows Pro — Premium Features for Collectors',
  description: 'Upgrade to PokeShows Pro for unlimited price alerts, 90-day price charts, daily portfolio digests, early deal alerts, and a Pro collector badge.',
};

export default function ProPage() {
  return <ProLandingPage />;
}
