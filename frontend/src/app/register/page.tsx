'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, persistAuthSession } from '@/lib/api';
import { Icon } from '@/components/icons/Icon';

export default function RegisterPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const phone = formData.get('phone')?.toString().trim();
    const telegram = formData.get('telegram')?.toString().trim();
    const password = formData.get('password')?.toString();
    const passwordConfirm = formData.get('passwordConfirm')?.toString();

    if (!name || !email || !password || !passwordConfirm) {
      setStatus('error');
      setMessage('تمام فیلدهای ضروری را تکمیل کنید.');
      return;
    }

    if (password !== passwordConfirm) {
      setStatus('error');
      setMessage('رمز عبور و تکرار آن یکسان نیست.');
      return;
    }

    const payload = {
      name,
      email,
      phone: phone || undefined,
      telegram: telegram || undefined,
      password,
      passwordConfirm
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message ?? 'ثبت نام با خطا روبه‌رو شد.');
      }

      persistAuthSession(data?.data?.token, data?.data?.user);
      setStatus('success');
      setMessage('ثبت نام انجام شد! در حال انتقال به حساب کاربری.');
      setTimeout(() => router.push('/account'), 1000);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'ثبت نام انجام نشد.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5f2] to-white px-4 py-16 md:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a896] to-[#4a3f3a] shadow-lg">
              <span className="text-2xl text-white">ن</span>
            </div>
            <div className="text-right">
              <h2 className="font-serif text-2xl font-bold text-[#4a3f3a]" style={{ fontFamily: 'var(--font-playfair)' }}>
                نرمینه خواب
              </h2>
              <p className="text-xs text-[#c9a896]">Narmineh Khab</p>
            </div>
          </Link>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-[#c9a896]/20 bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h1 className="mb-2 font-serif text-3xl font-bold text-[#4a3f3a]" style={{ fontFamily: 'var(--font-playfair)' }}>
              عضویت در نرمینه خواب
            </h1>
            <p className="text-sm text-[#4a3f3a]/60">حساب کاربری خود را ایجاد کنید</p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#4a3f3a]">نام و نام خانوادگی</label>
              <input
                name="name"
                className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-4 py-3 text-[#4a3f3a] placeholder:text-[#4a3f3a]/40 focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20"
                placeholder="مثلاً سارا احمدی"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#4a3f3a]">ایمیل</label>
              <input
                type="email"
                name="email"
                className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-4 py-3 text-[#4a3f3a] placeholder:text-[#4a3f3a]/40 focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#4a3f3a]">شماره موبایل</label>
              <input
                name="phone"
                className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-4 py-3 text-[#4a3f3a] placeholder:text-[#4a3f3a]/40 focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20"
                placeholder="09xxxxxxxxx"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#4a3f3a]">آی‌دی تلگرام (اختیاری)</label>
              <input
                name="telegram"
                className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-4 py-3 text-[#4a3f3a] placeholder:text-[#4a3f3a]/40 focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20"
                placeholder="@narminehkhab"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#4a3f3a]">رمز عبور</label>
              <input
                type="password"
                name="password"
                className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-4 py-3 text-[#4a3f3a] placeholder:text-[#4a3f3a]/40 focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#4a3f3a]">تکرار رمز عبور</label>
              <input
                type="password"
                name="passwordConfirm"
                className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-4 py-3 text-[#4a3f3a] placeholder:text-[#4a3f3a]/40 focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20"
                placeholder="••••••••"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm text-[#4a3f3a]/70">
                <input type="checkbox" className="accent-[#c9a896]" required />
                قوانین و مقررات نرمینه خواب را می‌پذیرم
              </label>
            </div>

            <button
              type="submit"
              className="sm:col-span-2 rounded-full bg-gradient-to-r from-[#4a3f3a] to-[#c9a896] py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  در حال ساخت حساب...
                </span>
              ) : (
                'ساخت حساب کاربری'
              )}
            </button>

            {message && (
              <div className={`sm:col-span-2 rounded-xl p-3 text-center text-sm ${status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}

            <p className="sm:col-span-2 text-center text-sm text-[#4a3f3a]/60">
              قبلاً ثبت‌نام کرده‌اید؟{' '}
              <Link href="/login" className="font-semibold text-[#c9a896] hover:text-[#4a3f3a]">
                ورود به حساب
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
