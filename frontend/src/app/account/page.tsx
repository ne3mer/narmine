'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { formatToman } from '@/lib/format';
import { Icon } from '@/components/icons/Icon';
import { getAuthToken } from '@/lib/auth';
import { NotificationCenter } from '@/components/dashboard/NotificationCenter';
import { QuickTrackWidget } from '@/components/dashboard/QuickTrackWidget';
import TelegramConnect from '@/components/profile/TelegramConnect';

type ShippingAddress = {
  province?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  recipientName?: string;
  recipientPhone?: string;
};

type OrderItem = {
  id: string;
  title: string;
  coverUrl?: string;
  quantity: number;
  pricePaid: number;
};

type Order = {
  id: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  fulfillmentStatus: 'pending' | 'assigned' | 'delivered' | 'refunded';
  createdAt?: string;
  items: OrderItem[];
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    shippingAddress?: ShippingAddress;
  };
  deliveryInfo?: {
    trackingCode?: string;
    message?: string;
  };
  paymentMethod?: string;
};

type Profile = {
  name?: string;
  email?: string;
  phone?: string;
  walletBalance?: number;
  telegram?: string;
  createdAt?: string;
};

type AddressSummary = ShippingAddress & {
  contactName?: string;
  contactPhone?: string;
  lastUsed?: string;
};

