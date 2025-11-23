'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/icons/Icon';
import { ProductRequestForm } from '@/components/requests/ProductRequestForm';
import { ProductRequestsList } from '@/components/requests/ProductRequestsList';
import { getUserProductRequests, deleteProductRequest, type ProductRequest } from '@/lib/api/product-requests';
import { toast } from 'react-hot-toast';

export default function RequestsPage() {
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const data = await getUserProductRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      toast.error('خطا در دریافت لیست درخواست‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteProductRequest(id);
      toast.success('درخواست با موفقیت حذف شد');
      setRequests(requests.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete request:', error);
      toast.error('خطا در حذف درخواست');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900">درخواست‌های محصول</h1>
          <p className="mt-1 text-sm text-slate-500">
            محصولی که می‌خوای رو پیدا نکردی؟ اینجا درخواست بده!
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            showForm
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20'
          }`}
        >
          {showForm ? (
            <>
              <Icon name="x" size={20} />
              انصراف
            </>
          ) : (
            <>
              <Icon name="plus" size={20} />
              ثبت درخواست جدید
            </>
          )}
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="animate-fade-in-up rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
          <ProductRequestForm onSuccess={() => {
            setShowForm(false);
            fetchRequests();
          }} />
        </div>
      )}

      {/* List Section */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
        </div>
      ) : (
        <ProductRequestsList requests={requests} onDelete={handleDelete} />
      )}
    </div>
  );
}
