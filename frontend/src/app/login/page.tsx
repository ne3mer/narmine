'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL, persistAuthSession } from '@/lib/api';
import { Icon } from '@/components/icons/Icon';

function LoginForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/account';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email')?.toString().trim();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      setStatus('error');
      setMessage('ایمیل و رمز عبور الزامی است.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message ?? 'ورود ناموفق بود.');
      }

      persistAuthSession(payload?.data?.token, payload?.data?.user);
      setStatus('success');
      setMessage('ورود موفق! در حال انتقال...');
      setTimeout(() => router.push(redirectTo), 800);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'ورود با مشکل مواجه شد.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5f2] to-white px-4 py-16 md:px-8">
      <div className="mx-auto max-w-md">
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
              خوش آمدید
            </h1>
            <p className="text-sm text-[#4a3f3a]/60">به حساب کاربری خود وارد شوید</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#4a3f3a]">ایمیل</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-4 py-3 pr-12 text-[#4a3f3a] placeholder:text-[#4a3f3a]/40 focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20"
                  placeholder="your@email.com"
                />
                <Icon name="mail" size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c9a896]" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#4a3f3a]">رمز عبور</label>
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  className="w-full rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2]/30 px-4 py-3 pr-12 text-[#4a3f3a] placeholder:text-[#4a3f3a]/40 focus:border-[#c9a896] focus:outline-none focus:ring-2 focus:ring-[#c9a896]/20"
                  placeholder="••••••••"
                />
                <Icon name="lock" size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c9a896]" />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#4a3f3a]/70">
                <input type="checkbox" className="accent-[#c9a896]" name="remember" />
                مرا به خاطر بسپار
              </label>
              <Link href="/forgot-password" className="font-medium text-[#c9a896] hover:text-[#4a3f3a]">
                فراموشی رمز؟
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-[#4a3f3a] to-[#c9a896] py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  در حال ورود...
                </span>
              ) : (
                'ورود به حساب'
              )}
            </button>

            {message && (
              <div className={`rounded-xl p-3 text-center text-sm ${status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}

            <p className="text-center text-sm text-[#4a3f3a]/60">
              حساب کاربری ندارید؟{' '}
              <Link href="/register" className="font-semibold text-[#c9a896] hover:text-[#4a3f3a]">
                ثبت‌نام کنید
              </Link>
            </p>
          </form>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-[#4a3f3a]/60">
          <div className="flex items-center gap-2">
            <Icon name="shield" size={14} className="text-[#c9a896]" />
            <span>امن و مطمئن</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="lock" size={14} className="text-[#c9a896]" />
            <span>رمزنگاری شده</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#f8f5f2] to-white flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f8f5f2] border-t-[#c9a896]"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
