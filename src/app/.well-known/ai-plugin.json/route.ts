export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';

  const plugin = {
    schema_version: 'v1',
    name_for_human: 'PokeShows',
    name_for_model: 'pokeshows',
    description_for_human:
      'Find Pokemon and trading card shows across the United States',
    description_for_model:
      'Search for upcoming Pokemon and trading card shows, conventions, and tournaments in the United States. Data includes show name, date, venue, city, state, organizer, and admission info. Shows can be filtered by state or city.',
    api: {
      type: 'openapi',
      url: `${siteUrl}/api/shows/openapi.json`,
    },
    logo_url: `${siteUrl}/icon.png`,
    contact_email: 'hello@pokeshows.com',
    legal_info_url: `${siteUrl}/about`,
  };

  return new Response(JSON.stringify(plugin, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
