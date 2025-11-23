'use client';

import { useState } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { Icon } from '@/components/icons/Icon';

interface ReviewFormProps {
  gameId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ gameId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = getAuthToken();
    if (!token) {
      setError('لطفاً ابتدا وارد حساب کاربری خود شوید');
      return;
    }

    if (rating === 0) {
      setError('لطفاً امتیاز خود را انتخاب کنید');
      return;
    }

    if (comment.trim().length < 10) {
      setError('نظر باید حداقل ۱۰ کاراکتر باشد');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          gameId,
          rating,
          comment: comment.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'خطا در ثبت نظر');
      }

      setSuccess(true);
      setRating(0);
      setComment('');
      setHoveredRating(0);
      
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت نظر');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <Icon name="check" size={48} className="mx-auto mb-3 text-emerald-500" />
        <p className="text-emerald-700 font-bold">نظر شما با موفقیت ثبت شد!</p>
        <p className="text-sm text-emerald-600 mt-1">پس از تأیید ادمین نمایش داده می‌شود</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">
          امتیاز شما به این محصول
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Icon
                name="star"
                size={32}
                className={
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-slate-300'
                }
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-sm font-semibold text-slate-600 mr-2">
              {rating} از ۵
            </span>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-bold text-slate-700 mb-3">
          نظر شما
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="نظر خود را درباره این محصول بنویسید..."
          rows={6}
          className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
          maxLength={1000}
        />
        <p className="text-xs text-slate-500 mt-2 text-left">
          {comment.length} / 1000 کاراکتر
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm text-rose-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || rating === 0 || comment.trim().length < 10}
        className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'در حال ثبت...' : 'ثبت نظر'}
      </button>
    </form>
  );
}
