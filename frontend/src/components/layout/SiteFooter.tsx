import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';

export const SiteFooter = () => (
  <footer className="bg-gradient-to-b from-white to-[#f8f5f2] border-t border-[#c9a896]/20">
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-12 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a896] to-[#4a3f3a] shadow-lg">
              <span className="text-2xl text-white">ن</span>
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#4a3f3a]" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                نرمینه خواب
              </h3>
              <p className="text-xs text-[#c9a896]">Narmineh Khab</p>
            </div>
          </div>
          <p className="mb-6 max-w-sm text-sm leading-relaxed text-[#4a3f3a]/70">
            رویایی‌ترین خواب‌ها با بهترین کالای خواب ایران. کیفیت، راحتی و زیبایی در هر محصول.
          </p>
          <div className="flex gap-3">
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f5f2] text-[#4a3f3a] transition-all hover:bg-[#c9a896] hover:text-white">
              <Icon name="instagram" size={18} />
            </a>
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f5f2] text-[#4a3f3a] transition-all hover:bg-[#c9a896] hover:text-white">
              <Icon name="send" size={18} />
            </a>
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f5f2] text-[#4a3f3a] transition-all hover:bg-[#c9a896] hover:text-white">
              <Icon name="phone" size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="mb-4 font-serif text-lg font-bold text-[#4a3f3a]">دسترسی سریع</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/products" className="text-[#4a3f3a]/70 transition-colors hover:text-[#c9a896]">
                محصولات
              </Link>
            </li>
            <li>
              <Link href="/categories" className="text-[#4a3f3a]/70 transition-colors hover:text-[#c9a896]">
                دسته‌بندی‌ها
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-[#4a3f3a]/70 transition-colors hover:text-[#c9a896]">
                درباره ما
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-[#4a3f3a]/70 transition-colors hover:text-[#c9a896]">
                تماس با ما
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="mb-4 font-serif text-lg font-bold text-[#4a3f3a]">پشتیبانی</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/faq" className="text-[#4a3f3a]/70 transition-colors hover:text-[#c9a896]">
                سوالات متداول
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="text-[#4a3f3a]/70 transition-colors hover:text-[#c9a896]">
                ارسال و تحویل
              </Link>
            </li>
            <li>
              <Link href="/returns" className="text-[#4a3f3a]/70 transition-colors hover:text-[#c9a896]">
                بازگشت کالا
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-[#4a3f3a]/70 transition-colors hover:text-[#c9a896]">
                حریم خصوصی
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#c9a896]/20 pt-8 text-sm text-[#4a3f3a]/60 md:flex-row">
        <p>© 2024 نرمینه خواب. تمامی حقوق محفوظ است.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <Icon name="shield" size={16} className="text-[#c9a896]" />
            <span>پرداخت امن</span>
          </span>
          <span className="flex items-center gap-2">
            <Icon name="truck" size={16} className="text-[#c9a896]" />
            <span>ارسال سریع</span>
          </span>
        </div>
      </div>
    </div>
  </footer>
);
