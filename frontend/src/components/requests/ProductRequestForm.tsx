'use client';

import { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { createProductRequest } from '@/lib/api/product-requests';
import { toast } from 'react-hot-toast';

interface Props {
  onSuccess: () => void;
}

export function ProductRequestForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    brand: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName || !formData.category) {
      toast.error('لطفاً نام محصول و دسته‌بندی را وارد کنید');
      return;
    }

    setLoading(true);
    try {
      await createProductRequest(formData);
      toast.success('درخواست شما با موفقیت ثبت شد');
      setFormData({ productName: '', category: '', brand: '', description: '' });
      onSuccess();
    } catch (error) {
      toast.error('خطا در ثبت درخواست');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-bold text-slate-700">
          نام محصول <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={formData.productName}
          onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition focus:border-emerald-500 focus:bg-white focus:outline-none"
          placeholder="مثال: روتختی دو نفره طرح گل"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">
            دسته‌بندی <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition focus:border-emerald-500 focus:bg-white focus:outline-none"
          >
            <option value="">انتخاب کنید</option>
            <option value="bedding-set">سرویس روتختی</option>
            <option value="pillow">بالش</option>
            <option value="blanket">پتو</option>
            <option value="mattress-pad">محافظ تشک</option>
            <option value="towel">حوله</option>
            <option value="other">سایر</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">
            برند (اختیاری)
          </label>
          <input
            type="text"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition focus:border-emerald-500 focus:bg-white focus:outline-none"
            placeholder="مثال: لایکو"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-slate-700">
          توضیحات تکمیلی
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition focus:border-emerald-500 focus:bg-white focus:outline-none"
          placeholder="توضیحات بیشتر در مورد محصول..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:opacity-70"
      >
        {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <>
            <Icon name="plus" size={18} />
            ثبت درخواست
          </>
        )}
      </button>
    </form>
  );
}
