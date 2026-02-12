'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { format } from 'date-fns';

interface Review {
  id: number;
  displayName: string;
  rating: number;
  text: string | null;
  createdAt: string;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground/20'
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewList({ showSlug }: { showSlug: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reviews?slug=${encodeURIComponent(showSlug)}`)
      .then(r => r.json())
      .then(data => {
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [showSlug]);

  if (loading) return null;
  if (reviews.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">Reviews</h3>
        {averageRating !== null && (
          <div className="flex items-center gap-1.5">
            <StarDisplay rating={Math.round(averageRating)} />
            <span className="text-sm font-medium">{averageRating}</span>
            <span className="text-sm text-muted-foreground">({totalReviews})</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{review.displayName}</span>
                <StarDisplay rating={review.rating} />
              </div>
              <span className="text-xs text-muted-foreground">
                {format(new Date(review.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
            {review.text && (
              <p className="text-sm text-muted-foreground">{review.text}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AverageRatingBadge({ showSlug }: { showSlug: string }) {
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetch(`/api/reviews?slug=${encodeURIComponent(showSlug)}`)
      .then(r => r.json())
      .then(data => {
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews || 0);
      })
      .catch(() => {});
  }, [showSlug]);

  if (averageRating === null || totalReviews === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      <span className="font-medium">{averageRating}</span>
      <span className="text-muted-foreground">({totalReviews})</span>
    </span>
  );
}
