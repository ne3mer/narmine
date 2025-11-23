'use client';

import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import CategoryForm from '@/components/admin/categories/CategoryForm';

export default function NewCategoryPage() {
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
          <h1 className="text-2xl font-black text-slate-900">دسته‌بندی جدید</h1>
          <p className="mt-1 text-sm text-slate-500">ایجاد دسته‌بندی جدید برای محصولات</p>
        </div>
      </div>

      <CategoryForm />
    </div>
  );
}
