'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ShoppingBag, Users, Send, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeedPost {
  id: number;
  email: string;
  displayName: string;
  showSlug: string;
  type: 'going' | 'bought' | 'comment';
  text: string | null;
  cardName: string | null;
  pricePaid: number | null;
  createdAt: string;
}

function getInitialColor(name: string): string {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-amber-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function Avatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  const color = getInitialColor(name);
  return (
    <div className={`${color} w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0`}>
      {initial}
    </div>
  );
}

function RelativeTime({ date }: { date: string }) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    setLabel(formatDistanceToNow(new Date(date), { addSuffix: true }));
  }, [date]);

  return <span className="text-xs text-muted-foreground">{label}</span>;
}

function PostIcon({ type }: { type: string }) {
  switch (type) {
    case 'going':
      return <Users className="h-3.5 w-3.5 text-blue-500" />;
    case 'bought':
      return <ShoppingBag className="h-3.5 w-3.5 text-green-500" />;
    case 'comment':
      return <MessageSquare className="h-3.5 w-3.5 text-purple-500" />;
    default:
      return null;
  }
}

function PostContent({ post }: { post: FeedPost }) {
  switch (post.type) {
    case 'going':
      return (
        <p className="text-sm">
          <span className="font-semibold">{post.displayName}</span>{' '}
          <span className="text-muted-foreground">is going to this show!</span>
        </p>
      );
    case 'bought':
      return (
        <p className="text-sm">
          <span className="font-semibold">{post.displayName}</span>{' '}
          <span className="text-muted-foreground">bought</span>{' '}
          <span className="font-medium">{post.cardName}</span>
          {post.pricePaid != null && (
            <span className="text-green-600 dark:text-green-400 font-semibold">
              {' '}for ${post.pricePaid.toFixed(2)}
            </span>
          )}
        </p>
      );
    case 'comment':
      return (
        <p className="text-sm">
          <span className="font-semibold">{post.displayName}:</span>{' '}
          <span className="text-muted-foreground">{post.text}</span>
        </p>
      );
    default:
      return null;
  }
}

export function ShowFeed({ showSlug }: { showSlug: string }) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [showBoughtForm, setShowBoughtForm] = useState(false);
  const [cardName, setCardName] = useState('');
  const [pricePaid, setPricePaid] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/show-feed?showSlug=${encodeURIComponent(showSlug)}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [showSlug]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  function getIdentity(): { email: string; displayName: string } | null {
    const email = localStorage.getItem('pokeshows-email') || '';
    const displayName = localStorage.getItem('pokeshows-display-name') || '';

    if (!email) {
      const promptedEmail = window.prompt('Enter your email to post:');
      if (!promptedEmail || !promptedEmail.includes('@')) return null;
      localStorage.setItem('pokeshows-email', promptedEmail.trim());

      const promptedName = window.prompt('Enter your display name:');
      if (!promptedName) return null;
      localStorage.setItem('pokeshows-display-name', promptedName.trim());

      return { email: promptedEmail.trim(), displayName: promptedName.trim() };
    }

    if (!displayName) {
      const promptedName = window.prompt('Enter your display name:');
      if (!promptedName) return null;
      localStorage.setItem('pokeshows-display-name', promptedName.trim());
      return { email, displayName: promptedName.trim() };
    }

    return { email, displayName };
  }

  async function submitPost(type: 'comment' | 'bought', extraData?: Record<string, unknown>) {
    const identity = getIdentity();
    if (!identity) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/show-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identity.email,
          displayName: identity.displayName,
          showSlug,
          type,
          ...extraData,
        }),
      });

      if (res.ok) {
        setComment('');
        setCardName('');
        setPricePaid('');
        setShowBoughtForm(false);
        await fetchPosts();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to post');
      }
    } catch {
      setError('Failed to post');
    } finally {
      setSubmitting(false);
    }
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    submitPost('comment', { text: comment.trim() });
  };

  const handleBoughtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim()) return;
    submitPost('bought', {
      cardName: cardName.trim(),
      pricePaid: pricePaid ? parseFloat(pricePaid) : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Show Feed
      </h3>

      {/* Post Form */}
      <div className="rounded-xl border border-border p-4 space-y-3 bg-card">
        <form onSubmit={handleCommentSubmit} className="flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Say something about this show..."
            maxLength={500}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button type="submit" size="sm" disabled={!comment.trim() || submitting}>
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {!showBoughtForm ? (
          <button
            onClick={() => setShowBoughtForm(true)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            I bought a card!
          </button>
        ) : (
          <form onSubmit={handleBoughtSubmit} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Card name (e.g., Charizard VMAX)"
                required
                maxLength={200}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="number"
                value={pricePaid}
                onChange={(e) => setPricePaid(e.target.value)}
                placeholder="Price $"
                step="0.01"
                min="0"
                className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={!cardName.trim() || submitting} className="gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5" />
                Post Purchase
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowBoughtForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {/* Feed Posts */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-1">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-start gap-3 rounded-lg p-3 hover:bg-accent/30 transition-colors"
            >
              <Avatar name={post.displayName} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <PostIcon type={post.type} />
                  <PostContent post={post} />
                </div>
                <RelativeTime date={post.createdAt} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
