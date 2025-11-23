'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import Link from 'next/link';

interface AnalyticsOverview {
  totalPageViews: number;
  uniqueVisitors: number;
  totalClicks: number;
  deviceBreakdown: Array<{ _id: string; count: number }>;
  browserBreakdown: Array<{ _id: string; count: number }>;
  topPages: Array<{ _id: string; count: number; title: string }>;
  pageViewsOverTime: Array<{ _id: string; count: number }>;
}

export default function PageViewAnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('لطفاً وارد شوید');
      }

      const params = new URLSearchParams();
      const now = new Date();
      
      if (dateRange === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        params.set('startDate', today.toISOString());
      } else if (dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        params.set('startDate', weekAgo.toISOString());
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        params.set('startDate', monthAgo.toISOString());
      }

      const response = await fetch(`${API_BASE_URL}/api/analytics/overview?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
        }
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت آمار');
      }

      const data = await response.json();
      setOverview(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری آمار');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600">
          {error}
        </div>
      </div>
    );
  }

  if (!overview) return null;

  const dateRangeLabels = {
    today: 'امروز',
    week: '۷ روز گذشته',
    month: '۳۰ روز گذشته',
    all: 'همه زمان‌ها'
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">آمار بازدید صفحات</h1>
            <p className="mt-1 text-sm text-slate-500">مشاهده آمار بازدید و تعاملات کاربران</p>
            <Link 
              href="/admin/analytics"
              className="mt-2 inline-block text-sm text-emerald-600 hover:text-emerald-700"
            >
              ← بازگشت به آمار فروش
            </Link>
          </div>
          
          {/* Date Range Selector */}
          <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-1">
            {(['today', 'week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  dateRange === range
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {dateRangeLabels[range]}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">بازدید صفحات</p>
                <p className="mt-2 text-3xl font-black text-slate-900">
                  {overview.totalPageViews.toLocaleString('fa-IR')}
                </p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3">
                <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">بازدیدکنندگان یکتا</p>
                <p className="mt-2 text-3xl font-black text-slate-900">
                  {overview.uniqueVisitors.toLocaleString('fa-IR')}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3">
                <svg className="h-8 w-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">کلیک‌ها</p>
                <p className="mt-2 text-3xl font-black text-slate-900">
                  {overview.totalClicks.toLocaleString('fa-IR')}
                </p>
              </div>
              <div className="rounded-2xl bg-purple-50 p-3">
                <svg className="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Page Views Over Time */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">بازدید در طول زمان</h2>
            <div className="space-y-2">
              {overview.pageViewsOverTime.length > 0 ? (
                overview.pageViewsOverTime.map((item) => {
                  const maxCount = Math.max(...overview.pageViewsOverTime.map(i => i.count));
                  const percentage = (item.count / maxCount) * 100;
                  
                  return (
                    <div key={item._id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{new Date(item._id).toLocaleDateString('fa-IR')}</span>
                        <span className="font-bold text-slate-900">{item.count.toLocaleString('fa-IR')}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div 
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-sm text-slate-500">داده‌ای موجود نیست</p>
              )}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">دستگاه‌ها</h2>
            <div className="space-y-3">
              {overview.deviceBreakdown.map((device) => {
                const total = overview.deviceBreakdown.reduce((sum, d) => sum + d.count, 0);
                const percentage = ((device.count / total) * 100).toFixed(1);
                const deviceLabels: Record<string, string> = {
                  mobile: 'موبایل',
                  desktop: 'دسکتاپ',
                  tablet: 'تبلت',
                  unknown: 'نامشخص'
                };
                const deviceColors: Record<string, string> = {
                  mobile: 'bg-blue-500',
                  desktop: 'bg-emerald-500',
                  tablet: 'bg-purple-500',
                  unknown: 'bg-slate-400'
                };
                
                return (
                  <div key={device._id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{deviceLabels[device._id] || device._id}</span>
                      <span className="font-bold text-slate-900">
                        {device.count.toLocaleString('fa-IR')} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div 
                        className={`h-full transition-all ${deviceColors[device._id] || 'bg-slate-400'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">محبوب‌ترین صفحات</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-right text-sm font-semibold text-slate-600">صفحه</th>
                  <th className="pb-3 text-right text-sm font-semibold text-slate-600">عنوان</th>
                  <th className="pb-3 text-right text-sm font-semibold text-slate-600">بازدید</th>
                </tr>
              </thead>
              <tbody>
                {overview.topPages.map((page, index) => (
                  <tr key={page._id} className="border-b border-slate-50">
                    <td className="py-3 text-sm text-slate-900">{page._id || '/'}</td>
                    <td className="py-3 text-sm text-slate-600">{page.title || '-'}</td>
                    <td className="py-3 text-sm font-bold text-slate-900">
                      {page.count.toLocaleString('fa-IR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Browser Breakdown */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">مرورگرها</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {overview.browserBreakdown.map((browser) => {
              const total = overview.browserBreakdown.reduce((sum, b) => sum + b.count, 0);
              const percentage = ((browser.count / total) * 100).toFixed(1);
              
              return (
                <div key={browser._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-sm text-slate-600">{browser._id}</div>
                  <div className="mt-2 text-2xl font-black text-slate-900">
                    {browser.count.toLocaleString('fa-IR')}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
