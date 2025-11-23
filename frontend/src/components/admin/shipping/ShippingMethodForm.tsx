'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Icon } from '@/components/icons/Icon';
import { createShippingMethod, updateShippingMethod, type ShippingMethod } from '@/lib/api/shipping-methods';

interface ShippingMethodFormProps {
  initialData?: ShippingMethod;
  isEditing?: boolean;
}

export default function ShippingMethodForm({ initialData, isEditing = false }: ShippingMethodFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ShippingMethod>>({
    name: initialData?.name || '',
    price: initialData?.price || 0,
    priceLabel: initialData?.priceLabel || '',
    eta: initialData?.eta || '',
    badge: initialData?.badge || '',
    icon: initialData?.icon || 'truck',
    perks: initialData?.perks || [],
    freeThreshold: initialData?.freeThreshold || 0,
    isActive: initialData?.isActive ?? true,
    order: initialData?.order || 0
  });

  const [newPerk, setNewPerk] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && initialData?._id) {
        await updateShippingMethod(initialData._id, formData);
        toast.success('روش ارسال با موفقیت ویرایش شد');
      } else {
        await createShippingMethod(formData);
        toast.success('روش ارسال با موفقیت ایجاد شد');
      }
      router.push('/admin/shipping');
      router.refresh();
    } catch (error) {
      toast.error(isEditing ? 'خطا در ویرایش روش ارسال' : 'خطا در ایجاد روش ارسال');
    } finally {
      setLoading(false);
    }
  };

  const addPerk = () => {
    if (newPerk.trim()) {
      setFormData({ ...formData, perks: [...(formData.perks || []), newPerk.trim()] });
      setNewPerk('');
    }
  };

  const removePerk = (index: number) => {
    const newPerks = [...(formData.perks || [])];
    newPerks.splice(index, 1);
    setFormData({ ...formData, perks: newPerks });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">نام روش ارسال</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="مثال: پست پیشتاز"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">آیکون (نام آیکون)</label>
            <div className="relative">
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 ltr"
                dir="ltr"
                placeholder="truck"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Icon name={formData.icon as any} size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">هزینه (تومان)</label>
            <input
              type="number"
              required
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <p className="text-xs text-slate-500">برای رایگان، 0 وارد کنید</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">برچسب هزینه (اختیاری)</label>
            <input
              type="text"
              value={formData.priceLabel}
              onChange={(e) => setFormData({ ...formData, priceLabel: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="مثال: پس‌کرایه"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">زمان تحویل</label>
            <input
              type="text"
              value={formData.eta}
              onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="مثال: ۲ تا ۴ روز کاری"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">نشان ویژه (Badge)</label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="مثال: سریع‌ترین"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">سقف ارسال رایگان (تومان)</label>
          <input
            type="number"
            min="0"
            value={formData.freeThreshold}
            onChange={(e) => setFormData({ ...formData, freeThreshold: Number(e.target.value) })}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <p className="text-xs text-slate-500">اگر مبلغ سبد خرید بیشتر از این مقدار باشد، ارسال رایگان خواهد بود. 0 برای غیرفعال کردن.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">ویژگی‌ها (Perks)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPerk}
              onChange={(e) => setNewPerk(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPerk())}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="ویژگی جدید را وارد کنید و اینتر بزنید"
            />
            <button
              type="button"
              onClick={addPerk}
              className="rounded-xl bg-slate-100 px-4 py-2 text-slate-600 hover:bg-slate-200 transition"
            >
              <Icon name="plus" size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.perks?.map((perk, index) => (
              <span key={index} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-sm text-emerald-700 border border-emerald-100">
                {perk}
                <button
                  type="button"
                  onClick={() => removePerk(index)}
                  className="rounded-full p-0.5 hover:bg-emerald-200 text-emerald-500"
                >
                  <Icon name="x" size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
            فعال است
          </label>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'در حال ذخیره...' : (isEditing ? 'ذخیره تغییرات' : 'ایجاد روش ارسال')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}
