'use client';

import { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { API_BASE_URL } from '@/lib/api';
import type { AdminOrder } from '@/types/admin';
import { OrderTrackingTimeline } from './OrderTrackingTimeline';

export function QuickTrackWidget() {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<AdminOrder | null>(null);

  const handleTrack = async () => {
    if (!orderNumber.trim()) {
      setError('لطفاً شماره سفارش را وارد کنید');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const token = localStorage.getItem('gc_token');
      if (!token) {
        setError('لطفاً ابتدا وارد حساب کاربری خود شوید');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت سفارشات');
      }

      const payload = await response.json();
      const orders: any[] = Array.isArray(payload?.data) ? payload.data : [];
      
      const foundOrder = orders.find(
        o => o.orderNumber === orderNumber || o.id === orderNumber || o._id === orderNumber
      );

      if (!foundOrder) {
        setError('سفارشی با این شماره یافت نشد');
        return;
      }

      // Normalize order data
      const normalizedOrder: AdminOrder = {
        id: foundOrder.id ?? foundOrder._id ?? '',
        orderNumber: foundOrder.orderNumber ?? foundOrder.id ?? '',
        customerInfo: {
          name: foundOrder.customerInfo?.name,
          email: foundOrder.customerInfo?.email ?? '',
          phone: foundOrder.customerInfo?.phone ?? ''
        },
        paymentStatus: foundOrder.paymentStatus ?? 'pending',
        fulfillmentStatus: foundOrder.fulfillmentStatus ?? 'pending',
        totalAmount: foundOrder.totalAmount ?? 0,
        paymentReference: foundOrder.paymentReference,
        createdAt: foundOrder.createdAt ?? new Date().toISOString(),
        updatedAt: foundOrder.updatedAt ?? foundOrder.createdAt ?? new Date().toISOString(),
        items: (foundOrder.items ?? []).map((item: any, idx: number) => ({
          id: item.id ?? item._id ?? `item-${idx}`,
          gameTitle: item.gameId?.title ?? item.gameId?.name ?? 'محصول',
          productType: item.gameId?.productType,
          variantId: item.variantId,
          selectedOptions: item.selectedOptions,
          quantity: item.quantity ?? 1,
          pricePaid: item.pricePaid ?? 0,
          warranty: item.warranty
        })),
        deliveryInfo: foundOrder.deliveryInfo,
        customerAcknowledgement: foundOrder.customerAcknowledgement
      };

      setOrder(normalizedOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در پیگیری سفارش');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Widget */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon name="search" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">پیگیری سریع</h3>
            <p className="text-xs text-slate-500">شماره سفارش خود را وارد کنید</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => {
              setOrderNumber(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            placeholder="مثال: ORD-12345"
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            disabled={loading}
          />
          <button
            onClick={handleTrack}
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl bg-blue-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                در حال جستجو...
              </>
            ) : (
              <>
                <Icon name="search" size={16} />
                پیگیری
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 flex items-center gap-2">
            <Icon name="alert" size={16} className="text-rose-600 flex-shrink-0" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}
      </div>

      {/* Tracking Result */}
      {order && (
        <OrderTrackingTimeline order={order} />
      )}
    </div>
  );
}
