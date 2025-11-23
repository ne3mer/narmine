import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';

export default function ShippingPage() {
  const shippingMethods = [
    {
      id: 1,
      name: 'ارسال عادی',
      duration: '۳ تا ۵ روز کاری',
      cost: '۳۵,۰۰۰ تومان',
      description: 'ارسال استاندارد با پست پیشتاز',
      features: ['پیگیری آنلاین', 'بیمه کالا', 'بسته‌بندی استاندارد']
    },
    {
      id: 2,
      name: 'ارسال سریع',
      duration: '۱ تا ۲ روز کاری',
      cost: '۷۵,۰۰۰ تومان',
      description: 'ارسال سریع با پیک موتوری یا باربری',
      features: ['پیگیری آنلاین', 'بیمه کالا', 'بسته‌بندی ویژه', 'تحویل درب منزل']
    },
    {
      id: 3,
      name: 'ارسال رایگان',
      duration: '۴ تا ۷ روز کاری',
      cost: 'رایگان',
      description: 'برای سفارش‌های بالای ۵۰۰ هزار تومان',
      features: ['پیگیری آنلاین', 'بیمه کالا', 'بسته‌بندی استاندارد']
    }
  ];

  const deliverySteps = [
    {
      step: 1,
      title: 'ثبت سفارش',
      description: 'سفارش شما ثبت و تایید می‌شود',
      icon: 'check'
    },
    {
      step: 2,
      title: 'آماده‌سازی',
      description: 'محصولات با دقت بسته‌بندی می‌شوند',
      icon: 'package'
    },
    {
      step: 3,
      title: 'ارسال',
      description: 'کالا به شرکت پست تحویل داده می‌شود',
      icon: 'truck'
    },
    {
      step: 4,
      title: 'تحویل',
      description: 'دریافت کالا در آدرس شما',
      icon: 'home'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f5f2] to-white">
      {/* Hero Section */}
      <section className="border-b border-[#c9a896]/20 bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="mb-3 text-sm font-medium tracking-widest text-[#8b6f47] uppercase">ارسال و تحویل</p>
            <h1 className="mb-4 font-serif text-5xl font-bold text-[#4a3f3a]" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
              روش‌های ارسال نرمینه خواب
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-[#4a3f3a]/70">
              ارسال سریع، ایمن و مطمئن به سراسر کشور با بهترین خدمات پس از فروش
            </p>
          </div>
        </div>
      </section>

      {/* Shipping Methods */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold text-[#4a3f3a]">
              روش‌های ارسال
            </h2>
            <p className="text-[#4a3f3a]/70">
              بسته به نیاز خود، یکی از روش‌های زیر را انتخاب کنید
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {shippingMethods.map((method) => (
              <div
                key={method.id}
                className="rounded-3xl border-2 border-[#c9a896]/30 bg-white p-8 shadow-lg transition-all hover:border-[#c9a896] hover:shadow-xl"
              >
                <div className="mb-6">
                  <h3 className="mb-2 font-serif text-2xl font-bold text-[#4a3f3a]">
                    {method.name}
                  </h3>
                  <p className="text-sm text-[#4a3f3a]/60">{method.duration}</p>
                </div>

                <div className="mb-6">
                  <p className="mb-2 text-sm text-[#4a3f3a]/70">{method.description}</p>
                  <p className="text-3xl font-bold text-[#c9a896]">{method.cost}</p>
                </div>

                <div className="space-y-2">
                  {method.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-[#4a3f3a]">
                      <Icon name="check" size={16} className="text-emerald-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Process */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold text-[#4a3f3a]">
              فرآیند تحویل
            </h2>
            <p className="text-[#4a3f3a]/70">
              سفارش شما از ثبت تا تحویل
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {deliverySteps.map((item, idx) => (
              <div key={item.step} className="relative">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#4a3f3a] to-[#c9a896] text-white shadow-lg">
                    <Icon name={item.icon as any} size={32} />
                  </div>
                  <div className="mb-2 inline-block rounded-full bg-[#f8f5f2] px-4 py-1 text-sm font-bold text-[#4a3f3a]">
                    مرحله {item.step}
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-bold text-[#4a3f3a]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#4a3f3a]/70">
                    {item.description}
                  </p>
                </div>
                
                {idx < deliverySteps.length - 1 && (
                  <div className="absolute right-0 top-10 hidden h-0.5 w-full bg-gradient-to-l from-[#c9a896] to-transparent md:block" style={{ right: '-50%' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage & Info */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Coverage */}
            <div className="rounded-3xl border border-[#c9a896]/30 bg-white p-8 shadow-xl">
              <h3 className="mb-6 font-serif text-2xl font-bold text-[#4a3f3a]">
                پوشش ارسال
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Icon name="check" size={20} className="mt-1 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-[#4a3f3a]">تمام نقاط کشور</p>
                    <p className="text-sm text-[#4a3f3a]/70">ارسال به تمامی شهرها و روستاها</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="check" size={20} className="mt-1 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-[#4a3f3a]">پیگیری آنلاین</p>
                    <p className="text-sm text-[#4a3f3a]/70">امکان پیگیری لحظه‌ای مرسوله</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="check" size={20} className="mt-1 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-[#4a3f3a]">بیمه کامل</p>
                    <p className="text-sm text-[#4a3f3a]/70">تمام محصولات بیمه شده هستند</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="check" size={20} className="mt-1 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-[#4a3f3a]">بسته‌بندی حرفه‌ای</p>
                    <p className="text-sm text-[#4a3f3a]/70">بسته‌بندی مقاوم و زیبا</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="rounded-3xl border border-[#c9a896]/30 bg-gradient-to-br from-[#f8f5f2] to-white p-8 shadow-xl">
              <h3 className="mb-6 font-serif text-2xl font-bold text-[#4a3f3a]">
                نکات مهم
              </h3>
              <div className="space-y-4 text-sm text-[#4a3f3a]">
                <p>
                  • زمان ارسال از روز کاری بعد از تایید سفارش محاسبه می‌شود
                </p>
                <p>
                  • هزینه ارسال بر اساس وزن و حجم محصولات محاسبه می‌گردد
                </p>
                <p>
                  • برای سفارش‌های بالای ۵۰۰ هزار تومان، ارسال رایگان است
                </p>
                <p>
                  • در صورت عدم حضور گیرنده، پیک تا ۲ بار تماس خواهد گرفت
                </p>
                <p>
                  • امکان تغییر آدرس تا قبل از ارسال کالا وجود دارد
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#c9a896]/20 bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-[#4a3f3a]">
            سوال دیگری دارید؟
          </h2>
          <p className="mb-8 text-[#4a3f3a]/70">
            با تیم پشتیبانی ما تماس بگیرید
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-full border-2 border-[#4a3f3a] bg-white px-8 py-3 font-semibold text-[#4a3f3a] transition-all hover:bg-[#4a3f3a] hover:text-white"
            >
              تماس با ما
            </Link>
            <Link
              href="/products"
              className="rounded-full bg-gradient-to-r from-[#4a3f3a] to-[#c9a896] px-8 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              شروع خرید
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
