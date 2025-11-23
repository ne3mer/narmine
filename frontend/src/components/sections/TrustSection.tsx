import { defaultHomeContent } from '@/data/homeContent';
import type { HomeTrustSignal } from '@/types/admin';

type Props = {
  signals?: HomeTrustSignal[];
};

export const TrustSection = ({ signals = defaultHomeContent.trustSignals }: Props) => (
  <section className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-8 py-12 shadow-xl">
    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100 px-3 py-1">
      <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
      <p className="text-xs font-bold uppercase tracking-wider text-purple-700">اعتماد و امنیت</p>
    </div>
    <h2 className="mt-3 text-3xl font-black text-slate-900">چرا مشتریان به ما اعتماد می‌کنند؟</h2>
    <p className="mt-2 text-slate-600">تضمین کیفیت و اصالت کالا</p>
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      {signals.map((item) => (
        <article key={item.id} className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-lg hover:border-purple-200">
          <div className="text-4xl mb-3">{item.icon}</div>
          <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</p>
        </article>
      ))}
    </div>
  </section>
);
