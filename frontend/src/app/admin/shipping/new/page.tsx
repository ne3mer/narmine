'use client';

import ShippingMethodForm from '@/components/admin/shipping/ShippingMethodForm';

export default function NewShippingMethodPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">روش ارسال جدید</h1>
        <p className="mt-1 text-sm text-slate-500">ایجاد یک روش ارسال جدید برای فروشگاه</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <ShippingMethodForm />
      </div>
    </div>
  );
}
