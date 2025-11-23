'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import CategoryForm from '@/components/admin/categories/CategoryForm';
import { API_BASE_URL } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      const data = await res.json();
      if (data.success) {
        const found = data.data.find((c: any) => c._id === id);
        if (found) {
          setCategory(found);
        } else {
          toast.error('دسته‌بندی یافت نشد');
        }
      }
    } catch (error) {
      toast.error('خطا در دریافت اطلاعات');
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

  if (!category) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/categories"
          className="rounded-xl bg-white p-3 text-slate-500 shadow-sm transition hover:text-slate-700"
        >
          <Icon name="arrow-right" size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">ویرایش دسته‌بندی</h1>
          <p className="mt-1 text-sm text-slate-500">ویرایش اطلاعات دسته‌بندی</p>
        </div>
      </div>

      <CategoryForm initialData={category} isEditing />
    </div>
  );
}