type Tab = 'overview' | 'orders' | 'notifications' | 'addresses' | 'profile';

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const normalizeOrder = (raw: any, index: number): Order => {
    const id = raw?.id || raw?._id || raw?.orderNumber || `order-${index}`;
    const items: OrderItem[] = Array.isArray(raw?.items)
      ? raw.items.map((item: any, itemIndex: number) => ({
          id: item?.id || item?._id || `${id}-item-${itemIndex}`,
          title: item?.gameId?.title || item?.gameId?.name || 'محصول',
          coverUrl: item?.gameId?.coverUrl,
          quantity: item?.quantity ?? 1,
          pricePaid: item?.pricePaid ?? 0
        }))
      : [];

    return {
      id,
      orderNumber: raw?.orderNumber || (id ? String(id).slice(-8).toUpperCase() : '---'),
      totalAmount: raw?.totalAmount ?? 0,
      paymentStatus: raw?.paymentStatus ?? 'pending',
      fulfillmentStatus: raw?.fulfillmentStatus ?? 'pending',
      createdAt: raw?.createdAt,
      items,
      customerInfo: raw?.customerInfo,
      deliveryInfo: raw?.deliveryInfo,
      paymentMethod: raw?.paymentMethod ?? 'online'
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = getAuthToken();
      if (!token) {
        router.push('/login?redirect=/account');
        return;
      }

      try {
        setError('');
        const headers = { Authorization: `Bearer ${token}` };

        const [profileRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/profile`, { headers }),
          fetch(`${API_BASE_URL}/api/orders`, { headers })
        ]);

        if (profileRes.status === 401 || ordersRes.status === 401) {
          router.push('/login?redirect=/account');
          return;
        }

        if (profileRes.ok) {
          const profilePayload = await profileRes.json();
          setProfile(profilePayload?.data ?? null);
        } else {
          const data = await profileRes.json().catch(() => null);
          setError(data?.message || 'خطا در دریافت اطلاعات کاربری');
        }

        if (ordersRes.ok) {
          const ordersPayload = await ordersRes.json();
          const normalized: Order[] = Array.isArray(ordersPayload?.data)
            ? ordersPayload.data.map((order: any, index: number) => normalizeOrder(order, index))
            : [];
          setOrders(normalized);
        } else {
          const data = await ordersRes.json().catch(() => null);
          setError((prev) => prev || data?.message || 'خطا در دریافت سفارش‌ها');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در بارگذاری حساب کاربری');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const paidOrders = orders.filter((order) => order.paymentStatus === 'paid').length;
    const pendingOrders = orders.filter((order) => order.fulfillmentStatus !== 'delivered').length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + (order.paymentStatus === 'paid' ? order.totalAmount : 0),
      0
    );

    return { totalOrders, paidOrders, pendingOrders, totalSpent };
  }, [orders]);

  const savedAddresses = useMemo<AddressSummary[]>(() => {
    const map = new Map<string, AddressSummary>();

    orders.forEach((order) => {
      const address = order.customerInfo?.shippingAddress;
      if (!address) return;

      const key = `${address.province || ''}-${address.city || ''}-${address.address || ''}-${address.postalCode || ''}`;
      if (!key.trim()) return;

      const current = map.get(key);
      const payload: AddressSummary = {
        ...address,
        contactName: address.recipientName || order.customerInfo?.name,
        contactPhone: address.recipientPhone || order.customerInfo?.phone,
        lastUsed: order.createdAt || new Date().toISOString()
      };

      if (!current || new Date(payload.lastUsed!).getTime() > new Date(current.lastUsed || 0).getTime()) {
        map.set(key, payload);
      }
    });

    return Array.from(map.values());
  }, [orders]);

  const latestOrder = orders[0];

  const navItems: Array<{ id: Tab; label: string; icon: string }> = [
    { id: 'overview', label: 'داشبورد', icon: 'layout-dashboard' },
    { id: 'orders', label: 'سفارش‌ها', icon: 'package' },
    { id: 'notifications', label: 'اعلان‌ها', icon: 'bell' },
    { id: 'addresses', label: 'آدرس‌ها', icon: 'map-pin' },
    { id: 'profile', label: 'اطلاعات کاربری', icon: 'user' }
  ];

  const renderAddressList = (compact = false) => {
    if (savedAddresses.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/40 p-6 text-center text-sm text-slate-500">
          هنوز آدرسی ثبت نشده است. اولین آدرس پس از ثبت سفارش ذخیره می‌شود.
        </div>
      );
    }

    const list = compact ? savedAddresses.slice(0, 2) : savedAddresses;

    return (
      <div className="space-y-4">
        {list.map((address, index) => (
          <div
            key={`${address.address || ''}-${address.postalCode || ''}-${index}`}
            className="rounded-2xl border border-slate-200 bg-white/80 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{address.contactName || 'گیرنده'}</p>
                <p className="text-xs text-slate-500">{address.contactPhone || 'شماره ثبت نشده'}</p>
              </div>
              {address.lastUsed && (
                <span className="text-xs text-slate-400">آخرین استفاده {new Date(address.lastUsed).toLocaleDateString('fa-IR')}</span>
              )}
            </div>
            <p className="mt-3 text-sm text-slate-600 leading-6">
              {[address.province, address.city, address.address].filter(Boolean).join('، ') || 'آدرس ثبت نشده'}
            </p>
            {address.postalCode && (
              <p className="mt-2 text-xs text-slate-500">کد پستی: {address.postalCode}</p>
            )}
          </div>
        ))}
        {compact && savedAddresses.length > list.length && (
          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className="w-full rounded-2xl border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            مشاهده تمام آدرس‌ها
          </button>
        )}
      </div>
    );
  };

  const renderOverview = () => {
    const overviewCards = [
      {
        label: 'کل سفارش‌ها',
        value: stats.totalOrders.toLocaleString('fa-IR'),
        icon: 'package'
      },
      {
        label: 'پرداخت شده',
        value: stats.paidOrders.toLocaleString('fa-IR'),
        icon: 'check-circle'
      },
      {
        label: 'در حال پردازش',
        value: stats.pendingOrders.toLocaleString('fa-IR'),
        icon: 'clock'
      },
      {
        label: 'جمع پرداختی',
        value: `${formatToman(stats.totalSpent)} تومان`,
        icon: 'credit-card'
      }
    ];

    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card) => (
            <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f8f5f2] text-[#c9a896]">
                  <Icon name={card.icon} size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{card.label}</p>
                  <p className="text-lg font-black text-slate-900">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <QuickTrackWidget />
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">آخرین سفارش</h3>
                {latestOrder && (
                  <Link
                    href={`/orders/${latestOrder.id}`}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    مشاهده جزئیات
                  </Link>
                )}
              </div>
              {latestOrder ? (
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>شماره سفارش:</span>
                    <span className="font-mono text-slate-900">{latestOrder.orderNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>تاریخ:</span>
                    <span>{latestOrder.createdAt ? new Date(latestOrder.createdAt).toLocaleDateString('fa-IR') : '---'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>مبلغ:</span>
                    <span className="font-semibold text-slate-900">{formatToman(latestOrder.totalAmount)} تومان</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>وضعیت:</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      {latestOrder.paymentStatus === 'paid' ? 'پرداخت شده' : 'در انتظار پرداخت'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-sm text-slate-500">
                  هنوز سفارشی ثبت نکرده‌اید. اولین خرید خود را از طریق فروشگاه آغاز کنید.
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">آدرس‌های اخیر</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('addresses')}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  مدیریت آدرس‌ها
                </button>
              </div>
              {renderAddressList(true)}
            </div>

            <TelegramConnect />
          </div>
        </div>
      </div>
    );
  };

  const renderOrders = () => (
    <div className="rounded-3xl border border-[#c9a896]/30 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#4a3f3a]">سفارش‌های من</h2>
          <p className="text-sm text-slate-500">مدیریت و پیگیری تمام سفارش‌های ثبت شده</p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4a3f3a] to-[#c9a896] px-6 py-3 text-sm font-semibold text-white shadow-lg"
        >
          خرید محصول جدید
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f8f5f2]">
            <Icon name="package" size={32} className="text-[#c9a896]" />
          </div>
          <p className="text-sm text-slate-500">هنوز سفارشی ثبت نکرده‌اید</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-100 p-4 transition-all hover:border-[#c9a896]/50 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f5f2] text-[#c9a896]">
                    <Icon name="package" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">سفارش #{order.orderNumber}</p>
                    <p className="text-sm text-slate-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fa-IR') : '---'}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-serif text-lg font-bold text-slate-900">{formatToman(order.totalAmount)} تومان</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs">
                    <span className={`rounded-full px-3 py-1 font-bold ${
                      order.paymentStatus === 'paid'
                        ? 'bg-emerald-50 text-emerald-600'
                        : order.paymentStatus === 'failed'
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-amber-50 text-amber-600'
                    }`}>
                      {order.paymentStatus === 'paid' ? 'پرداخت شده' : order.paymentStatus === 'failed' ? 'ناموفق' : 'در انتظار پرداخت'}
                    </span>
                    <span className={`rounded-full px-3 py-1 font-bold ${
                      order.fulfillmentStatus === 'delivered'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      وضعیت ارسال: {mapFulfillment(order.fulfillmentStatus)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                {order.items.slice(0, 2).map((item) => (
                  <span key={item.id} className="rounded-full bg-slate-100 px-3 py-1">
                    {item.title} × {item.quantity}
                  </span>
                ))}
                {order.items.length > 2 && (
                  <span className="text-xs text-slate-400">و {order.items.length - 2} محصول دیگر</span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/orders/${order.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-[#c9a896]"
                >
                  مشاهده جزئیات
                  <Icon name="arrow-left" size={14} />
                </Link>
                {order.deliveryInfo?.trackingCode && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
                    <Icon name="hash" size={14} />
                    کد رهگیری: {order.deliveryInfo.trackingCode}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-[#4a3f3a]">پیام‌ها و اعلان‌ها</h2>
        <p className="mt-2 text-sm text-slate-500">
          پیام‌های سیستمی، اطلاعیه‌های ادمین و پیگیری‌های سفارش را در این بخش مشاهده کنید.
        </p>
      </div>
      <NotificationCenter />
    </div>
  );

  const renderAddressesTab = () => (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold text-[#4a3f3a]">آدرس‌های ذخیره‌شده</h2>
        <p className="mt-2 text-sm text-slate-500">آدرس‌هایی که هنگام سفارش‌های اخیر استفاده کرده‌اید.</p>
      </div>
      {renderAddressList(false)}
    </div>
  );

  const renderProfile = () => (
    <div className="rounded-3xl border border-[#c9a896]/30 bg-white p-6 shadow-sm">
      <h2 className="mb-6 font-serif text-2xl font-bold text-[#4a3f3a]">اطلاعات کاربری</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#4a3f3a]">نام و نام خانوادگی</label>
          <input
            type="text"
            value={profile?.name || ''}
            readOnly
            className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-4 py-3 text-[#4a3f3a]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#4a3f3a]">ایمیل</label>
          <input
            type="email"
            value={profile?.email || ''}
            readOnly
            className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-4 py-3 text-[#4a3f3a]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#4a3f3a]">شماره تماس</label>
          <input
            type="text"
            value={profile?.phone || 'ثبت نشده'}
            readOnly
            className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-4 py-3 text-[#4a3f3a]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#4a3f3a]">عضویت از تاریخ</label>
          <input
            type="text"
            value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('fa-IR') : '---'}
            readOnly
            className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-4 py-3 text-[#4a3f3a]"
          />
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        برای به‌روزرسانی اطلاعات یا تکمیل پروفایل لطفاً با پشتیبانی در تماس باشید.
      </p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return renderOrders();
      case 'notifications':
        return renderNotifications();
      case 'addresses':
        return renderAddressesTab();
      case 'profile':
        return renderProfile();
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5f2]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f1e7df] border-t-[#c9a896]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f5f2] to-white px-4 py-16 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 font-serif text-4xl font-bold text-[#4a3f3a]" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
            حساب کاربری
          </h1>
          <p className="text-sm text-[#4a3f3a]/70">سلام {profile?.name || ''}، همه‌چیز درباره سفارش‌ها و اعلان‌ها در اینجا جمع شده است.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-[#c9a896]/20 bg-white p-6 shadow-sm">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#c9a896] to-[#4a3f3a] text-3xl text-white">
                  {profile?.name?.charAt(0) || 'ن'}
                </div>
                <h3 className="font-semibold text-[#4a3f3a]">{profile?.name || 'کاربر نرمینه خواب'}</h3>
                <p className="text-xs text-slate-500">{profile?.email}</p>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                      activeTab === item.id ? 'bg-[#f8f5f2] text-[#4a3f3a]' : 'text-[#4a3f3a]/60 hover:bg-[#f8f5f2]/60'
                    }`}
                  >
                    <Icon name={item.icon} size={16} />
                    {item.label}
                  </button>
                ))}
                <Link
                  href="/logout"
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-50"
                >
                  <Icon name="log-out" size={16} />
                  خروج
                </Link>
              </nav>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 text-sm text-slate-600">
              <p className="mb-2 font-semibold text-slate-900">آمار سریع</p>
              <p>سفارش‌ها: <span className="font-bold text-slate-900">{stats.totalOrders.toLocaleString('fa-IR')}</span></p>
              <p>مجموع پرداختی: <span className="font-bold text-slate-900">{formatToman(stats.totalSpent)} تومان</span></p>
            </div>
          </aside>

          <section className="space-y-6 lg:col-span-3">
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </div>
            )}
            {renderContent()}
          </section>
        </div>
      </div>
    </div>
  );
}

function mapFulfillment(status: Order['fulfillmentStatus']) {
  switch (status) {
    case 'assigned':
      return 'آماده ارسال';
    case 'delivered':
      return 'تحویل داده شده';
    case 'refunded':
      return 'مرجوع شده';
    default:
      return 'در حال آماده‌سازی';
  }
}
