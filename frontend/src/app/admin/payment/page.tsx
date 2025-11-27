'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/icons/Icon';
import { 
  getAllPaymentMethods, 
  createPaymentMethod, 
  updatePaymentMethod, 
  deletePaymentMethod, 
  reorderPaymentMethods,
  type PaymentMethod 
} from '@/lib/api/payment';
import toast from 'react-hot-toast';

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    description: '',
    icon: '',
    isActive: true
  });

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const data = await getAllPaymentMethods();
      setMethods(data);
    } catch (error) {
      toast.error('خطا در دریافت روش‌های پرداخت');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMethod) {
        await updatePaymentMethod(editingMethod._id, formData);
        toast.success('روش پرداخت با موفقیت ویرایش شد');
      } else {
        await createPaymentMethod(formData);
        toast.success('روش پرداخت جدید ایجاد شد');
      }
      setIsModalOpen(false);
      resetForm();
      fetchMethods();
    } catch (error) {
      toast.error('خطا در ذخیره اطلاعات');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این روش پرداخت اطمینان دارید؟')) return;
    try {
      await deletePaymentMethod(id);
      toast.success('روش پرداخت حذف شد');
      fetchMethods();
    } catch (error) {
      toast.error('خطا در حذف روش پرداخت');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === methods.length - 1)
    ) return;

    const newMethods = [...methods];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newMethods[index], newMethods[targetIndex]] = [newMethods[targetIndex], newMethods[index]];
    setMethods(newMethods);

    try {
      await reorderPaymentMethods(
        newMethods.map((m, idx) => ({ id: m._id, order: idx }))
      );
    } catch (error) {
      toast.error('خطا در تغییر ترتیب');
      fetchMethods(); // Revert on error
    }
  };

  const openEditModal = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      label: method.label,
      description: method.description || '',
      icon: method.icon || '',
      isActive: method.isActive
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingMethod(null);
    setFormData({
      name: '',
      label: '',
      description: '',
      icon: '',
      isActive: true
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c9a896] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-[#4a3f3a]">مدیریت روش‌های پرداخت</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[#4a3f3a] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#3a332f]"
        >
          <Icon name="plus" size={18} />
          افزودن روش جدید
        </button>
      </div>

      <div className="rounded-2xl border border-[#c9a896]/20 bg-white shadow-sm">
        {methods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#4a3f3a]/60">
            <Icon name="credit-card" size={48} className="mb-4 opacity-20" />
            <p>هیچ روش پرداختی تعریف نشده است</p>
          </div>
        ) : (
          <div className="divide-y divide-[#c9a896]/10">
            {methods.map((method, index) => (
              <div key={method._id} className="flex items-center justify-between p-4 transition-colors hover:bg-[#f8f5f2]/50">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="text-[#4a3f3a]/40 hover:text-[#c9a896] disabled:opacity-20"
                    >
                      <Icon name="chevron-up" size={16} />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === methods.length - 1}
                      className="text-[#4a3f3a]/40 hover:text-[#c9a896] disabled:opacity-20"
                    >
                      <Icon name="chevron-down" size={16} />
                    </button>
                  </div>
                  
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f8f5f2] text-2xl">
                    {method.icon || '💳'}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#4a3f3a]">{method.label}</h3>
                      <span className="text-xs text-[#4a3f3a]/50">({method.name})</span>
                      {!method.isActive && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">غیرفعال</span>
                      )}
                    </div>
                    {method.description && (
                      <p className="text-sm text-[#4a3f3a]/60">{method.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(method)}
                    className="rounded-lg p-2 text-[#4a3f3a]/60 hover:bg-[#f8f5f2] hover:text-[#c9a896]"
                  >
                    <Icon name="edit" size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(method._id)}
                    className="rounded-lg p-2 text-[#4a3f3a]/60 hover:bg-red-50 hover:text-red-500"
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-[#4a3f3a]">
                {editingMethod ? 'ویرایش روش پرداخت' : 'افزودن روش پرداخت'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#4a3f3a]/40 hover:text-[#4a3f3a]">
                <Icon name="x" size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4a3f3a]">عنوان نمایشی</label>
                  <input
                    type="text"
                    required
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="مثال: پرداخت آنلاین"
                    className="w-full rounded-xl border border-[#c9a896]/30 px-4 py-2 focus:border-[#c9a896] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4a3f3a]">نام سیستمی (انگلیسی)</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: online"
                    className="w-full rounded-xl border border-[#c9a896]/30 px-4 py-2 focus:border-[#c9a896] focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#4a3f3a]">توضیحات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-[#c9a896]/30 px-4 py-2 focus:border-[#c9a896] focus:outline-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#4a3f3a]">آیکون (ایموجی)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="مثال: 💳"
                  className="w-full rounded-xl border border-[#c9a896]/30 px-4 py-2 focus:border-[#c9a896] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-[#c9a896] focus:ring-[#c9a896]"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-[#4a3f3a]">فعال باشد</label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-[#4a3f3a] hover:bg-[#f8f5f2]"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4a3f3a] px-6 py-2 text-sm font-semibold text-white hover:bg-[#3a332f]"
                >
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
