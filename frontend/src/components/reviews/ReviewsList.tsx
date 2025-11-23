'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { Icon } from '@/components/icons/Icon';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId: {
    id?: string;
    name?: string;
    email?: string;
  };
}

interface ReviewsListProps {
  gameId: string;
}

export function ReviewsList({ gameId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/reviews/game/${gameId}`);
        
        if (!response.ok) {
          throw new Error('خطا در دریافت نظرات');
        }
        
        const data = await response.json();
        setReviews(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در بارگذاری نظرات');
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchReviews();
    }
  }, [gameId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-2" />
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
            <div className="h-20 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
        <p className="text-sm text-rose-600">{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
        <Icon name="message" size={48} className="mx-auto mb-4 text-slate-400" />
        <p className="text-slate-600 font-semibold">هنوز نظری ثبت نشده است</p>
        <p className="text-sm text-slate-500 mt-2">اولین کسی باشید که نظر می‌دهد!</p>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Average Rating */}
      <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-6">
        <div className="flex items-center gap-2">
          <Icon name="star" size={32} className="text-yellow-400 fill-yellow-400" />
          <div>
            <p className="text-3xl font-black text-emerald-900">{averageRating.toFixed(1)}</p>
            <p className="text-sm text-emerald-700 font-semibold">از ۵</p>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-emerald-700 font-semibold mb-1">
            بر اساس {reviews.length} نظر
          </p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                name="star"
                size={20}
                className={
                  star <= Math.round(averageRating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-slate-300'
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-2xl border border-slate-100 bg-white p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-lg">
                  {(review.userId.name || review.userId.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    {review.userId.name || review.userId.email || 'کاربر ناشناس'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(review.createdAt).toLocaleDateString('fa-IR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    name="star"
                    size={18}
                    className={
                      star <= review.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-300'
                    }
                  />
                ))}
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

