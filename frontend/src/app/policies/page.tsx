'use client';

import { Icon } from '@/components/icons/Icon';
import Link from 'next/link';

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
              <Icon name="file" size={14} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                قوانین و مقررات
              </span>
            </div>
            
            <h1 className="text-5xl font-black tracking-tight text-slate-900 md:text-6xl">
              سیاست‌ها و قوانین
            </h1>
            
            <p className="mt-6 text-lg text-slate-600">
              آخرین بروزرسانی: آذر ۱۴۰۳
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="space-y-12">
            
            {/* Privacy Policy */}
            <div className="rounded-3xl border border-slate-100 bg-white p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon name="shield" size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">حریم خصوصی</h2>
              </div>
              
              <div className="space-y-6 text-slate-600 leading-relaxed">
                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">جمع‌آوری اطلاعات</h3>
                  <p>
                    نرمینه خواب متعهد به حفظ حریم خصوصی کاربران خود است. اطلاعاتی که از شما جمع‌آوری می‌کنیم شامل نام، ایمیل، شماره تماس و آدرس پستی می‌شود. این اطلاعات صرفاً برای پردازش سفارشات و ارسال کالا استفاده می‌شود.
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">امنیت اطلاعات</h3>
                  <p>
                    تمامی اطلاعات شخصی شما با استفاده از پروتکل‌های امنیتی پیشرفته رمزنگاری و ذخیره می‌شود. ما هیچ‌گاه اطلاعات شما را با اشخاص ثالث به اشتراک نمی‌گذاریم مگر در موارد قانونی.
                  </p>
                </div>
              </div>
            </div>

            {/* Terms of Service */}
            <div className="rounded-3xl border border-slate-100 bg-white p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon name="file" size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">شرایط استفاده</h2>
              </div>
              
              <div className="space-y-6 text-slate-600 leading-relaxed">
                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">پذیرش شرایط</h3>
                  <p>
                    با استفاده از خدمات نرمینه خواب، شما تمامی شرایط و قوانین ذکر شده در این صفحه را می‌پذیرید.
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">مالکیت معنوی</h3>
                  <p>
                    تمامی محتوای موجود در وب‌سایت نرمینه خواب، از جمله متن، تصاویر، لوگو و طراحی، متعلق به ما بوده و محافظت شده توسط قوانین مالکیت معنوی است.
                  </p>
                </div>
              </div>
            </div>

            {/* Return Policy */}
            <div className="rounded-3xl border border-slate-100 bg-white p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Icon name="refresh" size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">سیاست بازگشت و مرجوعی</h2>
              </div>
              
              <div className="space-y-6 text-slate-600 leading-relaxed">
                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">شرایط بازگشت کالا</h3>
                  <p>
                    مشتریان گرامی می‌توانند تا ۷ روز پس از دریافت کالا، در صورت وجود نقص فنی یا مغایرت با مشخصات درج شده در سایت، اقدام به مرجوع کردن کالا نمایند.
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">شرایط پذیرش</h3>
                  <p>
                    کالا باید در بسته‌بندی اصلی خود باشد و استفاده نشده باشد. هرگونه پارگی، لکه یا بوی نامطبوع باعث عدم پذیرش مرجوعی خواهد شد.
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">روند استرداد وجه</h3>
                  <p>
                    پس از دریافت و بررسی کالای مرجوعی توسط کارشناسان ما، وجه پرداختی ظرف ۳ تا ۵ روز کاری به حساب شما بازگردانده خواهد شد.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Policy */}
            <div className="rounded-3xl border border-slate-100 bg-white p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <Icon name="credit-card" size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">سیاست پرداخت</h2>
              </div>
              
              <div className="space-y-6 text-slate-600 leading-relaxed">
                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">روش‌های پرداخت</h3>
                  <p>
                    امکان پرداخت آنلاین از طریق کلیه کارت‌های عضو شبکه شتاب فراهم است.
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">امنیت پرداخت</h3>
                  <p>
                    تمامی تراکنش‌ها از طریق درگاه‌های پرداخت امن و معتبر انجام می‌شود.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white">
                  <Icon name="message" size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">سوالی دارید؟</h2>
              </div>
              
              <p className="mb-6 text-slate-600 leading-relaxed">
                اگر سوال یا ابهامی در مورد قوانین و سیاست‌های ما دارید، تیم پشتیبانی ما آماده پاسخگویی به شما است.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/account"
                  className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
                >
                  تماس با پشتیبانی
                </Link>
                <Link
                  href="/about"
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  درباره ما
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
