'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL, ADMIN_API_KEY, adminHeaders } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { formatToman } from '@/lib/format';
import { Icon } from '@/components/icons/Icon';

type RevenueData = {
  date: string;
  revenue: number;
  orders: number;
};

type ProductPerformance = {
  gameId: string;
  title: string;
  sales: number;
  revenue: number;
  averageRating: number;
  reviewCount: number;
};

type DashboardAnalytics = {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  todayRevenue: number;
  todayOrders: number;
  todayNewUsers: number;
  monthRevenue: number;
  monthOrders: number;
  monthNewUsers: number;
  revenueTrend: RevenueData[];
  orderStatusBreakdown: {
    paid: number;
    pending: number;
    failed: number;
  };
  topProducts: ProductPerformance[];
  conversionRate: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
};

type SalesReport = {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  failedOrders: number;
  averageOrderValue: number;
  revenueByDate: RevenueData[];
  topProducts: ProductPerformance[];
  revenueByStatus: {
    paid: number;
    pending: number;
    failed: number;
  };
  ordersByStatus: {
    paid: number;
    pending: number;
    failed: number;
  };
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'custom'>('30');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchSalesReport();
  }, [dateRange, customStartDate, customEndDate]);

  const fetchAnalytics = async () => {
    const token = getAuthToken();
    if (!token) {
      setError('لطفاً ابتدا وارد حساب کاربری خود شوید');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/dashboard`, {
        headers: {
          ...adminHeaders(),
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت آمار');
      }

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری آمار');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesReport = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const params = new URLSearchParams();
      
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        params.set('startDate', customStartDate);
        params.set('endDate', customEndDate);
      } else {
        const days = dateRange === '7' ? 7 : dateRange === '90' ? 90 : 30;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        params.set('startDate', startDate.toISOString());
        params.set('endDate', endDate.toISOString());
      }

      const response = await fetch(`${API_BASE_URL}/api/analytics/sales?${params.toString()}`, {
        headers: {
          ...adminHeaders(),
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSalesReport(data.data);
      }
    } catch (err) {
      console.error('Error fetching sales report:', err);
    }
  };

  const formatGrowth = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    const color = value >= 0 ? 'text-emerald-600' : 'text-rose-600';
    return <span className={color}>{sign}{value.toFixed(1)}%</span>;
  };

  const getMaxRevenue = (data: RevenueData[]) => {
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => d.revenue), 1);
  };

  const getMaxOrders = (data: RevenueData[]) => {
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => d.orders), 1);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-slate-200 rounded-3xl w-1/3" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
        <Icon name="alert" size={48} className="mx-auto mb-4 text-rose-600" />
        <p className="text-rose-600 font-semibold">{error || 'خطا در بارگذاری آمار'}</p>
      </div>
    );
  }

  const maxRevenue = getMaxRevenue(analytics.revenueTrend);
  const maxOrders = getMaxOrders(analytics.revenueTrend);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Icon name="chart" size={32} className="text-emerald-600" />
            آنالیتیکس و گزارش‌گیری
          </h1>
          <p className="text-slate-600 mt-2">تحلیل عملکرد و آمار فروش</p>
        </div>
        <button
          onClick={() => {
            fetchAnalytics();
            fetchSalesReport();
          }}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <Icon name="refresh" size={16} />
          بروزرسانی
        </button>
      </div>

      {/* Overview Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="کل درآمد"
          value={formatToman(analytics.totalRevenue)}
          icon="dollar"
          color="emerald"
          growth={analytics.revenueGrowth}
        />
        <StatCard
          label="کل سفارشات"
          value={analytics.totalOrders.toLocaleString('fa-IR')}
          icon="package"
          color="blue"
          growth={analytics.ordersGrowth}
        />
        <StatCard
          label="کل کاربران"
          value={analytics.totalUsers.toLocaleString('fa-IR')}
          icon="users"
          color="purple"
          growth={analytics.usersGrowth}
        />
        <StatCard
          label="نرخ تبدیل"
          value={`${analytics.conversionRate}%`}
          icon="trending"
          color="indigo"
        />
      </section>

      {/* Today & Month Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard
          label="درآمد امروز"
          value={formatToman(analytics.todayRevenue)}
          icon="dollar"
          color="emerald"
          small
        />
        <StatCard
          label="سفارشات امروز"
          value={analytics.todayOrders}
          icon="package"
          color="blue"
          small
        />
        <StatCard
          label="کاربران جدید امروز"
          value={analytics.todayNewUsers}
          icon="users"
          color="purple"
          small
        />
        <StatCard
          label="درآمد این ماه"
          value={formatToman(analytics.monthRevenue)}
          icon="chart"
          color="emerald"
          small
        />
        <StatCard
          label="سفارشات این ماه"
          value={analytics.monthOrders}
          icon="package"
          color="blue"
          small
        />
        <StatCard
          label="میانگین ارزش سفارش"
          value={formatToman(analytics.averageOrderValue)}
          icon="gem"
          color="rose"
          small
        />
      </section>

      {/* Revenue Trend Chart */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">روند درآمد (۳۰ روز گذشته)</h2>
            <p className="text-xs text-slate-500 mt-1">نمودار درآمد روزانه</p>
          </div>
        </div>
        <div className="h-64 flex items-end gap-2">
          {analytics.revenueTrend.length === 0 ? (
            <div className="w-full text-center py-12 text-slate-500">
              داده‌ای برای نمایش وجود ندارد
            </div>
          ) : (
            analytics.revenueTrend.map((item, index) => {
              const height = (item.revenue / maxRevenue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all hover:from-emerald-600 hover:to-emerald-500"
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${formatToman(item.revenue)} - ${item.orders} سفارش`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 transform -rotate-45 origin-top-left whitespace-nowrap">
                    {new Date(item.date).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Order Status Breakdown */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-6">وضعیت سفارشات</h2>
          <div className="space-y-4">
            <StatusBar
              label="پرداخت شده"
              value={analytics.orderStatusBreakdown.paid}
              total={analytics.totalOrders}
              color="emerald"
            />
            <StatusBar
              label="در انتظار پرداخت"
              value={analytics.orderStatusBreakdown.pending}
              total={analytics.totalOrders}
              color="amber"
            />
            <StatusBar
              label="ناموفق"
              value={analytics.orderStatusBreakdown.failed}
              total={analytics.totalOrders}
              color="rose"
            />
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-6">پرفروش‌ترین محصولات</h2>
          <div className="space-y-3">
            {analytics.topProducts.length === 0 ? (
              <p className="text-center py-8 text-slate-500">داده‌ای برای نمایش وجود ندارد</p>
            ) : (
              analytics.topProducts.slice(0, 5).map((product, index) => (
                <div
                  key={product.gameId}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-sm font-black flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{product.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>{product.sales} فروش</span>
                        {product.averageRating > 0 && (
                          <span className="flex items-center gap-1">
                            <Icon name="star" size={12} className="text-yellow-400 fill-yellow-400" />
                            {product.averageRating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <p className="text-sm font-bold text-slate-700">{formatToman(product.revenue)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Sales Report Section */}
      {salesReport && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">گزارش فروش</h2>
              <p className="text-xs text-slate-500 mt-1">گزارش تفصیلی فروش</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="7">۷ روز گذشته</option>
                <option value="30">۳۰ روز گذشته</option>
                <option value="90">۹۰ روز گذشته</option>
                <option value="custom">سفارشی</option>
              </select>
              {dateRange === 'custom' && (
                <>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 mb-1">کل درآمد</p>
              <p className="text-2xl font-black text-slate-900">{formatToman(salesReport.totalRevenue)}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 mb-1">کل سفارشات</p>
              <p className="text-2xl font-black text-slate-900">{salesReport.totalOrders}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 mb-1">میانگین ارزش سفارش</p>
              <p className="text-2xl font-black text-slate-900">{formatToman(salesReport.averageOrderValue)}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 mb-1">نرخ تبدیل</p>
              <p className="text-2xl font-black text-slate-900">
                {salesReport.totalOrders > 0
                  ? ((salesReport.paidOrders / salesReport.totalOrders) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>

          {/* Revenue by Date Chart */}
          {salesReport.revenueByDate.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">روند درآمد</h3>
              <div className="h-48 flex items-end gap-1">
                {salesReport.revenueByDate.map((item, index) => {
                  const maxRev = getMaxRevenue(salesReport.revenueByDate);
                  const height = (item.revenue / maxRev) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-blue-500 to-blue-400"
                        style={{ height: `${Math.max(height, 3)}%` }}
                        title={`${formatToman(item.revenue)}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Products Table */}
          {salesReport.topProducts.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">محصولات برتر</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-right py-3 px-4 font-bold text-slate-700">محصول</th>
                      <th className="text-center py-3 px-4 font-bold text-slate-700">فروش</th>
                      <th className="text-left py-3 px-4 font-bold text-slate-700">درآمد</th>
                      <th className="text-center py-3 px-4 font-bold text-slate-700">امتیاز</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesReport.topProducts.slice(0, 10).map((product) => (
                      <tr key={product.gameId} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-900">{product.title}</td>
                        <td className="py-3 px-4 text-center text-slate-600">{product.sales}</td>
                        <td className="py-3 px-4 text-left font-bold text-slate-900">
                          {formatToman(product.revenue)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {product.averageRating > 0 ? (
                            <span className="flex items-center justify-center gap-1">
                              <Icon name="star" size={14} className="text-yellow-400 fill-yellow-400" />
                              {product.averageRating}
                            </span>
                          ) : (
                            <span className="text-slate-400">---</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  growth,
  small
}: {
  label: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'emerald' | 'indigo' | 'purple' | 'green' | 'amber' | 'rose' | 'cyan';
  growth?: number;
  small?: boolean;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
    green: 'bg-green-50 border-green-100 text-green-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
    rose: 'bg-rose-50 border-rose-100 text-rose-600',
    cyan: 'bg-cyan-50 border-cyan-100 text-cyan-600'
  };

  return (
    <article className={`rounded-3xl border bg-white ${small ? 'p-4' : 'p-6'} shadow-sm transition hover:shadow-md`}>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-xs font-semibold text-slate-500 uppercase tracking-wide ${small ? 'text-[10px]' : ''}`}>
          {label}
        </p>
        <div className={`rounded-xl border p-2 ${colorClasses[color]}`}>
          <Icon name={icon as any} size={small ? 16 : 20} strokeWidth={2} />
        </div>
      </div>
      <p className={`font-black text-slate-900 ${small ? 'text-xl' : 'text-3xl'}`}>{value}</p>
      {growth !== undefined && (
        <p className="text-xs text-slate-500 mt-1">
          رشد: {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
        </p>
      )}
    </article>
  );
}

function StatusBar({
  label,
  value,
  total,
  color
}: {
  label: string;
  value: number;
  total: number;
  color: 'emerald' | 'amber' | 'rose';
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colorClasses = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-900">
          {value.toLocaleString('fa-IR')} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

