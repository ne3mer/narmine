'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/icons/Icon';
import { API_BASE_URL } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';

export default function TelegramConnect() {
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const fetchLink = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        setError('برای اتصال ابتدا باید وارد حساب کاربری شوید');
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/telegram/link`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('خطا در دریافت لینک اتصال');
      
      const data = await res.json();
      setLink(data.link);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm('آیا از قطع اتصال تلگرام اطمینان دارید؟')) return;

    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        setError('برای مدیریت اتصال باید وارد حساب کاربری شوید');
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/telegram/unlink`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('خطا در قطع اتصال');
      
      setConnected(false);
      setLink(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-500 flex-shrink-0">
          <Icon name="send" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 mb-1">اتصال به تلگرام</h3>
          <p className="text-sm text-slate-500 mb-4">
            با اتصال حساب به ربات تلگرام نرمینه خواب، اعلان وضعیت سفارش‌ها، پیام‌های پشتیبانی و تخفیف‌های ویژه را فوری دریافت کنید.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-600 text-sm">
              {error}
            </div>
          )}

          {!link && !connected ? (
            <button
              onClick={fetchLink}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-400 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Icon name="link" size={18} />
                  دریافت لینک اتصال
                </>
              )}
            </button>
          ) : link ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 break-all font-mono text-sm text-slate-600">
                {link}
              </div>
              <div className="flex gap-2">
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-400 transition flex items-center gap-2"
                >
                  <Icon name="send" size={18} />
                  باز کردن در تلگرام
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(link)}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  کپی
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-emerald-600 font-bold flex items-center gap-2">
                <Icon name="check" size={18} />
                متصل شده
              </span>
              <button
                onClick={handleUnlink}
                className="text-rose-500 text-sm hover:underline"
              >
                قطع اتصال
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
