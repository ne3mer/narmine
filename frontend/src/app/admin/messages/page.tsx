'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/icons/Icon';
import { getContactMessages, markMessageAsRead, deleteMessage, type ContactMessage } from '@/lib/api/contact';
import { toast } from 'react-hot-toast';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getContactMessages();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('خطا در دریافت پیام‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markMessageAsRead(id);
      setMessages(messages.map(m => m._id === id ? { ...m, isRead: true } : m));
      toast.success('پیام خوانده شد');
    } catch (error) {
      console.error('Failed to update message:', error);
      toast.error('خطا در به‌روزرسانی وضعیت');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این پیام اطمینان دارید؟')) return;
    try {
      await deleteMessage(id);
      setMessages(messages.filter(m => m._id !== id));
      toast.success('پیام حذف شد');
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('خطا در حذف پیام');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">پیام‌های تماس با ما</h1>
        <button 
          onClick={fetchMessages}
          className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
        >
          <Icon name="refresh" size={20} />
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">فرستنده</th>
                <th className="px-6 py-4 font-bold">موضوع</th>
                <th className="px-6 py-4 font-bold">تاریخ</th>
                <th className="px-6 py-4 font-bold">وضعیت</th>
                <th className="px-6 py-4 font-bold">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    هیچ پیامی یافت نشد
                  </td>
                </tr>
              ) : (
                messages.map((message) => (
                  <tr key={message._id} className={`group hover:bg-slate-50 ${!message.isRead ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{message.name}</div>
                      <div className="text-xs text-slate-500">{message.email}</div>
                      {message.phone && <div className="text-xs text-slate-400">{message.phone}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{message.subject}</div>
                      <div className="mt-1 max-w-md truncate text-xs text-slate-500" title={message.message}>
                        {message.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(message.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4">
                      {message.isRead ? (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                          خوانده شده
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-600">
                          جدید
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                        {!message.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(message._id)}
                            className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                            title="علامت به عنوان خوانده شده"
                          >
                            <Icon name="check" size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            alert(message.message);
                          }}
                          className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                          title="مشاهده متن کامل"
                        >
                          <Icon name="eye" size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(message._id)}
                          className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 hover:text-rose-600"
                          title="حذف"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
