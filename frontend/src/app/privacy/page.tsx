import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f5f2] to-white">
      {/* Hero */}
      <section className="border-b border-[#c9a896]/20 bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="mb-3 text-sm font-medium tracking-widest text-[#8b6f47] uppercase">حریم خصوصی</p>
            <h1 className="mb-4 font-serif text-5xl font-bold text-[#4a3f3a]" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
              سیاست حفظ حریم خصوصی
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-[#4a3f3a]/70">
              ما متعهد به حفظ حریم خصوصی و امنیت اطلاعات شما هستیم
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-12">
            {/* Section 1 */}
            <div className="rounded-3xl border border-[#c9a896]/30 bg-white p-8 shadow-lg">
              <h2 className="mb-4 font-serif text-2xl font-bold text-[#4a3f3a]">
                ۱. جمع‌آوری اطلاعات
              </h2>
              <div className="space-y-4 text-[#4a3f3a]/80">
                <p>
                  ما اطلاعات زیر را از شما جمع‌آوری می‌کنیم:
                </p>
                <ul className="mr-6 space-y-2">
                  <li>• اطلاعات شخصی (نام، ایمیل، شماره تماس)</li>
                  <li>• آدرس تحویل کالا</li>
                  <li>• اطلاعات پرداخت (به صورت رمزنگاری شده)</li>
                  <li>• تاریخچه سفارشات و خریدها</li>
                  <li>• اطلاعات مرورگر و دستگاه (IP، نوع مرورگر)</li>
                </ul>
              </div>
            </div>

            {/* Section 2 */}
            <div className="rounded-3xl border border-[#c9a896]/30 bg-white p-8 shadow-lg">
              <h2 className="mb-4 font-serif text-2xl font-bold text-[#4a3f3a]">
                ۲. استفاده از اطلاعات
              </h2>
              <div className="space-y-4 text-[#4a3f3a]/80">
                <p>
                  اطلاعات شما برای موارد زیر استفاده می‌شود:
                </p>
                <ul className="mr-6 space-y-2">
                  <li>• پردازش و ارسال سفارشات</li>
                  <li>• ارتباط با شما درباره سفارشات</li>
                  <li>• بهبود خدمات و تجربه کاربری</li>
                  <li>• ارسال اطلاعات محصولات جدید و تخفیف‌ها (با رضایت شما)</li>
                  <li>• پیشگیری از تقلب و سوء استفاده</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div className="rounded-3xl border border-[#c9a896]/30 bg-white p-8 shadow-lg">
              <h2 className="mb-4 font-serif text-2xl font-bold text-[#4a3f3a]">
                ۳. حفاظت از اطلاعات
              </h2>
              <div className="space-y-4 text-[#4a3f3a]/80">
                <p>
                  ما از روش‌های امنیتی پیشرفته برای حفاظت از اطلاعات شما استفاده می‌کنیم:
                </p>
                <ul className="mr-6 space-y-2">
                  <li>• رمزنگاری SSL برای انتقال داده‌ها</li>
                  <li>• ذخیره‌سازی امن در سرورهای محافظت شده</li>
                  <li>• دسترسی محدود به اطلاعات حساس</li>
                  <li>• بررسی و به‌روزرسانی مداوم امنیت</li>
                  <li>• عدم ذخیره اطلاعات کامل کارت بانکی</li>
                </ul>
              </div>
            </div>

            {/* Section 4 */}
            <div className="rounded-3xl border border-[#c9a896]/30 bg-white p-8 shadow-lg">
              <h2 className="mb-4 font-serif text-2xl font-bold text-[#4a3f3a]">
                ۴. اشتراک‌گذاری اطلاعات
              </h2>
              <div className="space-y-4 text-[#4a3f3a]/80">
                <p>
                  ما اطلاعات شما را با اشخاص ثالث به اشتراک نمی‌گذاریم، مگر در موارد زیر:
                </p>
                <ul className="mr-6 space-y-2">
                  <li>• شرکت‌های حمل و نقل (فقط برای ارسال کالا)</li>
                  <li>• درگاه‌های پرداخت (برای پردازش تراکنش‌ها)</li>
                  <li>• الزامات قانونی و درخواست مقامات قضایی</li>
                </ul>
              </div>
            </div>

            {/* Section 5 */}
            <div className="rounded-3xl border border-[#c9a896]/30 bg-white p-8 shadow-lg">
              <h2 className="mb-4 font-serif text-2xl font-bold text-[#4a3f3a]">
                ۵. کوکی‌ها
              </h2>
              <div className="space-y-4 text-[#4a3f3a]/80">
                <p>
                  ما از کوکی‌ها برای بهبود تجربه کاربری استفاده می‌کنیم:
                </p>
                <ul className="mr-6 space-y-2">
                  <li>• کوکی‌های ضروری برای عملکرد سایت</li>
                  <li>• کوکی‌های تحلیلی برای بهبود خدمات</li>
                  <li>• کوکی‌های بازاریابی (با رضایت شما)</li>
                </ul>
                <p className="mt-4">
                  شما می‌توانید کوکی‌ها را از طریق تنظیمات مرورگر خود مدیریت کنید.
                </p>
              </div>
            </div>

            {/* Section 6 */}
            <div className="rounded-3xl border border-[#c9a896]/30 bg-white p-8 shadow-lg">
              <h2 className="mb-4 font-serif text-2xl font-bold text-[#4a3f3a]">
                ۶. حقوق شما
              </h2>
              <div className="space-y-4 text-[#4a3f3a]/80">
                <p>
                  شما حقوق زیر را دارید:
                </p>
                <ul className="mr-6 space-y-2">
                  <li>• دسترسی به اطلاعات شخصی خود</li>
                  <li>• درخواست اصلاح اطلاعات نادرست</li>
                  <li>• درخواست حذف اطلاعات (در صورت امکان)</li>
                  <li>• لغو اشتراک از ایمیل‌های تبلیغاتی</li>
                  <li>• اعتراض به پردازش اطلاعات</li>
                </ul>
              </div>
            </div>

            {/* Section 7 */}
            <div className="rounded-3xl border border-[#c9a896]/30 bg-white p-8 shadow-lg">
              <h2 className="mb-4 font-serif text-2xl font-bold text-[#4a3f3a]">
                ۷. تغییرات در سیاست
              </h2>
              <div className="space-y-4 text-[#4a3f3a]/80">
                <p>
                  ما ممکن است این سیاست را به‌روزرسانی کنیم. تغییرات مهم از طریق ایمیل یا اعلان در سایت به اطلاع شما خواهد رسید.
                </p>
                <p className="text-sm">
                  آخرین به‌روزرسانی: آذر ۱۴۰۳
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="rounded-3xl border-2 border-[#c9a896] bg-gradient-to-br from-[#f8f5f2] to-white p-8">
              <h2 className="mb-4 font-serif text-2xl font-bold text-[#4a3f3a]">
                تماس با ما
              </h2>
              <p className="mb-4 text-[#4a3f3a]/80">
                در صورت هرگونه سوال یا نگرانی درباره حریم خصوصی، با ما تماس بگیرید:
              </p>
              <div className="space-y-2 text-[#4a3f3a]">
                <p>ایمیل: privacy@narmineh.com</p>
                <p>تلفن: ۰۲۱-۱۲۳۴-۵۶۷۸</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#c9a896]/20 bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-full border-2 border-[#4a3f3a] bg-white px-8 py-3 font-semibold text-[#4a3f3a] transition-all hover:bg-[#4a3f3a] hover:text-white"
            >
              تماس با ما
            </Link>
            <Link
              href="/"
              className="rounded-full bg-gradient-to-r from-[#4a3f3a] to-[#c9a896] px-8 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              بازگشت به خانه
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
