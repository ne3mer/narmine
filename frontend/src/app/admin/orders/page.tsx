'use client';

import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL, ADMIN_API_KEY, adminHeaders } from '@/lib/api';
import type { AdminOrder } from '@/types/admin';

const adminKeyWarning = 'برای مدیریت سفارشات باید متغیر NEXT_PUBLIC_ADMIN_API_KEY تنظیم شود.';

type Filters = {
  search: string;
  paymentStatus: '' | 'pending' | 'paid' | 'failed';
  fulfillmentStatus: '' | 'pending' | 'assigned' | 'delivered' | 'refunded';
  fromDate: string;
  toDate: string;
};

const defaultFilters: Filters = {
  search: '',
  paymentStatus: '',
  fulfillmentStatus: '',
  fromDate: '',
  toDate: ''
};

const paymentStatusLabels: Record<string, string> = {
  pending: 'در انتظار پرداخت',
  paid: 'پرداخت شده',
  failed: 'ناموفق'
};

const fulfillmentStatusLabels: Record<string, string> = {
  pending: 'در انتظار تحویل',
  assigned: 'تحویل به واحد فنی',
  delivered: 'تحویل شده',
  refunded: 'مرجوع شده'
};

const statusChip = (type: 'payment' | 'fulfillment', status: string) => {
  const base = 'rounded-full px-3 py-1 text-xs font-semibold';
  const map: Record<string, string> =
    type === 'payment'
      ? {
          paid: `${base} bg-emerald-50 text-emerald-600`,
          pending: `${base} bg-amber-50 text-amber-600`,
          failed: `${base} bg-rose-50 text-rose-600`
        }
      : {
          delivered: `${base} bg-emerald-50 text-emerald-600`,
          assigned: `${base} bg-blue-50 text-blue-600`,
          pending: `${base} bg-slate-100 text-slate-600`,
          refunded: `${base} bg-rose-50 text-rose-600`
        };
  return map[status] ?? `${base} bg-slate-100 text-slate-500`;
};

