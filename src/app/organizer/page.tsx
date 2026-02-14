import { Metadata } from 'next';
import { OrganizerDashboard } from '@/components/organizer/organizer-dashboard';

export const metadata: Metadata = {
  title: 'Organizer Dashboard — Manage Your Shows | PokeShows',
  description: 'View and manage your Pokemon card shows. Track attendees, boost visibility, and promote your events on PokeShows.',
};

export const dynamic = 'force-dynamic';

export default function OrganizerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <OrganizerDashboard />
    </div>
  );
}
