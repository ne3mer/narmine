import Link from 'next/link';
import type { BannerContent } from '@/data/marketing';
import { defaultBannerContent } from '@/data/marketing';

interface Props {
  content?: BannerContent;
}

export const CreativeBanner = ({ content = defaultBannerContent }: Props) => {
  return (
    <section className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-white via-[#f7f8fb] to-[#eceef4] p-10 text-slate-900 shadow-[0_45px_100px_rgba(15,23,42,0.12)]">
      <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white blur-3xl" />
      <div className="absolute bottom-0 left-8 hidden h-32 w-32 rotate-12 rounded-3xl border border-white/70 sm:block" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm text-[#0a84ff]">{content.subtitle}</p>
          <h3 className="text-3xl font-black leading-tight text-slate-900">{content.title}</h3>
          <p className="max-w-xl text-sm text-slate-600">{content.description}</p>
          <div className="flex flex-wrap gap-3 text-xs">
            {content.perks.map((item) => (
              <span key={item} className="rounded-full border border-[#d1d1d6] bg-white px-4 py-2 text-slate-700">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="relative flex h-48 w-full max-w-sm flex-col justify-between rounded-3xl border border-[#e1e1e6] bg-white p-6 text-sm shadow-lg">
          <div>
            <p className="text-[#0a84ff]">{content.priceLabel}</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{content.priceValue}</p>
            <p className="text-xs text-slate-500">{content.badge}</p>
          </div>
          <Link href={content.ctaHref} className="rounded-2xl bg-[#0a84ff] px-5 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-[#0071e3]">
            {content.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
};