const formatDateTime = (value?: string) => {
  if (!value) return '---';
  try {
    const date = new Date(value);
    return date.toLocaleString('fa-IR');
  } catch {
    return value;
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [deliveryCredentials, setDeliveryCredentials] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [savingDelivery, setSavingDelivery] = useState(false);
  
  // Warranty Modal State
  const [warrantyModalOpen, setWarrantyModalOpen] = useState(false);
  const [warrantyItemId, setWarrantyItemId] = useState<string | null>(null);
  const [warrantyStartDate, setWarrantyStartDate] = useState('');
  const [warrantyDuration, setWarrantyDuration] = useState('12'); // months
  const [warrantyDescription, setWarrantyDescription] = useState('');
  const [savingWarranty, setSavingWarranty] = useState(false);

  const buildQueryString = (pageOverride?: number) => {
    const params = new URLSearchParams();
    if (filters.search.trim()) params.set('search', filters.search.trim());
    if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus);
    if (filters.fulfillmentStatus) params.set('fulfillmentStatus', filters.fulfillmentStatus);
    if (filters.fromDate) params.set('fromDate', filters.fromDate);
    if (filters.toDate) params.set('toDate', filters.toDate);
    params.set('page', String(pageOverride ?? meta.page));
    params.set('limit', String(meta.limit));
    return params.toString();
  };

  const transformOrder = (order: any): AdminOrder => {
    const items = (order.items ?? []).map((item: any, index: number) => {
      const game = item.gameId ?? {};
      const title =
        typeof game === 'object' && game !== null ? (game.title ?? game.name ?? 'محصول ناشناس') : 'محصول ناشناس';
      const options =
        item.selectedOptions && typeof item.selectedOptions === 'object'
          ? item.selectedOptions
          : undefined;
      return {
        id: item.id ?? item._id ?? `${order.id}-${index}`,
        gameTitle: title,
        variantId: item.variantId,
        selectedOptions: options,
        quantity: item.quantity ?? 1,
        pricePaid: item.pricePaid ?? 0,
        warranty: item.warranty
      };
    });

    return {
      id: order.id ?? order._id,
      orderNumber: order.orderNumber ?? order.id ?? '---',
      customerInfo: order.customerInfo ?? { email: 'تعریف نشده', phone: '---' },
      paymentStatus: order.paymentStatus ?? 'pending',
      fulfillmentStatus: order.fulfillmentStatus ?? 'pending',
      totalAmount: order.totalAmount ?? 0,
      paymentReference: order.paymentReference,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items,
      deliveryInfo: order.deliveryInfo
        ? {
            message: order.deliveryInfo.message,
            credentials: order.deliveryInfo.credentials,
            deliveredAt: order.deliveryInfo.deliveredAt
          }
        : undefined,
      customerAcknowledgement: order.customerAcknowledgement
    };
  };

  const fetchOrders = async (pageOverride?: number) => {
    if (!ADMIN_API_KEY) {
      setError(adminKeyWarning);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const query = buildQueryString(pageOverride);
      const response = await fetch(`${API_BASE_URL}/api/orders/admin?${query}`, {
        headers: adminHeaders()
      });
      if (!response.ok) {
        throw new Error('خطا در دریافت سفارشات');
      }
      const payload = await response.json();
      const data = Array.isArray(payload?.data) ? payload.data.map(transformOrder) : [];
      setOrders(data);
      setMeta({
        total: payload?.meta?.total ?? data.length,
        page: payload?.meta?.page ?? pageOverride ?? 1,
        limit: payload?.meta?.limit ?? meta.limit
      });
      if (data.length) {
        setSelectedOrderId((prev) => prev && data.some((o: AdminOrder) => o.id === prev) ? prev : data[0].id);
      } else {
        setSelectedOrderId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'بارگذاری سفارشات ممکن نیست.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  );

  useEffect(() => {
    if (!selectedOrder) {
      setEmailSubject('');
      setEmailBody('');
      setDeliveryMessage('');
      setDeliveryCredentials('');
      setDeliveryDate('');
      return;
    }
    const baseSubject = `رسید سفارش ${selectedOrder.orderNumber}`;
    const defaultBody = `سلام ${
      selectedOrder.customerInfo.name ?? selectedOrder.customerInfo.email
    } عزیز،

در این ایمیل رسید سفارش ${selectedOrder.orderNumber} با مبلغ ${selectedOrder.totalAmount.toLocaleString(
      'fa-IR'
    )} تومان برای شما ارسال می‌شود.
وضعیت پرداخت: ${paymentStatusLabels[selectedOrder.paymentStatus] ?? selectedOrder.paymentStatus}
وضعیت تحویل: ${fulfillmentStatusLabels[selectedOrder.fulfillmentStatus] ?? selectedOrder.fulfillmentStatus}

با تشکر از اعتماد شما به GameClub`;
    setEmailSubject(baseSubject);
    setEmailBody(defaultBody);
    setDeliveryMessage(selectedOrder.deliveryInfo?.message ?? '');
    setDeliveryCredentials(selectedOrder.deliveryInfo?.credentials ?? '');
    setDeliveryDate(
      selectedOrder.deliveryInfo?.deliveredAt
        ? new Date(selectedOrder.deliveryInfo.deliveredAt).toISOString().slice(0, 16)
        : ''
    );
  }, [selectedOrder]);

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setMeta((prev) => ({ ...prev, page: 1 }));
    fetchOrders(1);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setMeta((prev) => ({ ...prev, page: 1 }));
    fetchOrders(1);
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    const newPage =
      direction === 'prev'
        ? Math.max(1, meta.page - 1)
        : meta.page + 1;
    setMeta((prev) => ({ ...prev, page: newPage }));
    fetchOrders(newPage);
  };

  const handleStatusUpdate = async (field: 'paymentStatus' | 'fulfillmentStatus', value: string) => {
    if (!selectedOrder || !value || !ADMIN_API_KEY) return;
    setStatusUpdating(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ [field]: value })
      });
      if (!response.ok) {
        throw new Error('به‌روزرسانی وضعیت انجام نشد');
      }
      await fetchOrders(meta.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تغییر وضعیت ممکن نیست.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const persistDeliveryInfo = async () => {
    if (!selectedOrder || !ADMIN_API_KEY) {
      setError(adminKeyWarning);
      return false;
    }
    setSavingDelivery(true);
    setError('');
    try {
      const payload = {
        message: deliveryMessage || undefined,
        credentials: deliveryCredentials || undefined,
        deliveredAt: deliveryDate || undefined
      };
      const response = await fetch(`${API_BASE_URL}/api/orders/${selectedOrder.id}/delivery`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.message || 'ذخیره پیام تحویل ممکن نیست');
      }
      await fetchOrders(meta.page);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ثبت پیام تحویل با مشکل مواجه شد.');
      return false;
    } finally {
      setSavingDelivery(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedOrder || !ADMIN_API_KEY) return;
    setSendingEmail(true);
    setError('');
    try {
      await persistDeliveryInfo();
      const response = await fetch(`${API_BASE_URL}/api/orders/${selectedOrder.id}/notify`, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ subject: emailSubject, message: emailBody })
      });
      if (!response.ok) {
        throw new Error('ارسال ایمیل با خطا مواجه شد');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ارسال ایمیل ممکن نیست.');
    } finally {
      setSendingEmail(false);
    }
  };

  const openWarrantyModal = (itemId: string, currentWarranty?: any) => {
    setWarrantyItemId(itemId);
    setWarrantyStartDate(
      currentWarranty?.startDate
        ? new Date(currentWarranty.startDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10)
    );
    setWarrantyDescription(currentWarranty?.description || '');
    setWarrantyModalOpen(true);
  };

  const handleSaveWarranty = async () => {
    if (!selectedOrder || !warrantyItemId || !ADMIN_API_KEY) return;
    setSavingWarranty(true);
    setError('');

    try {
      const startDate = new Date(warrantyStartDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + parseInt(warrantyDuration));

      const payload = {
        status: 'active',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        description: warrantyDescription
      };

      const response = await fetch(
        `${API_BASE_URL}/api/orders/${selectedOrder.id}/items/${warrantyItemId}/warranty`,
        {
          method: 'PATCH',
          headers: adminHeaders(),
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error('ذخیره گارانتی انجام نشد');
      }

      await fetchOrders(meta.page);
      setWarrantyModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره گارانتی');
    } finally {
      setSavingWarranty(false);
    }
  };

  const summaryCards = useMemo(() => {
    const paid = orders.filter((order) => order.paymentStatus === 'paid').length;
    const pending = orders.filter((order) => order.paymentStatus === 'pending').length;
    const totalAmount = orders.reduce((sum, order) => sum + (order.totalAmount ?? 0), 0);
    return [
      { id: 'total', label: 'کل سفارش‌ها', value: meta.total },
      { id: 'paid', label: 'پرداخت موفق', value: paid },
      { id: 'pending', label: 'در انتظار پرداخت', value: pending },
      { id: 'amount', label: 'مجموع مبالغ', value: `${totalAmount.toLocaleString('fa-IR')} تومان` }
    ];
  }, [meta.total, orders]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">مدیریت سفارشات</h1>
        <p className="text-sm text-slate-500">جستجو، مدیریت و ارسال رسید برای هر سفارش</p>
      </header>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article key={card.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">{card.label}</p>
            <p className="mt-3 text-2xl font-black text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid gap-4 md:grid-cols-4">
          <label className="text-sm text-slate-600">
            جستجو (شماره سفارش، نام، ایمیل، تلفن)
            <input
              value={filters.search}
              onChange={(event) => handleFilterChange('search', event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              placeholder="مثلاً GC241001-1234"
            />
          </label>
          <label className="text-sm text-slate-600">
            وضعیت پرداخت
            <select
              value={filters.paymentStatus}
              onChange={(event) => handleFilterChange('paymentStatus', event.target.value as Filters['paymentStatus'])}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            >
              <option value="">همه</option>
              <option value="paid">پرداخت شده</option>
              <option value="pending">در انتظار پرداخت</option>
              <option value="failed">ناموفق</option>
            </select>
          </label>
          <label className="text-sm text-slate-600">
            وضعیت تحویل
            <select
              value={filters.fulfillmentStatus}
              onChange={(event) =>
                handleFilterChange('fulfillmentStatus', event.target.value as Filters['fulfillmentStatus'])
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            >
              <option value="">همه</option>
              <option value="pending">در انتظار</option>
              <option value="assigned">تحویل به واحد فنی</option>
              <option value="delivered">تحویل شده</option>
              <option value="refunded">مرجوع شده</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
            <label>
              از تاریخ
              <input
                type="date"
                value={filters.fromDate}
                onChange={(event) => handleFilterChange('fromDate', event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
            </label>
            <label>
              تا تاریخ
              <input
                type="date"
                value={filters.toDate}
                onChange={(event) => handleFilterChange('toDate', event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
            </label>
          </div>
          <div className="md:col-span-4 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'در حال جستجو...' : 'اعمال فیلتر'}
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"
            >
              حذف فیلترها
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              نتیجه: {orders.length} سفارش (صفحه {meta.page} از {Math.max(1, Math.ceil(meta.total / meta.limit))})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange('prev')}
                disabled={meta.page === 1 || loading}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-50"
              >
                صفحه قبل
              </button>
              <button
                type="button"
                onClick={() => handlePageChange('next')}
                disabled={meta.page >= Math.ceil(meta.total / meta.limit) || loading}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-50"
              >
                صفحه بعد
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {loading && (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-sm text-slate-500">
                در حال بارگذاری سفارشات...
              </div>
            )}
            {!loading && orders.length === 0 && (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-sm text-slate-500">
                سفارش مطابق فیلترها یافت نشد.
              </div>
            )}
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className={`w-full rounded-2xl border px-4 py-4 text-right transition ${
                  order.id === selectedOrderId
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-slate-100 bg-white hover:border-emerald-100'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900">سفارش {order.orderNumber}</p>
                    <p className="text-xs text-slate-500">
                      {order.customerInfo.name || 'بدون نام'} • {order.customerInfo.email}
                    </p>
                  </div>
                  <div className="text-left text-sm font-bold text-slate-900">
                    {order.totalAmount.toLocaleString('fa-IR')} تومان
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className={statusChip('payment', order.paymentStatus)}>
                    {paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}
                  </span>
                  <span className={statusChip('fulfillment', order.fulfillmentStatus)}>
                    {fulfillmentStatusLabels[order.fulfillmentStatus] ?? order.fulfillmentStatus}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">
                    {formatDateTime(order.createdAt)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <aside className={`
          space-y-4 bg-white transition-all duration-300
          lg:static lg:block lg:rounded-3xl lg:border lg:border-slate-100 lg:p-6 lg:shadow-sm lg:col-span-1
          ${selectedOrder 
            ? 'fixed inset-0 z-50 overflow-y-auto p-4' 
            : 'hidden lg:block lg:opacity-100'
          }
        `}>
          {selectedOrder ? (
            <>
              <div className="flex items-center justify-between lg:hidden mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-bold text-slate-900">جزئیات سفارش</h3>
                <button 
                  onClick={() => setSelectedOrderId(null)}
                  className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500">شماره سفارش</p>
                <p className="text-lg font-black text-slate-900">{selectedOrder.orderNumber}</p>
                <p className="text-xs text-slate-400">ثبت شده در {formatDateTime(selectedOrder.createdAt)}</p>
              </div>

              <div className="border-t border-slate-100 pt-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{selectedOrder.customerInfo.name || 'بدون نام'}</p>
                <p className="text-xs">{selectedOrder.customerInfo.email}</p>
                <p className="text-xs">{selectedOrder.customerInfo.phone}</p>
              </div>

              <div className="grid gap-3 border-t border-slate-100 pt-4 text-sm">
                <label className="text-xs text-slate-500">
                  وضعیت پرداخت
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(event) => handleStatusUpdate('paymentStatus', event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    disabled={statusUpdating}
                  >
                    <option value="paid">پرداخت شده</option>
                    <option value="pending">در انتظار پرداخت</option>
                    <option value="failed">ناموفق</option>
                  </select>
                </label>
                <label className="text-xs text-slate-500">
                  وضعیت تحویل
                  <select
                    value={selectedOrder.fulfillmentStatus}
                    onChange={(event) => handleStatusUpdate('fulfillmentStatus', event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    disabled={statusUpdating}
                  >
                    <option value="pending">در انتظار</option>
                    <option value="assigned">تحویل به واحد فنی</option>
                    <option value="delivered">تحویل شده</option>
                    <option value="refunded">مرجوع شده</option>
                  </select>
                </label>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-semibold text-slate-900">اقلام سفارش</h3>
                <div className="mt-2 space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs text-slate-600">
                      <p className="font-semibold text-slate-900">{item.gameTitle}</p>
                      <p>
                        {item.quantity} × {item.pricePaid.toLocaleString('fa-IR')} تومان
                      </p>
                      {item.selectedOptions && (
                        <p className="text-[11px] text-slate-500">
                          {Object.entries(item.selectedOptions)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(' | ')}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
                        {item.warranty?.status === 'active' ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            گارانتی فعال تا {formatDateTime(item.warranty.endDate)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">بدون گارانتی</span>
                        )}
                        <button
                          onClick={() => openWarrantyModal(item.id, item.warranty)}
                          className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-200"
                        >
                          مدیریت گارانتی
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-left text-sm font-bold text-slate-900">
                  جمع کل: {selectedOrder.totalAmount.toLocaleString('fa-IR')} تومان
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">پیام تحویل / اطلاعات حساب</h3>
                <label className="block text-xs text-slate-500">
                  پیام تحویل برای مشتری
                  <textarea
                    value={deliveryMessage}
                    onChange={(event) => setDeliveryMessage(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    rows={3}
                    placeholder="اطلاعات فعال‌سازی، لینک‌ها و توضیحات..."
                  />
                </label>
                <label className="block text-xs text-slate-500">
                  اطلاعات حساب / Credential
                  <textarea
                    value={deliveryCredentials}
                    onChange={(event) => setDeliveryCredentials(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Email: ... / Password: ..."
                  />
                </label>
                <label className="block text-xs text-slate-500">
                  تاریخ ارسال
                  <input
                    type="datetime-local"
                    value={deliveryDate}
                    onChange={(event) => setDeliveryDate(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={persistDeliveryInfo}
                  disabled={savingDelivery}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 disabled:opacity-60"
                >
                  {savingDelivery ? 'در حال ذخیره...' : 'ذخیره پیام تحویل'}
                </button>
                {selectedOrder.deliveryInfo?.message && (
                  <div className="rounded-2xl bg-slate-50/80 p-3 text-xs text-slate-600">
                    <p className="font-bold text-slate-900">پیام ذخیره شده:</p>
                    <p className="mt-1 whitespace-pre-line">{selectedOrder.deliveryInfo.message}</p>
                    {selectedOrder.deliveryInfo.credentials && (
                      <p className="mt-2 rounded-xl bg-white p-2 font-mono text-[11px]">
                        {selectedOrder.deliveryInfo.credentials}
                      </p>
                    )}
                    <p className="mt-2 text-[11px] text-slate-500">
                      ثبت در {formatDateTime(selectedOrder.deliveryInfo.deliveredAt)}
                    </p>
                    {selectedOrder.customerAcknowledgement?.acknowledged ? (
                      <p className="text-[11px] text-emerald-600">
                        تایید توسط مشتری در {formatDateTime(selectedOrder.customerAcknowledgement.acknowledgedAt)}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500">منتظر تایید مشتری</p>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-semibold text-slate-900">ارسال رسید به ایمیل</h3>
                <label className="mt-3 block text-xs text-slate-500">
                  عنوان ایمیل
                  <input
                    value={emailSubject}
                    onChange={(event) => setEmailSubject(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="mt-3 block text-xs text-slate-500">
                  متن پیام
                  <textarea
                    value={emailBody}
                    onChange={(event) => setEmailBody(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    rows={5}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={sendingEmail || !emailBody.trim()}
                  className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {sendingEmail ? 'در حال ارسال...' : 'ارسال ایمیل به مشتری'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-sm text-slate-500 hidden lg:block">
              برای مشاهده جزئیات، یک سفارش را از لیست انتخاب کنید.
            </div>
          )}
        </aside>
      </section>

      {/* Warranty Modal */}
      {warrantyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">مدیریت گارانتی محصول</h3>
            <div className="mt-4 space-y-4">
              <label className="block text-sm text-slate-600">
                تاریخ شروع گارانتی
                <input
                  type="date"
                  value={warrantyStartDate}
                  onChange={(e) => setWarrantyStartDate(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                />
              </label>
              <label className="block text-sm text-slate-600">
                مدت زمان (ماه)
                <select
                  value={warrantyDuration}
                  onChange={(e) => setWarrantyDuration(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                >
                  <option value="6">۶ ماه</option>
                  <option value="12">۱۲ ماه (۱ سال)</option>
                  <option value="24">۲۴ ماه (۲ سال)</option>
                  <option value="36">۳۶ ماه (۳ سال)</option>
                </select>
              </label>
              <label className="block text-sm text-slate-600">
                توضیحات (شرایط گارانتی)
                <textarea
                  value={warrantyDescription}
                  onChange={(e) => setWarrantyDescription(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  rows={3}
                  placeholder="مثلاً: شامل تعویض اکانت در صورت بن شدن..."
                />
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveWarranty}
                disabled={savingWarranty}
                className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {savingWarranty ? 'در حال ذخیره...' : 'ذخیره گارانتی'}
              </button>
              <button
                onClick={() => setWarrantyModalOpen(false)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
