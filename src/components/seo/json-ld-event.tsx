import type { Show } from '@/types/show';

export function JsonLdEvent({ show }: { show: Show }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: show.name,
    description: show.description || `${show.name} trading card show in ${show.city}, ${show.stateFullName || show.state}`,
    startDate: show.startTime
      ? `${show.startDate}T${show.startTime}:00`
      : show.startDate,
    endDate: show.endDate
      ? (show.endTime ? `${show.endDate}T${show.endTime}:00` : show.endDate)
      : undefined,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: show.venueName || show.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: show.address,
        addressLocality: show.city,
        addressRegion: show.state,
        postalCode: show.zipCode,
        addressCountry: 'US',
      },
    },
    ...(show.admissionPrice && {
      offers: {
        '@type': 'Offer',
        price: show.admissionPrice.toLowerCase() === 'free' ? '0' : show.admissionPrice.replace(/[^0-9.]/g, ''),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: show.websiteUrl,
      },
    }),
    ...(show.organizerName && {
      organizer: {
        '@type': 'Organization',
        name: show.organizerName,
        url: show.websiteUrl,
      },
    }),
    url: `${siteUrl}/shows/${show.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
