import { Metadata } from 'next';
import { SubmitShowForm } from '@/components/submit/submit-show-form';

export const metadata: Metadata = {
  title: 'Submit a Card Show',
  description: 'Know of an upcoming Pokemon or trading card show? Submit it to PokeShows and help the community find events near them.',
};

export default function SubmitShowPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Submit a Card Show</h1>
      <p className="text-muted-foreground mb-10">
        Know of an upcoming Pokemon or trading card show? Fill out the form below
        to add it to our directory and help the community find events near them.
      </p>

      <SubmitShowForm />
    </div>
  );
}
