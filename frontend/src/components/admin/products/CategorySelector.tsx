'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { Icon } from '@/components/icons/Icon';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface CategorySelectorProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

export default function CategorySelector({ selectedCategories, onChange }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories?active=true`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id: string) => {
    if (selectedCategories.includes(id)) {
      onChange(selectedCategories.filter(c => c !== id));
    } else {
      onChange([...selectedCategories, id]);
    }
  };

  if (loading) {
    return <div className="text-sm text-slate-500">در حال بارگذاری دسته‌بندی‌ها...</div>;
  }

  if (categories.length === 0) {
    return <div className="text-sm text-slate-500">هیچ دسته‌بندی‌ای یافت نشد.</div>;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700 block mb-2">دسته‌بندی‌ها</label>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category._id);
          return (
            <button
              key={category._id}
              type="button"
              onClick={() => toggleCategory(category._id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition border ${
                isSelected
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-500 hover:text-emerald-600'
              }`}
            >
              {isSelected && <Icon name="check" size={14} />}
              {category.name}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-500 mt-1">دسته‌بندی‌های مرتبط با این محصول را انتخاب کنید</p>
    </div>
  );
}
