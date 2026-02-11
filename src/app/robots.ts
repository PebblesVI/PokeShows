import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/shows/search', '/feed.xml', '/llms.txt'],
        disallow: ['/api/'],
      },
      {
        userAgent: 'GPTBot',
        allow: ['/', '/api/shows/search', '/feed.xml', '/llms.txt'],
        disallow: ['/api/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/', '/api/shows/search', '/feed.xml', '/llms.txt'],
        disallow: ['/api/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/', '/api/shows/search', '/feed.xml', '/llms.txt'],
        disallow: ['/api/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/api/shows/search', '/feed.xml', '/llms.txt'],
        disallow: ['/api/'],
      },
      {
        userAgent: 'Amazonbot',
        allow: ['/', '/api/shows/search', '/feed.xml', '/llms.txt'],
        disallow: ['/api/'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: ['/', '/api/shows/search', '/feed.xml', '/llms.txt'],
        disallow: ['/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
