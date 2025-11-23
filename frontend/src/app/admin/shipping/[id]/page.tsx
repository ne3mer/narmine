'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ShippingMethodForm from '@/components/admin/shipping/ShippingMethodForm';
import { getShippingMethodById, type ShippingMethod } from '@/lib/api/shipping-methods';
import { toast } from 'react-hot-toast';

export default function EditShippingMethodPage() {
  const params = useParams();
  const [method, setMethod] = useState<ShippingMethod | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchMethod(params.id as string);
    }
  }, [params.id]);

  const fetchMethod = async (id: string) => {
    try {
      const data = await getShippingMethodById(id);
      setMethod(data);
    } catch (error) {
      toast.error('خطا در دریافت اطلاعات روش ارسال');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
      </div>
    );
  }

  if (!method) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
        روش ارسال مورد نظر یافت نشد.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">ویرایش روش ارسال</h1>
        <p className="mt-1 text-sm text-slate-500">ویرایش اطلاعات {method.name}</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <ShippingMethodForm initialData={method} isEditing />
      </div>
    </div>
  );
}
