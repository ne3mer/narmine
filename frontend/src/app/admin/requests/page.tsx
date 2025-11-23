'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/icons/Icon';
import { getAllProductRequests, updateProductRequestStatus, deleteProductRequest, type ProductRequest, type ProductRequestStats } from '@/lib/api/product-requests';
import { toast } from 'react-hot-toast';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [stats, setStats] = useState<ProductRequestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, statistics } = await getAllProductRequests(filter === 'all' ? undefined : filter);
      setRequests(data);
      setStats(statistics);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      toast.error('خطا در دریافت درخواست‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const note = prompt('یادداشت ادمین (اختیاری):');
    try {
      await updateProductRequestStatus(id, newStatus, note || undefined);
      toast.success('وضعیت درخواست به‌روز شد');
      fetchRequests();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('خطا در به‌روزرسانی وضعیت');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این درخواست اطمینان دارید؟')) return;
    try {
      await deleteProductRequest(id);
      toast.success('درخواست حذف شد');
      setRequests(requests.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete request:', error);
      toast.error('خطا در حذف درخواست');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'rejected': return 'bg-rose-100 text-rose-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'تایید شده';
      case 'rejected': return 'رد شده';
      case 'completed': return 'انجام شده';
      default: return 'در انتظار';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">مدیریت درخواست‌های محصول</h1>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">همه درخواست‌ها</option>
            <option value="pending">در انتظار بررسی</option>
            <option value="approved">تایید شده</option>
            <option value="rejected">رد شده</option>
            <option value="completed">انجام شده</option>
          </select>
          <button 
            onClick={fetchRequests}
            className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
          >
            <Icon name="refresh" size={20} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">کل درخواست‌ها</div>
            <div className="mt-1 text-2xl font-black text-slate-900">{stats.total}</div>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
            <div className="text-sm text-amber-600">در انتظار بررسی</div>
            <div className="mt-1 text-2xl font-black text-amber-700">{stats.pending}</div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
            <div className="text-sm text-emerald-600">تایید شده</div>
            <div className="mt-1 text-2xl font-black text-emerald-700">{stats.approved}</div>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
            <div className="text-sm text-blue-600">انجام شده</div>
            <div className="mt-1 text-2xl font-black text-blue-700">{stats.completed}</div>
          </div>
        </div>
      )}

      {/* Requests Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">محصول</th>
                <th className="px-6 py-4 font-bold">دسته‌بندی / برند</th>
                <th className="px-6 py-4 font-bold">وضعیت</th>
                <th className="px-6 py-4 font-bold">تاریخ</th>
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
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    هیچ درخواستی یافت نشد
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="group hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{request.productName}</div>
                      {request.description && (
                        <div className="mt-1 max-w-xs truncate text-xs text-slate-500" title={request.description}>
                          {request.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          <Icon name="layers" size={12} />
                          {request.category}
                        </span>
                        {request.brand && (
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            <Icon name="package" size={12} />
                            {request.brand}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getStatusColor(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(request.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(request.id, 'approved')}
                              className="rounded-lg bg-emerald-100 p-2 text-emerald-600 hover:bg-emerald-200"
                              title="تایید"
                            >
                              <Icon name="check" size={16} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(request.id, 'rejected')}
                              className="rounded-lg bg-rose-100 p-2 text-rose-600 hover:bg-rose-200"
                              title="رد"
                            >
                              <Icon name="x" size={16} />
                            </button>
                          </>
                        )}
                        {request.status === 'approved' && (
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'completed')}
                            className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                            title="تکمیل شده"
                          >
                            <Icon name="check" size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(request.id)}
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
