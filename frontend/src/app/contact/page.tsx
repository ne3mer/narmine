'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f5f2] to-white">
      {/* Hero Section */}
      <section className="border-b border-[#c9a896]/20 bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="mb-3 text-sm font-medium tracking-widest text-[#8b6f47] uppercase">تماس با ما</p>
            <h1 className="mb-4 font-serif text-5xl font-bold text-[#4a3f3a]" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
              ما همیشه در خدمت شما هستیم
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-[#4a3f3a]/70">
              سوالات، پیشنهادات یا نیاز به راهنمایی دارید؟ تیم ما آماده پاسخگویی به شماست.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="rounded-3xl border border-[#c9a896]/30 bg-white p-8 shadow-xl">
              <h2 className="mb-6 font-serif text-2xl font-bold text-[#4a3f3a]">
                فرم تماس
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-semibold text-[#4a3f3a]">
                    نام و نام خانوادگی *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-6 py-4 text-[#4a3f3a] placeholder:text-[#4a3f3a]/40 focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20"
                    placeholder="نام خود را وارد کنید"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#4a3f3a]">
                      ایمیل *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-6 py-4 text-[#4a3f3a] placeholder:text-[#4a3f3a]/40 focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-[#4a3f3a]">
                      شماره تماس
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-6 py-4 text-[#4a3f3a] placeholder:text-[#4a3f3a]/40 focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20"
                      placeholder="09123456789"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm font-semibold text-[#4a3f3a]">
                    موضوع *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-6 py-4 text-[#4a3f3a] focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20"
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="product">سوال درباره محصولات</option>
                    <option value="order">پیگیری سفارش</option>
                    <option value="support">پشتیبانی فنی</option>
                    <option value="complaint">شکایت</option>
                    <option value="suggestion">پیشنهاد</option>
                    <option value="other">سایر موارد</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-semibold text-[#4a3f3a]">
                    پیام شما *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-6 py-4 text-[#4a3f3a] placeholder:text-[#4a3f3a]/40 focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20 resize-none"
                    placeholder="پیام خود را اینجا بنویسید..."
                  />
                </div>

                {status === 'success' && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">
                    <div className="flex items-center gap-2">
                      <Icon name="check" size={20} />
                      <p className="text-sm font-semibold">پیام شما با موفقیت ارسال شد!</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full rounded-full bg-gradient-to-r from-[#4a3f3a] to-[#c9a896] px-8 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                >
                  {status === 'loading' ? 'در حال ارسال...' : 'ارسال پیام'}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              {/* Contact Cards */}
              <div className="rounded-3xl border border-[#c9a896]/30 bg-white p-8 shadow-xl">
                <h3 className="mb-6 font-serif text-xl font-bold text-[#4a3f3a]">
                  راه‌های ارتباطی
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#f8f5f2]">
                      <Icon name="phone" size={24} className="text-[#c9a896]" />
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-semibold text-[#4a3f3a]">تلفن تماس</p>
                      <p className="text-lg font-bold text-[#4a3f3a]" dir="ltr">021-1234-5678</p>
                      <p className="text-sm text-[#4a3f3a]/60">شنبه تا پنجشنبه، ۹ صبح تا ۶ عصر</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#f8f5f2]">
                      <Icon name="mail" size={24} className="text-[#c9a896]" />
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-semibold text-[#4a3f3a]">ایمیل</p>
                      <p className="text-lg font-bold text-[#4a3f3a]">info@narmineh.com</p>
                      <p className="text-sm text-[#4a3f3a]/60">پاسخ در کمتر از ۲۴ ساعت</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#f8f5f2]">
                      <Icon name="map-pin" size={24} className="text-[#c9a896]" />
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-semibold text-[#4a3f3a]">آدرس</p>
                      <p className="text-[#4a3f3a]">تهران، خیابان ولیعصر، پلاک ۱۲۳۴</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="rounded-3xl border border-[#c9a896]/30 bg-gradient-to-br from-[#4a3f3a] to-[#c9a896] p-8 text-white shadow-xl">
                <h3 className="mb-6 font-serif text-xl font-bold">
                  ساعات کاری
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>شنبه تا چهارشنبه</span>
                    <span className="font-semibold">۹:۰۰ - ۱۸:۰۰</span>
                  </div>
                  <div className="flex justify-between">
                    <span>پنجشنبه</span>
                    <span className="font-semibold">۹:۰۰ - ۱۳:۰۰</span>
                  </div>
                  <div className="flex justify-between">
                    <span>جمعه</span>
                    <span className="font-semibold">تعطیل</span>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="rounded-3xl border border-[#c9a896]/30 bg-white p-8 shadow-xl">
                <h3 className="mb-6 font-serif text-xl font-bold text-[#4a3f3a]">
                  شبکه‌های اجتماعی
                </h3>
                
                <div className="flex gap-4">
                  <a href="#" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f5f2] text-[#4a3f3a] transition-all hover:bg-[#c9a896] hover:text-white">
                    <Icon name="instagram" size={24} />
                  </a>
                  <a href="#" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f5f2] text-[#4a3f3a] transition-all hover:bg-[#c9a896] hover:text-white">
                    <Icon name="send" size={24} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-[#c9a896]/20 bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-[#4a3f3a]">
            سوال دیگری دارید؟
          </h2>
          <p className="mb-8 text-[#4a3f3a]/70">
            صفحه سوالات متداول ما را مشاهده کنید یا به فروشگاه بازگردید
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/faq"
              className="rounded-full border-2 border-[#4a3f3a] bg-white px-8 py-3 font-semibold text-[#4a3f3a] transition-all hover:bg-[#4a3f3a] hover:text-white"
            >
              سوالات متداول
            </Link>
            <Link
              href="/products"
              className="rounded-full bg-gradient-to-r from-[#4a3f3a] to-[#c9a896] px-8 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              بازگشت به فروشگاه
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
