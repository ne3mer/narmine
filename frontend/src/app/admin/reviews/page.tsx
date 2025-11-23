'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL, ADMIN_API_KEY, adminHeaders } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { Icon } from '@/components/icons/Icon';

type ReviewStatus = 'pending' | 'approved' | 'rejected';

type Review = {
  id: string;
  gameId: {
    id?: string;
    title?: string;
    slug?: string;
  };
  userId: {
    id?: string;
    name?: string;
    email?: string;
  };
  rating: number;
  comment: string;
  status: ReviewStatus;
  adminNote?: string;
  reviewedBy?: {
    id?: string;
    name?: string;
    email?: string;
  };
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
};

type Filters = {
  status: '' | ReviewStatus;
  gameId: string;
  search: string;
};

const statusLabels: Record<ReviewStatus, string> = {
  pending: 'در انتظار بررسی',
  approved: 'تأیید شده',
  rejected: 'رد شده'
};

const statusColors: Record<ReviewStatus, string> = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-600 border-rose-200'
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    gameId: '',
    search: ''
  });
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState<Set<string>>(new Set());
  const [games, setGames] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    fetchReviews();
    fetchGames();
  }, [filters.status, filters.gameId, filters.search, meta.page]);

  const fetchGames = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/games?limit=1000`, {
        headers: adminHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        const gamesList = Array.isArray(data?.data) ? data.data : [];
        setGames(gamesList.map((g: any) => ({ id: g.id || g._id, title: g.title })));
      }
    } catch (err) {
      // Silent fail
    }
  };

  const fetchReviews = async () => {
    if (!ADMIN_API_KEY) {
      setError('کلید ادمین تنظیم نشده است');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('لطفاً ابتدا وارد حساب کاربری خود شوید');
      }

      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.gameId) params.set('gameId', filters.gameId);
      params.set('page', String(meta.page));
      params.set('limit', String(meta.limit));

      const response = await fetch(`${API_BASE_URL}/api/reviews?${params.toString()}`, {
        headers: {
          ...adminHeaders(),
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت نظرات');
      }

      const data = await response.json();
      
      let reviewsList = Array.isArray(data?.data) ? data.data : [];
      
      // Filter by search query if provided
      if (filters.search.trim()) {
        const searchLower = filters.search.toLowerCase();
        reviewsList = reviewsList.filter((review: Review) => {
          const gameTitle = review.gameId?.title || '';
          const userName = review.userId?.name || '';
          const userEmail = review.userId?.email || '';
          const comment = review.comment || '';
          
          return (
            gameTitle.toLowerCase().includes(searchLower) ||
            userName.toLowerCase().includes(searchLower) ||
            userEmail.toLowerCase().includes(searchLower) ||
            comment.toLowerCase().includes(searchLower)
          );
        });
      }

      setReviews(reviewsList);
      setMeta({
        total: data?.meta?.total || reviewsList.length,
        page: data?.meta?.page || meta.page,
        limit: data?.meta?.limit || meta.limit,
        totalPages: data?.meta?.totalPages || 1
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری نظرات');
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId: string, status: 'approved' | 'rejected', adminNote?: string) => {
    const token = getAuthToken();
    if (!token) {
      setError('لطفاً ابتدا وارد حساب کاربری خود شوید');
      return;
    }

    setUpdating(prev => new Set(prev).add(reviewId));

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: {
          ...adminHeaders(),
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, adminNote })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'خطا در به‌روزرسانی نظر');
      }

      setSuccess(`نظر ${status === 'approved' ? 'تأیید' : 'رد'} شد`);
      setTimeout(() => setSuccess(''), 3000);
      fetchReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در به‌روزرسانی نظر');
      setTimeout(() => setError(''), 5000);
    } finally {
      setUpdating(prev => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('آیا از حذف این نظر اطمینان دارید؟')) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError('لطفاً ابتدا وارد حساب کاربری خود شوید');
      return;
    }

    setUpdating(prev => new Set(prev).add(reviewId));

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          ...adminHeaders(),
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('خطا در حذف نظر');
      }

      setSuccess('نظر حذف شد');
      setTimeout(() => setSuccess(''), 3000);
      fetchReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف نظر');
      setTimeout(() => setError(''), 5000);
    } finally {
      setUpdating(prev => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '---';
    try {
      return new Date(dateString).toLocaleString('fa-IR');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Icon name="message" size={32} className="text-emerald-600" />
            مدیریت نظرات
          </h1>
          <p className="text-slate-600 mt-2">مدیریت و بررسی نظرات کاربران</p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-center gap-3">
          <Icon name="alert" size={20} className="text-rose-600 flex-shrink-0" />
          <p className="text-rose-600 font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
          <Icon name="check" size={20} className="text-emerald-600 flex-shrink-0" />
          <p className="text-emerald-600 font-semibold">{success}</p>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">جستجو</label>
            <div className="relative">
              <Icon name="search" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, search: e.target.value }));
                  setMeta(prev => ({ ...prev, page: 1 }));
                }}
                placeholder="جستجو در نظرات، کاربران، محصولات..."
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-2 pr-10 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">وضعیت</label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, status: e.target.value as any }));
                setMeta(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
            >
              <option value="">همه</option>
              <option value="pending">در انتظار بررسی</option>
              <option value="approved">تأیید شده</option>
              <option value="rejected">رد شده</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">محصول</label>
            <select
              value={filters.gameId}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, gameId: e.target.value }));
                setMeta(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
            >
              <option value="">همه محصولات</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold mb-1">در انتظار بررسی</p>
              <p className="text-2xl font-black text-slate-900">
                {reviews.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="rounded-xl bg-amber-100 p-3">
              <Icon name="clock" size={24} className="text-amber-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold mb-1">تأیید شده</p>
              <p className="text-2xl font-black text-slate-900">
                {reviews.filter(r => r.status === 'approved').length}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-100 p-3">
              <Icon name="check" size={24} className="text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-rose-50 to-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold mb-1">رد شده</p>
              <p className="text-2xl font-black text-slate-900">
                {reviews.filter(r => r.status === 'rejected').length}
              </p>
            </div>
            <div className="rounded-xl bg-rose-100 p-3">
              <Icon name="x" size={24} className="text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-slate-600 mt-4 font-semibold">در حال بارگذاری...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <Icon name="message" size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600 font-semibold">نظری یافت نشد</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-slate-50 transition">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold">
                        {(review.userId?.name || review.userId?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          {review.userId?.name || review.userId?.email || 'کاربر ناشناس'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {review.gameId?.title || 'محصول ناشناس'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Icon
                            key={star}
                            name="star"
                            size={16}
                            className={
                              star <= review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-slate-300'
                            }
                          />
                        ))}
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusColors[review.status]}`}>
                        {statusLabels[review.status]}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed mb-2">{review.comment}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>تاریخ ثبت: {formatDate(review.createdAt)}</span>
                      {review.reviewedAt && (
                        <span>تاریخ بررسی: {formatDate(review.reviewedAt)}</span>
                      )}
                      {review.reviewedBy && (
                        <span>بررسی شده توسط: {review.reviewedBy.name || review.reviewedBy.email}</span>
                      )}
                    </div>
                    {review.adminNote && (
                      <div className="mt-3 rounded-xl bg-slate-100 p-3">
                        <p className="text-xs font-semibold text-slate-600 mb-1">یادداشت ادمین:</p>
                        <p className="text-sm text-slate-700">{review.adminNote}</p>
                      </div>
                    )}
                  </div>
                </div>

                {review.status === 'pending' && (
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => updateReviewStatus(review.id, 'approved')}
                      disabled={updating.has(review.id)}
                      className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon name="check" size={16} />
                      {updating.has(review.id) ? 'در حال پردازش...' : 'تأیید'}
                    </button>
                    <button
                      onClick={() => updateReviewStatus(review.id, 'rejected')}
                      disabled={updating.has(review.id)}
                      className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon name="x" size={16} />
                      رد
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
                      disabled={updating.has(review.id)}
                      className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon name="trash" size={16} />
                      حذف
                    </button>
                  </div>
                )}

                {review.status !== 'pending' && (
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        const newStatus = review.status === 'approved' ? 'rejected' : 'approved';
                        updateReviewStatus(review.id, newStatus);
                      }}
                      disabled={updating.has(review.id)}
                      className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon name="refresh" size={16} />
                      تغییر وضعیت
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
                      disabled={updating.has(review.id)}
                      className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon name="trash" size={16} />
                      حذف
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="border-t border-slate-200 p-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              صفحه {meta.page} از {meta.totalPages} ({meta.total} نظر)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMeta(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={meta.page === 1}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                قبلی
              </button>
              <button
                onClick={() => setMeta(prev => ({ ...prev, page: Math.min(meta.totalPages, prev.page + 1) }))}
                disabled={meta.page === meta.totalPages}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                بعدی
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
