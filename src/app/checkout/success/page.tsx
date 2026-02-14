import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Checkout — PokeShows',
  description: 'Your payment status on PokeShows.',
};

const TYPE_CONFIG: Record<string, { title: string; message: string; link: string; linkLabel: string }> = {
  vendor_featured_monthly: {
    title: 'You\'re Now a Featured Vendor!',
    message: 'Your featured listing is now active. You\'ll appear at the top of the vendor directory with a highlighted badge.',
    link: '/vendors',
    linkLabel: 'View Vendor Directory',
  },
  vendor_featured_show: {
    title: 'Show Feature Activated!',
    message: 'Your vendor listing will be featured for the selected show. Collectors heading to the event will see you front and center.',
    link: '/vendors',
    linkLabel: 'View Vendor Directory',
  },
  cotd_sponsorship: {
    title: 'Card of the Day Sponsorship Confirmed!',
    message: 'Your sponsorship is set. Your name and link will appear alongside the Card of the Day on your selected date.',
    link: '/card-of-the-day',
    linkLabel: 'View Card of the Day',
  },
  show_promotion: {
    title: 'Show Promoted!',
    message: 'Your show is now featured and will appear at the top of search results with a highlighted badge.',
    link: '/shows',
    linkLabel: 'Browse Shows',
  },
  pro_monthly: {
    title: 'Welcome to PokeShows Pro!',
    message: 'You now have access to unlimited price alerts, 90-day price charts, the Pro badge, and all premium features.',
    link: '/pro',
    linkLabel: 'Explore Pro Features',
  },
};

const DEFAULT_CONFIG = {
  title: 'Payment Confirmed!',
  message: 'Your payment has been processed successfully. Thank you for supporting PokeShows!',
  link: '/',
  linkLabel: 'Back to Home',
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const type = typeof params.type === 'string' ? params.type : '';
  const canceled = params.canceled === 'true';

  if (canceled) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="rounded-xl border border-border p-8">
          <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Checkout Canceled</h1>
          <p className="text-muted-foreground mb-6">
            No worries — you weren&apos;t charged. You can try again anytime.
          </p>
          <Link
            href={TYPE_CONFIG[type]?.link || '/'}
            className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            {TYPE_CONFIG[type]?.linkLabel || 'Back to Home'}
          </Link>
        </div>
      </div>
    );
  }

  const config = TYPE_CONFIG[type] || DEFAULT_CONFIG;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="rounded-xl border border-border p-8">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">{config.title}</h1>
        <p className="text-muted-foreground mb-6">{config.message}</p>
        <Link
          href={config.link}
          className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          {config.linkLabel}
        </Link>
      </div>
    </div>
  );
}
