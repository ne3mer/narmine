'use client';

import { DynamicBanner } from '@/components/banners/DynamicBanner';

export function DynamicBannersSection() {
  return (
    <section className="w-full px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <DynamicBanner page="home" />
      </div>
    </section>
  );
}
