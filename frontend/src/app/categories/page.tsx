import Link from 'next/link';
import { Metadata } from 'next';
import { API_BASE_URL } from '@/lib/api';
import { Icon } from '@/components/icons/Icon';

export const metadata: Metadata = {
  title: 'دسته‌بندی‌های محصولات | نرمینه خواب',
  description: 'محصولات بر اساس دسته‌بندی',
  openGraph: {
    title: 'دسته‌بندی‌های محصولات | نرمینه خواب',
    description: 'مشاهده تمام دسته‌بندی‌های کالای خواب، سرویس‌های خواب، ملحفه و ...',
    type: 'website',
  }
};

async function getCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories?active=true`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'دسته‌بندی‌های کالای خواب',
    description: 'لیست کامل دسته‌بندی‌های کالای خواب موجود در نرمینه خواب',
    url: 'https://narminehkhab.com/categories',
    siteName: 'نرمینه خواب',
    locale: 'fa_IR',
    type: 'website',
    images: categories.map((cat: any) => ({
      url: `https://narminehkhab.com/categories/${cat.slug}`
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-emerald-600">خانه</Link>
          <Icon name="chevron-left" size={16} />
          <span className="font-bold text-slate-900">دسته‌بندی‌ها</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-black text-slate-900 md:text-4xl">
            دسته‌بندی‌های کالای خواب
          </h1>
          <p className="text-lg text-slate-600">
            کالای خواب مورد علاقه خود را در دسته‌بندی‌های زیر پیدا کنید
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category: any) => (
            <Link
              key={category._id}
              href={`/categories/${category.slug}`}
              className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-4xl transition-transform group-hover:scale-110 group-hover:bg-emerald-100">
                {category.icon}
              </div>
              
              <h2 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-emerald-600">
                {category.name}
              </h2>
              
              <p className="mb-4 line-clamp-2 text-sm text-slate-500">
                {category.description || `مجموعه بهترین محصولات ${category.name} برای اتاق خواب`}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                  {category.productCount} محصول
                </span>
                <span className="flex items-center gap-1 font-bold text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
                  مشاهده
                  <Icon name="arrow-left" size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Icon name="search" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">دسته‌بندی یافت نشد</h3>
            <p className="mt-2 text-slate-500">هنوز هیچ دسته‌بندی ایجاد نشده است.</p>
          </div>
        )}
      </div>
    </div>
  );
}
