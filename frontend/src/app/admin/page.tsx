'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatToman } from '@/lib/format';
import { API_BASE_URL, ADMIN_API_KEY, adminHeaders } from '@/lib/api';
import type { AdminOrder } from '@/types/admin';
import { Icon } from '@/components/icons/Icon';
import { InventoryHealthWidget } from '@/components/admin/InventoryHealthWidget';
import { SalesByCategoryWidget } from '@/components/admin/SalesByCategoryWidget';

type DashboardStats = {
  ordersToday: number;
  revenueToday: number;
  revenueThisMonth: number;
  newUsers: number;
  totalProducts: number;
  pendingOrders: number;
  paidOrders: number;
  totalRevenue: number;
};

type TopProduct = {
  id: string;
  title: string;
  sales: number;
  revenue: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    ordersToday: 0,
    revenueToday: 0,
    revenueThisMonth: 0,
    newUsers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    paidOrders: 0,
    totalRevenue: 0
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const fetchAllStats = async () => {
      setLoading(true);
      try {
        // Fetch products count
        const productsRes = await fetch(`${API_BASE_URL}/api/games`);
        const productsData = await productsRes.json();
        const totalProducts = productsData?.data?.length || 0;

        // Fetch orders for statistics
        let ordersToday = 0;
        let revenueToday = 0;
        let revenueThisMonth = 0;
        let pendingOrders = 0;
        let paidOrders = 0;
        let totalRevenue = 0;
        const productSales: Record<string, { title: string; sales: number; revenue: number }> = {};

        if (ADMIN_API_KEY) {
          try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

            const ordersRes = await fetch(`${API_BASE_URL}/api/orders/admin?limit=1000`, {
              headers: adminHeaders()
            });
            
            if (ordersRes.ok) {
              const ordersData = await ordersRes.json();
              const allOrders = Array.isArray(ordersData?.data) ? ordersData.data : [];

              allOrders.forEach((order: any) => {
                const orderDate = new Date(order.createdAt);
                const orderAmount = order.totalAmount || 0;

                totalRevenue += orderAmount;

                if (order.paymentStatus === 'paid') {
                  paidOrders++;
                  if (orderDate >= thisMonth) {
                    revenueThisMonth += orderAmount;
                  }
                  if (orderDate >= today) {
                    ordersToday++;
                    revenueToday += orderAmount;
                  }
                }

                if (order.paymentStatus === 'pending') {
                  pendingOrders++;
                }

                // Track product sales
                if (order.items && Array.isArray(order.items)) {
                  order.items.forEach((item: any) => {
                    const gameId = item.gameId?.id || item.gameId?._id || 'unknown';
                    const gameTitle = item.gameId?.title || 'Unknown Game';
                    if (!productSales[gameId]) {
                      productSales[gameId] = { title: gameTitle, sales: 0, revenue: 0 };
                    }
                    productSales[gameId].sales += item.quantity || 1;
                    if (order.paymentStatus === 'paid') {
                      productSales[gameId].revenue += (item.pricePaid || 0) * (item.quantity || 1);
                    }
                  });
                }
              });
            }
          } catch (err) {
            console.warn('Could not fetch orders for stats:', err);
          }
        }

        // Get top products
        const topProductsList: TopProduct[] = Object.entries(productSales)
          .map(([id, data]) => ({
            id,
            title: data.title,
            sales: data.sales,
            revenue: data.revenue
          }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);

        // Fetch users count (if we had an endpoint, for now estimate from orders)
        const newUsers = 0; // TODO: Add user count endpoint

        setStats({
          ordersToday,
          revenueToday,
          revenueThisMonth,
          newUsers,
          totalProducts,
          pendingOrders,
          paidOrders,
          totalRevenue
        });
        setTopProducts(topProductsList);
      } catch (e) {
        console.error('Error fetching stats:', e);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentOrders = async () => {
      if (!ADMIN_API_KEY) {
        setOrdersLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/admin?limit=5`, {
          headers: adminHeaders()
        });
        if (!response.ok) {
          throw new Error('خطا در دریافت سفارشات');
        }
        const payload = await response.json();
        const data = Array.isArray(payload?.data) ? payload.data : [];
        const normalized: AdminOrder[] = data.map((order: any) => ({
          id: order.id ?? order._id,
          orderNumber: order.orderNumber ?? order.id ?? '---',
          customerInfo: order.customerInfo ?? { email: '---', phone: '---' },
          paymentStatus: order.paymentStatus ?? 'pending',
          fulfillmentStatus: order.fulfillmentStatus ?? 'pending',
          totalAmount: order.totalAmount ?? 0,
          paymentReference: order.paymentReference,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items: (order.items ?? []).map((item: any, index: number) => ({
            id: item.id ?? item._id ?? `${order.id}-${index}`,
            gameTitle: item.gameId?.title ?? item.gameId?.name ?? 'محصول',
            variantId: item.variantId,
            selectedOptions: item.selectedOptions,
            quantity: item.quantity ?? 1,
            pricePaid: item.pricePaid ?? 0
          }))
        }));
        setRecentOrders(normalized);
      } catch (error) {
        console.warn('خطا در دریافت سفارشات داشبورد', error);
        setRecentOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchAllStats();
    fetchRecentOrders();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '---';
    try {
      return new Date(dateString).toLocaleDateString('fa-IR');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">داشبورد مدیریت</h1>
          <p className="text-sm text-slate-500 mt-1">خلاصه عملکرد و آمار سیستم</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 sm:px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 transition active:bg-slate-100"
          >
            <Icon name="refresh" size={16} />
            <span className="hidden sm:inline">بروزرسانی</span>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="سفارشات امروز"
          value={stats.ordersToday}
          icon="package"
          color="blue"
          loading={loading}
        />
        <StatCard
          label="درآمد امروز"
          value={formatToman(stats.revenueToday)}
          icon="dollar"
          color="emerald"
          loading={loading}
        />
        <StatCard
          label="درآمد این ماه"
          value={formatToman(stats.revenueThisMonth)}
          icon="chart"
          color="indigo"
          loading={loading}
        />
        <StatCard
          label="کل محصولات"
          value={stats.totalProducts}
          icon="game"
          color="purple"
          loading={loading}
        />
      </section>

      {/* Secondary Stats */}
      <section className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="سفارشات پرداخت شده"
          value={stats.paidOrders}
          icon="check"
          color="green"
          loading={loading}
        />
        <StatCard
          label="در انتظار پرداخت"
          value={stats.pendingOrders}
          icon="clock"
          color="amber"
          loading={loading}
        />
        <Link href="/admin/arena/tournaments">
          <StatCard
            label="تورنمنت‌های فعال"
            value="12"
            icon="award"
            color="purple"
            loading={false}
          />
        </Link>
        <StatCard
          label="کاربران جدید"
          value={stats.newUsers}
          icon="users"
          color="cyan"
          loading={loading}
        />
      </section>

      {/* Widgets Grid */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <InventoryHealthWidget />
        <SalesByCategoryWidget />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <section className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">آخرین سفارشات</h2>
              <p className="text-xs text-slate-500 mt-1">۵ سفارش اخیر</p>
            </div>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition self-start sm:self-auto"
            >
              مشاهده همه
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
          {ordersLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
              <p className="text-sm text-slate-500 mt-3">در حال دریافت سفارشات...</p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
              <p className="text-sm text-slate-500">هنوز سفارشی ثبت نشده است</p>
              {!ADMIN_API_KEY && (
                <p className="text-xs text-amber-600 mt-2">کلید ادمین تنظیم نشده است</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders?order=${order.id}`}
                  className="block rounded-2xl border border-slate-100 p-3 sm:p-4 hover:border-emerald-200 hover:bg-emerald-50/30 transition group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition">
                          سفارش {order.orderNumber}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : order.paymentStatus === 'failed'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {order.paymentStatus === 'paid'
                            ? 'پرداخت شده'
                            : order.paymentStatus === 'failed'
                            ? 'ناموفق'
                            : 'در انتظار'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {order.customerInfo.name || order.customerInfo.email} • {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right sm:text-left self-end sm:self-auto">
                      <p className="text-sm font-black text-slate-900">
                        {formatToman(order.totalAmount)}
                      </p>
                      <p className="text-xs text-slate-500">تومان</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Top Products */}
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">پرفروش‌ترین‌ها</h2>
              <p className="text-xs text-slate-500 mt-1">۵ محصول برتر</p>
            </div>
            <Link
              href="/admin/products"
              className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition self-start sm:self-auto"
            >
              همه
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-slate-200 border-t-emerald-500"></div>
            </div>
          ) : topProducts.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              داده‌ای برای نمایش وجود ندارد
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{product.title}</p>
                      <p className="text-xs text-slate-500">{product.sales} فروش</p>
                    </div>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <p className="text-xs font-bold text-slate-700">{formatToman(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Quick Actions */}
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6 shadow-lg">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
          <Icon name="zap" size={20} className="text-emerald-600 sm:w-6 sm:h-6" />
          دسترسی سریع
        </h2>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-3 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50 p-5 hover:border-emerald-300 hover:shadow-lg hover:scale-105 transition-all duration-200 group"
          >
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
              <Icon name="plus" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">افزودن محصول</p>
              <p className="text-xs text-slate-500 mt-0.5">محصول جدید</p>
            </div>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50/50 p-5 hover:border-blue-300 hover:shadow-lg hover:scale-105 transition-all duration-200 group"
          >
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
              <Icon name="package" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">مدیریت سفارشات</p>
              <p className="text-xs text-slate-500 mt-0.5">مشاهده و مدیریت</p>
            </div>
          </Link>
          <Link
            href="/admin/home"
            className="flex items-center gap-3 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50/50 p-5 hover:border-purple-300 hover:shadow-lg hover:scale-105 transition-all duration-200 group"
          >
            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-3 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
              <Icon name="home" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">صفحه اصلی</p>
              <p className="text-xs text-slate-500 mt-0.5">ویرایش محتوا</p>
            </div>
          </Link>
          <Link
            href="/admin/marketing"
            className="flex items-center gap-3 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50/50 p-5 hover:border-indigo-300 hover:shadow-lg hover:scale-105 transition-all duration-200 group"
          >
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/30">
              <Icon name="megaphone" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">بازاریابی</p>
              <p className="text-xs text-slate-500 mt-0.5">کمپین و تبلیغات</p>
            </div>
          </Link>
          <Link
            href="/admin/arena/tournaments"
            className="flex items-center gap-3 rounded-2xl border-2 border-pink-200 bg-gradient-to-br from-white to-pink-50/50 p-5 hover:border-pink-300 hover:shadow-lg hover:scale-105 transition-all duration-200 group"
          >
            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
              <Icon name="award" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">آرنا</p>
              <p className="text-xs text-slate-500 mt-0.5">مدیریت تورنمنت‌ها</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  loading
}: {
  label: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'emerald' | 'indigo' | 'purple' | 'green' | 'amber' | 'rose' | 'cyan';
  loading?: boolean;
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
    <article className="rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <div className={`rounded-xl border p-2 ${colorClasses[color]}`}>
          <Icon name={icon as any} size={20} strokeWidth={2} />
        </div>
      </div>
      <p className="text-3xl font-black text-slate-900">
        {loading ? (
          <span className="inline-block h-8 w-24 animate-pulse bg-slate-200 rounded"></span>
        ) : (
          value
        )}
      </p>
    </article>
  );
}
