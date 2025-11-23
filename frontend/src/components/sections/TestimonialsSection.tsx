import Image from 'next/image';
import { defaultHomeContent } from '@/data/homeContent';
import type { HomeTestimonial } from '@/types/admin';

type Props = {
  testimonials?: HomeTestimonial[];
};

export const TestimonialsSection = ({ testimonials = defaultHomeContent.testimonials }: Props) => (
  <section className="space-y-4">
    <div className="flex flex-col gap-2">
      <p className="text-sm text-emerald-600">چند نظر واقعی</p>
      <h2 className="text-2xl font-semibold text-slate-900">مشتری‌های نرمینه خواب چه می‌گویند؟</h2>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      {testimonials.map((testimonial) => (
        <article
          key={testimonial.id}
          className={`rounded-3xl border border-slate-100 bg-white p-5 shadow-sm ${testimonial.highlight ? 'border-emerald-200 shadow-[0_15px_40px_rgba(16,185,129,0.2)]' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full">
              <Image src={testimonial.avatar} alt={testimonial.name} fill sizes="48px" className="object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{testimonial.name}</p>
              <p className="text-xs text-slate-500">{testimonial.handle}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600">{testimonial.text}</p>
        </article>
      ))}
    </div>
  </section>
);
