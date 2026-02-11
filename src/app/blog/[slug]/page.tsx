import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { getPost, getAllPosts } from '@/lib/blog/posts';

export function generateStaticParams() {
  return getAllPosts().map(post => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Post Not Found' };

  const ogImage = `/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent('PokeShows Blog')}&type=blog`;

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: `${post.title} | PokeShows`,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  // Simple markdown-to-HTML conversion for headings, paragraphs, lists, links, bold, italic
  const html = post.content
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';

      // Headings
      if (trimmed.startsWith('### ')) return `<h3 class="text-lg font-semibold mt-6 mb-2">${processInline(trimmed.slice(4))}</h3>`;
      if (trimmed.startsWith('## ')) return `<h2 class="text-xl font-semibold mt-8 mb-3">${processInline(trimmed.slice(3))}</h2>`;

      // List items
      if (trimmed.startsWith('- **')) {
        const content = trimmed.slice(2);
        return `<li class="ml-4 mb-1">${processInline(content)}</li>`;
      }
      if (trimmed.startsWith('- ')) return `<li class="ml-4 mb-1">${processInline(trimmed.slice(2))}</li>`;
      if (/^\d+\.\s/.test(trimmed)) {
        const content = trimmed.replace(/^\d+\.\s/, '');
        return `<li class="ml-4 mb-1 list-decimal">${processInline(content)}</li>`;
      }

      // Italics-only line (disclaimer etc)
      if (trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.startsWith('**')) {
        return `<p class="text-sm text-muted-foreground italic mt-4">${processInline(trimmed)}</p>`;
      }

      // Regular paragraph
      return `<p class="mb-4 text-muted-foreground leading-relaxed">${processInline(trimmed)}</p>`;
    })
    .join('\n');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6 inline-block">
        &larr; Back to Blog
      </Link>

      <article>
        <header className="mb-8">
          <time className="text-sm text-muted-foreground">
            {format(new Date(post.date), 'MMMM d, yyyy')}
          </time>
          <h1 className="text-3xl font-bold mt-1">{post.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">{post.description}</p>
        </header>

        <div
          className="max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </div>
  );
}

function processInline(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>');
}
