'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { API_BASE_URL, adminHeaders, ADMIN_API_KEY } from '@/lib/api';
import { ProductRow } from '@/types/admin';
import { Icon } from '@/components/icons/Icon';

const parseList = (value: string) =>
  value.split(',').map((entry) => entry.trim()).filter(Boolean);

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/games`);
      if (!response.ok) {
        throw new Error('خطا در دریافت لیست محصولات');
      }
      const json = await response.json();
      setProducts(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'دریافت اطلاعات با مشکل مواجه شد.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const updateProductDraft = (id: string, field: keyof ProductRow, value: string | boolean) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id !== id) return product;
        if (field === 'basePrice') {
          return { ...product, basePrice: Number(value) };
        }
        if (field === 'regionOptions' || field === 'tags' || field === 'genre') {
          return { ...product, [field]: parseList(String(value)) };
        }


        return { ...product, [field]: value as ProductRow[keyof ProductRow] };
      })
    );
  };

  const saveExistingProduct = async (productId: string) => {
    if (!ADMIN_API_KEY) {
      setStatusMessage('برای ویرایش لازم است کلید ادمین را تنظیم کنید.');
      return;
    }

    const product = products.find((item) => item.id === productId);
    if (!product) return;

    const payload = {
      title: product.title,
      slug: product.slug,
      description: product.description,
      genre: product.genre,
      platform: product.platform,
      regionOptions: product.regionOptions,
      basePrice: product.basePrice,

      coverUrl: product.coverUrl,
      tags: product.tags
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/games/${productId}`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error('ویرایش محصول با مشکل مواجه شد');
      }
      setStatusMessage(`تغییرات ${product.title} ذخیره شد.`);
      await fetchProducts();
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'خطا در ذخیره محصول');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!ADMIN_API_KEY) {
      setStatusMessage('کلید ادمین تعریف نشده است.');
      return;
    }

    if (!confirm('آیا از حذف این محصول اطمینان دارید؟')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/games/${productId}`, {
        method: 'DELETE',
        headers: adminHeaders()
      });
      if (!response.ok) {
        throw new Error('حذف محصول انجام نشد');
      }
      setStatusMessage('محصول حذف شد.');
      await fetchProducts();
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'خطا در حذف محصول');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">لیست محصولات</h1>
          <p className="text-sm text-slate-500 mt-1">مدیریت و ویرایش محصولات موجود</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 sm:px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 hover:scale-105"
          >
            <Icon name="plus" size={16} />
            <span className="hidden sm:inline">افزودن محصول جدید</span>
            <span className="sm:hidden">جدید</span>
          </Link>
          <button
            onClick={fetchProducts}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition active:bg-slate-100"
          >
            <Icon name="refresh" size={16} />
            <span className="hidden sm:inline">بروزرسانی</span>
          </button>
        </div>
      </header>

      {statusMessage && (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {statusMessage}
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div key={product.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
              <div className="flex items-start gap-4">
                {/* Cover Image */}
                {product.coverUrl && (
                  <div className="relative h-24 w-24 flex-shrink-0 rounded-xl overflow-hidden border border-slate-200">
                    <img src={product.coverUrl} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="flex-1 grid gap-4 md:grid-cols-12">
                  {/* Basic Info */}
                  <div className="md:col-span-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <label className="block">
                          <span className="text-xs text-slate-500 mb-1 block">نام محصول</span>
                          <input
                            value={product.title}
                            onChange={(e) => updateProductDraft(product.id, 'title', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                          />
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-1 flex-shrink-0">
                        {product.featured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                            <Icon name="star" size={12} />
                            ویژه
                          </span>
                        )}
                        {product.onSale && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700">
                            تخفیف
                          </span>
                        )}
                        {product.rating && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-700">
                            <Icon name="star" size={12} />
                            {product.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <label className="block">
                      <span className="text-xs text-slate-500 mb-1 block">اسلاگ</span>
                      <input
                        value={product.slug}
                        onChange={(e) => updateProductDraft(product.id, 'slug', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="text-slate-500">پلتفرم:</span>
                      <span className="font-semibold text-slate-700">{product.platform}</span>
                      {product.genre.length > 0 && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">ژانر:</span>
                          <span className="font-semibold text-slate-700">{product.genre.slice(0, 2).join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="md:col-span-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-xs text-slate-500 mb-1 block">قیمت پایه</span>
                        <input
                          type="number"
                          value={product.basePrice}
                          onChange={(e) => updateProductDraft(product.id, 'basePrice', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs text-slate-500 mb-1 block">پلتفرم</span>
                        <input
                          value={product.platform}
                          onChange={(e) => updateProductDraft(product.id, 'platform', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                        />
                      </label>
                    </div>
                    <label className="block">
                      <span className="text-xs text-slate-500 mb-1 block">مناطق</span>
                      <input
                        value={product.regionOptions.join(', ')}
                        onChange={(e) => updateProductDraft(product.id, 'regionOptions', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-3 flex flex-col justify-between gap-3">
                    
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition"
                      >
                        <Icon name="edit" size={14} />
                        ویرایش
                      </Link>
                      <button
                        onClick={() => saveExistingProduct(product.id)}
                        className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition"
                      >
                        <Icon name="save" size={14} />
                        ذخیره
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition"
                        title="حذف"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              هنوز محصولی ثبت نشده است.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
