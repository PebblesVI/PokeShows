import { Metadata } from 'next';
import { SubmitShowForm } from '@/components/submit/submit-show-form';
import { Badge } from '@/components/ui/badge';
import { Star, Mail } from 'lucide-react';

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

      {/* Promoted Show Info Section */}
      <div className="mt-10 rounded-xl border-2 border-yellow-400/60 bg-yellow-50/50 dark:bg-yellow-900/10 p-6">
        <div className="flex items-start gap-3">
          <Star className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="font-semibold">Want your show to stand out?</h2>
              <Badge className="bg-yellow-400 text-yellow-900 rounded-full text-xs">Coming Soon</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Promoted shows appear with a <span className="font-medium text-foreground">Featured</span> badge and get priority placement in search results and listings. Make sure collectors never miss your event.
            </p>
            <a
              href="mailto:hello@pokeshows.com?subject=Promote My Show on PokeShows"
              className="inline-flex items-center gap-2 rounded-lg bg-yellow-400/20 border border-yellow-400/40 px-4 py-2 text-sm font-medium hover:bg-yellow-400/30 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Email us at hello@pokeshows.com to promote your show ($25/show)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
