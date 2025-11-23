import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';

export default function ReturnsPage() {
  const returnSteps = [
    {
      step: 1,
      title: 'درخواست بازگشت',
      description: 'از طریق پنل کاربری یا تماس با پشتیبانی',
      icon: 'phone'
    },
    {
      step: 2,
      title: 'بررسی درخواست',
      description: 'تیم ما درخواست شما را بررسی می‌کند',
      icon: 'search'
    },
    {
      step: 3,
      title: 'ارسال کالا',
      description: 'کالا را با بسته‌بندی اولیه ارسال کنید',
      icon: 'package'
    },
    {
      step: 4,
      title: 'بازگشت وجه',
      description: 'پس از تایید، وجه به حساب شما برمی‌گردد',
      icon: 'dollar'
    }
  ];

  const conditions = [
    'کالا باید در بسته‌بندی اصلی و سالم باشد',
    'حداکثر ۷ روز از تاریخ تحویل گذشته باشد',
    'کالا استفاده نشده و پلمپ باشد',
    'فاکتور خرید همراه کالا ارسال شود',
    'برچسب‌ها و لیبل‌های کالا سالم باشد'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f5f2] to-white">
      {/* Hero */}
      <section className="border-b border-[#c9a896]/20 bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="mb-3 text-sm font-medium tracking-widest text-[#8b6f47] uppercase">بازگشت کالا</p>
            <h1 className="mb-4 font-serif text-5xl font-bold text-[#4a3f3a]" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
              ضمانت بازگشت ۷ روزه
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-[#4a3f3a]/70">
              رضایت شما برای ما مهم است. در صورت عدم رضایت، کالا را بازگردانید
            </p>
          </div>
        </div>
      </section>

      {/* Return Process */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold text-[#4a3f3a]">
              فرآیند بازگشت کالا
            </h2>
            <p className="text-[#4a3f3a]/70">
              مراحل ساده برای بازگشت محصول
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {returnSteps.map((item, idx) => (
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions & Policy */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Conditions */}
            <div className="rounded-3xl border border-[#c9a896]/30 bg-white p-8 shadow-xl">
              <h3 className="mb-6 font-serif text-2xl font-bold text-[#4a3f3a]">
                شرایط بازگشت کالا
              </h3>
              <div className="space-y-4">
                {conditions.map((condition, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Icon name="check" size={20} className="mt-1 text-emerald-600 flex-shrink-0" />
                    <p className="text-[#4a3f3a]">{condition}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Refund Policy */}
            <div className="rounded-3xl border border-[#c9a896]/30 bg-gradient-to-br from-[#f8f5f2] to-white p-8 shadow-xl">
              <h3 className="mb-6 font-serif text-2xl font-bold text-[#4a3f3a]">
                بازگشت وجه
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="mb-2 font-semibold text-[#4a3f3a]">زمان بازگشت وجه</h4>
                  <p className="text-sm text-[#4a3f3a]/70">
                    پس از دریافت و بررسی کالا، حداکثر ظرف ۳ تا ۵ روز کاری وجه به حساب شما واریز می‌شود.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-[#4a3f3a]">روش بازگشت وجه</h4>
                  <p className="text-sm text-[#4a3f3a]/70">
                    وجه به همان روش پرداخت اولیه (کارت بانکی، کیف پول و...) برگشت داده می‌شود.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-[#4a3f3a]">هزینه ارسال</h4>
                  <p className="text-sm text-[#4a3f3a]/70">
                    در صورت وجود ایراد در کالا، هزینه ارسال بازگشت بر عهده فروشگاه است.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exceptions */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-8">
            <div className="mb-4 flex items-center gap-3">
              <Icon name="alert-circle" size={24} className="text-amber-600" />
              <h3 className="font-serif text-xl font-bold text-amber-900">
                موارد استثنا
              </h3>
            </div>
            <p className="mb-4 text-amber-900/80">
              کالاهای زیر قابل بازگشت نیستند:
            </p>
            <ul className="space-y-2 text-sm text-amber-900/70">
              <li>• محصولات بهداشتی و شخصی (در صورت باز شدن بسته‌بندی)</li>
              <li>• کالاهای سفارشی و شخصی‌سازی شده</li>
              <li>• محصولات تخفیف‌دار ویژه (در صورت ذکر در توضیحات)</li>
              <li>• کالاهایی که بیش از ۷ روز از تحویل آن‌ها گذشته باشد</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#c9a896]/20 bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-[#4a3f3a]">
            نیاز به کمک دارید؟
          </h2>
          <p className="mb-8 text-[#4a3f3a]/70">
            تیم پشتیبانی ما آماده راهنمایی شماست
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-full border-2 border-[#4a3f3a] bg-white px-8 py-3 font-semibold text-[#4a3f3a] transition-all hover:bg-[#4a3f3a] hover:text-white"
            >
              تماس با پشتیبانی
            </Link>
            <Link
              href="/account"
              className="rounded-full bg-gradient-to-r from-[#4a3f3a] to-[#c9a896] px-8 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              پنل کاربری
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
