import Link from 'next/link';
import { notFound } from 'next/navigation';
import { userOrders } from '@/data/catalog';
import { formatToman } from '@/lib/format';

export function generateStaticParams() {
  return userOrders.map((order) => ({ id: order.id }));
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = userOrders.find((entry) => entry.id === params.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-[32px] border border-slate-100 bg-white p-6 text-center shadow-lg">
          <p className="text-sm text-emerald-600">سفارش شما ثبت شد</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">ORD {order.id}</h1>
          <p className="text-sm text-slate-500">وضعیت: {order.status === 'assigned' ? 'آماده ارسال' : 'در انتظار پردازش'}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm">
              <p className="text-xs text-slate-500">تاریخ</p>
              <p className="text-lg font-semibold">{order.date}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm">
              <p className="text-xs text-slate-500">مبلغ</p>
              <p className="text-lg font-semibold">{formatToman(order.amount)} تومان</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm">
              <p className="text-xs text-slate-500">محصول</p>
              <p className="text-lg font-semibold">{order.game}</p>
            </div>
          </div>
        </section>
        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">اطلاعات ارسال</h2>
            {order.status === 'assigned' ? (
              <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p>سفارش شما آماده ارسال است و به زودی تحویل پیک می‌شود.</p>
                <p>کد رهگیری: {order.id}</p>
                <p>حمل‌کننده: پست پیشتاز</p>
                <Link href="https://t.me/" className="inline-block rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white">
                  پیگیری از طریق پشتیبانی تلگرام
                </Link>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">سفارش در صف بسته‌بندی قرار دارد و پس از آماده‌سازی برای شما ارسال می‌شود.</p>
            )}
          </article>
          <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">گام بعدی</h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-600">
              <li>۱. منتظر پیامک تأیید ارسال از طرف نرمینه خواب باشید.</li>
              <li>۲. هنگام تحویل، سلامت بسته‌بندی و کالای خواب را بررسی کنید.</li>
              <li>۳. در صورت هرگونه سوال، از همین صفحه دکمه پشتیبانی را بزنید.</li>
            </ol>
            <Link href="/products" className="mt-4 inline-block rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700">
              ادامه خرید
            </Link>
          </article>
        </section>
      </div>
    </div>
  );
}
