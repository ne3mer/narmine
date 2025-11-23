'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { getAuthToken } from '@/lib/auth';
import { Icon } from '@/components/icons/Icon';

type Notification = {
  id: string;
  _id?: string;
  type: 'order_email' | 'order_update' | 'price_alert' | 'system';
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
  orderId?: {
    orderNumber?: string;
    _id?: string;
    id?: string;
  };
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications?limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(Array.isArray(data?.data) ? data.data : []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data?.data?.count || 0);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const markAsRead = async (id: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id || n._id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id && n._id !== id));
        fetchUnreadCount();
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_email':
        return 'mail';
      case 'order_update':
        return 'package';
      case 'price_alert':
        return 'dollar';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order_email':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'order_update':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'price_alert':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
            <Icon name="bell" size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">مرکز اعلان‌ها</h3>
            <p className="text-xs text-slate-500">پیام‌ها و اعلان‌های سفارشات</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white">
              {unreadCount} جدید
            </span>
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              همه را خوانده‌شده
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-slate-200 border-t-emerald-500"></div>
            <p className="text-xs text-slate-500 mt-2">در حال بارگذاری...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500">
            <div className="flex justify-center mb-2">
              <Icon name="bell" size={32} className="text-slate-300" />
            </div>
            <p>هیچ اعلانی وجود ندارد</p>
            <p className="text-xs text-slate-400 mt-1">وقتی ایمیلی از طرف پشتیبانی ارسال شود، اینجا نمایش داده می‌شود</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const id = notification.id || notification._id || '';
            const isExpanded = expandedId === id;
            const isRead = notification.read;

            return (
              <div
                key={id}
                className={`rounded-2xl border p-4 transition-all ${
                  isRead
                    ? 'bg-slate-50 border-slate-200'
                    : `${getNotificationColor(notification.type)} border-2`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Icon name={getNotificationIcon(notification.type) as any} size={20} className="text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{notification.subject}</h4>
                          {!isRead && (
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDateTime(notification.createdAt)}
                          {notification.orderId?.orderNumber && (
                            <span className="mr-2"> • سفارش {notification.orderId.orderNumber}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!isRead && (
                          <button
                            onClick={() => markAsRead(id)}
                            className="rounded-lg p-1.5 hover:bg-white/80 transition"
                            title="علامت‌گذاری به عنوان خوانده شده"
                          >
                            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(id)}
                          className="rounded-lg p-1.5 hover:bg-white/80 transition"
                          title="حذف"
                        >
                          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-3">
                      {isExpanded ? (
                        <div className="space-y-3">
                          <div className="rounded-xl bg-white/60 p-3 text-sm text-slate-700 whitespace-pre-line">
                            {notification.message}
                          </div>
                          {notification.orderId && (
                            <Link
                              href={`/orders/${notification.orderId.id || notification.orderId._id}`}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                            >
                              مشاهده سفارش
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          )}
                          <button
                            onClick={() => setExpandedId(null)}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                          >
                            بستن
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setExpandedId(id)}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          مشاهده پیام کامل
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

