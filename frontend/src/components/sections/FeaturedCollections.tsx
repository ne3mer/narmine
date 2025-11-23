'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

type Collection = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  color: string;
};

const collections: Collection[] = [
  {
    id: '1',
    title: 'سرویس روتختی',
    subtitle: 'کیفیت و زیبایی در هر جزئیات',
    href: '/products?type=bedding',
    image: '/images/collections/bedding.jpg',
    color: '#e8d5d0'
  },
  {
    id: '2',
    title: 'بالش‌های طبی',
    subtitle: 'خوابی راحت و بدون درد',
    href: '/products?type=pillow',
    image: '/images/collections/pillows.jpg',
    color: '#c9a896'
  },
  {
    id: '3',
    title: 'پتو و ملحفه',
    subtitle: 'گرمای دلنشین شب‌های زمستان',
    href: '/products?type=blanket',
    image: '/images/collections/blankets.jpg',
    color: '#f8f5f2'
  }
];

export function FeaturedCollections() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium tracking-widest text-[#c9a896] uppercase">کلکشن‌های ویژه</p>
          <h2 className="font-serif text-4xl font-bold text-[#4a3f3a] md:text-5xl" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
            انتخاب بر اساس نیاز شما
          </h2>
        </div>

        {/* Collections Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {collections.map((collection, index) => (
            <Link
              key={collection.id}
              href={collection.href}
              className="group relative overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-500 hover:shadow-2xl"
              onMouseEnter={() => setHoveredId(collection.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <div 
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundColor: collection.color }}
                >
                  {/* Placeholder for image - replace with actual images */}
                  <div className="flex h-full items-center justify-center text-6xl opacity-20">
                    🛏️
                  </div>
                </div>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
                <h3 className="mb-2 font-serif text-2xl font-bold" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                  {collection.title}
                </h3>
                <p className="mb-4 text-sm text-white/80 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  {collection.subtitle}
                </p>
                <div className="inline-flex items-center gap-2 text-sm font-semibold opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span>مشاهده محصولات</span>
                  <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Hover Border Effect */}
              <div 
                className="absolute inset-0 rounded-3xl border-2 border-[#c9a896] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ pointerEvents: 'none' }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
