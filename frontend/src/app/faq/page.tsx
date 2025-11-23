'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';

type FAQItem = {
  id: number;
  question: string;
  answer: string;
  category: string;
};

export default function FAQPage() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const faqs: FAQItem[] = [
    {
      id: 1,
      category: 'order',
      question: 'چگونه سفارش ثبت کنم؟',
      answer: 'برای ثبت سفارش، محصول مورد نظر را انتخاب کنید، به سبد خرید اضافه کنید و مراحل پرداخت را تکمیل نمایید.'
    },
    {
      id: 2,
      category: 'order',
      question: 'آیا می‌توانم سفارش خود را لغو کنم؟',
      answer: 'بله، تا قبل از ارسال کالا می‌توانید سفارش خود را از طریق پنل کاربری لغو کنید.'
    },
    {
      id: 3,
      category: 'shipping',
      question: 'مدت زمان ارسال چقدر است؟',
      answer: 'بسته به روش ارسال انتخابی، بین ۱ تا ۷ روز کاری زمان می‌برد. ارسال سریع ۱-۲ روز و ارسال عادی ۳-۵ روز کاری است.'
    },
    {
      id: 4,
      category: 'shipping',
      question: 'هزینه ارسال چقدر است؟',
      answer: 'هزینه ارسال بسته به وزن و حجم کالا متفاوت است. برای سفارش‌های بالای ۵۰۰ هزار تومان، ارسال رایگان است.'
    },
    {
      id: 5,
      category: 'payment',
      question: 'چه روش‌های پرداختی دارید؟',
      answer: 'پرداخت آنلاین با کلیه کارت‌های عضو شتاب، پرداخت در محل (برای شهرهای خاص) و پرداخت اقساطی.'
    },
    {
      id: 6,
      category: 'payment',
      question: 'آیا پرداخت امن است؟',
      answer: 'بله، تمامی پرداخت‌ها از طریق درگاه‌های معتبر بانکی و با رمزنگاری SSL انجام می‌شود.'
    },
    {
      id: 7,
      category: 'return',
      question: 'آیا می‌توانم کالا را برگردانم؟',
      answer: 'بله، تا ۷ روز پس از دریافت کالا، در صورت سالم بودن و داشتن بسته‌بندی اصلی، می‌توانید کالا را مرجوع کنید.'
    },
    {
      id: 8,
      category: 'return',
      question: 'چگونه درخواست مرجوعی ثبت کنم؟',
      answer: 'از طریق پنل کاربری، بخش سفارشات، گزینه درخواست مرجوعی را انتخاب کنید یا با پشتیبانی تماس بگیرید.'
    },
    {
      id: 9,
      category: 'product',
      question: 'محصولات اصل هستند؟',
      answer: 'بله، تمامی محصولات ما اصل و با ضمانت اصالت کالا ارائه می‌شوند.'
    },
    {
      id: 10,
      category: 'product',
      question: 'آیا گارانتی دارند؟',
      answer: 'بله، محصولات دارای گارانتی معتبر هستند. مدت گارانتی در صفحه هر محصول ذکر شده است.'
    }
  ];

  const categories = [
    { id: 'all', label: 'همه', icon: 'list' },
    { id: 'order', label: 'سفارش', icon: 'shopping-cart' },
    { id: 'shipping', label: 'ارسال', icon: 'truck' },
    { id: 'payment', label: 'پرداخت', icon: 'dollar' },
    { id: 'return', label: 'بازگشت', icon: 'refresh' },
    { id: 'product', label: 'محصولات', icon: 'package' }
  ];

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f5f2] to-white">
      {/* Hero */}
      <section className="border-b border-[#c9a896]/20 bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="mb-3 text-sm font-medium tracking-widest text-[#8b6f47] uppercase">سوالات متداول</p>
            <h1 className="mb-4 font-serif text-5xl font-bold text-[#4a3f3a]" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
              پاسخ سوالات شما
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-[#4a3f3a]/70">
              پاسخ سوالات رایج درباره خرید، ارسال و خدمات ما
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-[#c9a896]/20 bg-white px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-[#4a3f3a] to-[#c9a896] text-white shadow-lg'
                    : 'border-2 border-[#c9a896]/30 bg-white text-[#4a3f3a] hover:border-[#c9a896]'
                }`}
              >
                <Icon name={cat.icon as any} size={16} />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="overflow-hidden rounded-2xl border-2 border-[#c9a896]/30 bg-white shadow-lg transition-all hover:border-[#c9a896]"
              >
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="flex w-full items-center justify-between p-6 text-right transition-colors hover:bg-[#f8f5f2]/50"
                >
                  <h3 className="flex-1 font-serif text-lg font-bold text-[#4a3f3a]">
                    {faq.question}
                  </h3>
                  <Icon
                    name="chevron-down"
                    size={24}
                    className={`flex-shrink-0 text-[#c9a896] transition-transform ${
                      openId === faq.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {openId === faq.id && (
                  <div className="border-t border-[#c9a896]/20 bg-[#f8f5f2]/30 p-6">
                    <p className="text-[#4a3f3a]/80 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="border-t border-[#c9a896]/20 bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-[#4a3f3a]">
            پاسخ سوال خود را پیدا نکردید؟
          </h2>
          <p className="mb-8 text-[#4a3f3a]/70">
            تیم پشتیبانی ما آماده پاسخگویی به شماست
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-gradient-to-r from-[#4a3f3a] to-[#c9a896] px-8 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              تماس با پشتیبانی
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
