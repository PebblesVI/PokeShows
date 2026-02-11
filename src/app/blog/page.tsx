import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog/posts';
import { format } from 'date-fns';

export const metadata: Metadata = {
  title: 'Pokemon Card Collecting Blog',
  description: 'Tips, guides, and news about Pokemon card collecting, trading card shows, and the Pokemon TCG market.',
  openGraph: {
    title: 'Pokemon Card Collecting Blog | PokeShows',
    description: 'Tips, guides, and news about Pokemon card collecting.',
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Blog</h1>
      <p className="text-muted-foreground mb-10">
        Tips, guides, and news about Pokemon card collecting and trading card shows.
      </p>

      <div className="space-y-1">
        {posts.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-xl p-6 -mx-6 transition-colors duration-200 hover:bg-muted/50"
          >
            <time className="text-xs text-muted-foreground">
              {format(new Date(post.date), 'MMMM d, yyyy')}
            </time>
            <h2 className="text-xl font-semibold mt-1 mb-2">{post.title}</h2>
            <p className="text-muted-foreground text-sm">{post.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
