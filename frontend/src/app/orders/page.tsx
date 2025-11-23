'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';
import { formatToman } from '@/lib/format';

interface Order {
  _id: string;
  customerInfo: {
    email: string;
    phone: string;
  };
  items: Array<{
    gameId: {
      title: string;
    };
    quantity: number;
  }>;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  fulfillmentStatus: 'pending' | 'assigned' | 'delivered' | 'refunded';
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('gc_token');
        
        if (!token) {
          setError('لطفاً وارد حساب کاربری خود شوید');
          setLoading(false);
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

        const data = await response.json();
        setOrders(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در دریافت سفارشات');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status: string, type: 'payment' | 'fulfillment') => {
    const statusConfig = {
      payment: {
        pending: { label: 'در انتظار پرداخت', color: 'bg-amber-100 text-amber-700' },
        paid: { label: 'پرداخت شده', color: 'bg-emerald-100 text-emerald-700' },
        failed: { label: 'پرداخت ناموفق', color: 'bg-rose-100 text-rose-700' }
      },
      fulfillment: {
        pending: { label: 'در انتظار تحویل', color: 'bg-slate-100 text-slate-700' },
        assigned: { label: 'اختصاص داده شده', color: 'bg-blue-100 text-blue-700' },
        delivered: { label: 'تحویل داده شده', color: 'bg-emerald-100 text-emerald-700' },
        refunded: { label: 'بازگشت داده شده', color: 'bg-rose-100 text-rose-700' }
      }
    };

    const config = statusConfig[type][status as keyof typeof statusConfig[typeof type]];
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-rose-100 p-6">
          <svg className="h-12 w-12 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900">{error}</h2>
        <Link
          href="/login"
          className="mt-4 rounded-2xl bg-emerald-500 px-8 py-3 font-bold text-white transition hover:bg-emerald-600"
        >
          ورود به حساب کاربری
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-2xl font-black text-slate-900">سفارشات من</h1>

        {orders.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-slate-100 p-6">
              <svg className="h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">هنوز سفارشی ثبت نکرده‌اید</h2>
            <Link
              href="/products"
              className="mt-4 rounded-2xl bg-emerald-500 px-8 py-3 font-bold text-white transition hover:bg-emerald-600"
            >
              مشاهده محصولات
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                href={`/orders/${order._id}`}
                className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm text-slate-500">شماره سفارش:</span>
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {order._id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="mb-3 text-sm text-slate-600">
                      {order.items.length} محصول - {formatToman(order.totalAmount)} تومان
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {getStatusBadge(order.paymentStatus, 'payment')}
                      {getStatusBadge(order.fulfillmentStatus, 'fulfillment')}
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm font-bold text-emerald-600">
                      مشاهده جزئیات
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
