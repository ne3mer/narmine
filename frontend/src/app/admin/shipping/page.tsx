'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import { getAllShippingMethods, deleteShippingMethod, reorderShippingMethods, type ShippingMethod } from '@/lib/api/shipping-methods';
import { toast } from 'react-hot-toast';

export default function ShippingMethodsPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const data = await getAllShippingMethods();
      setMethods(data);
    } catch (error) {
      toast.error('خطا در دریافت روش‌های ارسال');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این روش ارسال اطمینان دارید؟')) return;

    try {
      await deleteShippingMethod(id);
      toast.success('روش ارسال با موفقیت حذف شد');
      fetchMethods();
    } catch (error) {
      toast.error('خطا در حذف روش ارسال');
    }
  };

  const moveMethod = async (index: number, direction: 'up' | 'down') => {
    const newMethods = [...methods];
    if (direction === 'up' && index > 0) {
      [newMethods[index], newMethods[index - 1]] = [newMethods[index - 1], newMethods[index]];
    } else if (direction === 'down' && index < newMethods.length - 1) {
      [newMethods[index], newMethods[index + 1]] = [newMethods[index + 1], newMethods[index]];
    }
    
    // Optimistic update
    setMethods(newMethods);

    try {
      await reorderShippingMethods(newMethods.map((m, idx) => ({ id: m._id, order: idx })));
    } catch (error) {
      toast.error('خطا در ذخیره ترتیب');
      fetchMethods(); // Revert
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">روش‌های ارسال</h1>
          <p className="mt-1 text-sm text-slate-500">مدیریت روش‌های ارسال و هزینه‌ها</p>
        </div>
        <Link
          href="/admin/shipping/new"
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600 self-start sm:self-auto"
        >
          <Icon name="plus" size={20} />
          <span>روش ارسال جدید</span>
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">ترتیب</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">نام</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">هزینه</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">زمان تحویل</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">وضعیت</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {methods.map((method, index) => (
              <tr key={method._id} className="group hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveMethod(index, 'up')}
                      disabled={index === 0}
                      className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 disabled:opacity-30"
                    >
                      <Icon name="chevron-up" size={16} />
                    </button>
                    <button
                      onClick={() => moveMethod(index, 'down')}
                      disabled={index === methods.length - 1}
                      className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 disabled:opacity-30"
                    >
                      <Icon name="chevron-down" size={16} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {method.icon && <span className="text-2xl">{method.icon}</span>}
                    <div>
                      <div className="font-bold text-slate-900">{method.name}</div>
                      {method.badge && (
                        <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 mt-1">
                          {method.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {method.price === 0 ? (
                    <span className="text-emerald-600 font-bold">رایگان</span>
                  ) : (
                    <span>{method.price.toLocaleString('fa-IR')} تومان</span>
                  )}
                  {method.freeThreshold && (
                    <div className="text-xs text-slate-400 mt-1">
                      رایگان بالای {method.freeThreshold.toLocaleString('fa-IR')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {method.eta || '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    method.isActive 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {method.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/shipping/${method._id}`}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Icon name="edit" size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(method._id)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Icon name="trash" size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {methods.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  هنوز هیچ روش ارسالی ایجاد نشده است
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
