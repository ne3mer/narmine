'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/icons/Icon';
import { 
  getAllShippingMethods, 
  createShippingMethod, 
  updateShippingMethod, 
  deleteShippingMethod,
  type ShippingMethod 
} from '@/lib/api/shipping';
import toast from 'react-hot-toast';
import { formatToman } from '@/lib/format';

export default function ShippingPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<ShippingMethod>>({
    name: '',
    price: 0,
    eta: '',
    freeThreshold: 0,
    isActive: true,
    perks: []
  });

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const data = await getAllShippingMethods();
      setMethods(data);
    } catch {
      toast.error('خطا در دریافت روش‌های ارسال');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('نام روش ارسال الزامی است');
      return;
    }

    try {
      if (isEditing) {
        await updateShippingMethod(isEditing, formData);
        toast.success('روش ارسال ویرایش شد');
      } else {
        await createShippingMethod(formData);
        toast.success('روش ارسال جدید اضافه شد');
      }
      resetForm();
      fetchMethods();
    } catch {
      toast.error('خطا در ذخیره روش ارسال');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این روش ارسال اطمینان دارید؟')) return;
    try {
      await deleteShippingMethod(id);
      toast.success('روش ارسال حذف شد');
      fetchMethods();
    } catch {
      toast.error('خطا در حذف روش ارسال');
    }
  };

  const handleEdit = (method: ShippingMethod) => {
    setIsEditing(method._id);
    setFormData({
      name: method.name,
      price: method.price,
      eta: method.eta,
      freeThreshold: method.freeThreshold,
      isActive: method.isActive,
      perks: method.perks
    });
  };

  const resetForm = () => {
    setIsEditing(null);
    setFormData({
      name: '',
      price: 0,
      eta: '',
      freeThreshold: 0,
      isActive: true,
      perks: []
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#4a3f3a]">مدیریت روش‌های ارسال</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-[#c9a896]/20 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-[#4a3f3a]">
              {isEditing ? 'ویرایش روش ارسال' : 'افزودن روش جدید'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#4a3f3a]">نام روش</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثلاً: پست پیشتاز"
                  className="w-full rounded-xl border border-[#c9a896]/30 bg-[#f8f5f2] px-4 py-2 outline-none focus:border-[#c9a896]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#4a3f3a]">هزینه ارسال (تومان)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#c9a896]/30 bg-[#f8f5f2] px-4 py-2 outline-none focus:border-[#c9a896]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#4a3f3a]">سقف ارسال رایگان (تومان)</label>
                <input
                  type="number"
                  value={formData.freeThreshold}
                  onChange={(e) => setFormData({ ...formData, freeThreshold: Number(e.target.value) })}
                  placeholder="0 برای غیرفعال"
                  className="w-full rounded-xl border border-[#c9a896]/30 bg-[#f8f5f2] px-4 py-2 outline-none focus:border-[#c9a896]"
                />
                <p className="mt-1 text-xs text-gray-500">اگر سبد خرید بیشتر از این مبلغ باشد، ارسال رایگان می‌شود.</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#4a3f3a]">زمان تحویل (متن)</label>
                <input
                  type="text"
                  value={formData.eta}
                  onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                  placeholder="مثلاً: ۲ تا ۳ روز کاری"
                  className="w-full rounded-xl border border-[#c9a896]/30 bg-[#f8f5f2] px-4 py-2 outline-none focus:border-[#c9a896]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-[#c9a896] focus:ring-[#c9a896]"
                />
                <label className="text-sm font-medium text-[#4a3f3a]">فعال است</label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#4a3f3a] py-2 font-bold text-white transition-all hover:bg-[#c9a896]"
                >
                  {isEditing ? 'ذخیره تغییرات' : 'افزودن'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-gray-300 px-4 py-2 font-bold text-gray-500 hover:bg-gray-50"
                  >
                    انصراف
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="grid gap-4">
            {methods.map((method) => (
              <div
                key={method._id}
                className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                  method.isActive ? 'border-[#c9a896]/20 bg-white' : 'border-gray-200 bg-gray-50 opacity-75'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#4a3f3a]">{method.name}</h3>
                    {!method.isActive && (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">غیرفعال</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-[#4a3f3a]/70">
                    <span>هزینه: {method.price === 0 ? 'رایگان' : formatToman(method.price)}</span>
                    {method.freeThreshold && method.freeThreshold > 0 && (
                      <span className="text-green-600">
                        رایگان بالای {formatToman(method.freeThreshold)}
                      </span>
                    )}
                    {method.eta && <span>تحویل: {method.eta}</span>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(method)}
                    className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                  >
                    <Icon name="edit" size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(method._id)}
                    className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </div>
              </div>
            ))}

            {!loading && methods.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                هیچ روش ارسالی تعریف نشده است.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
