'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/components/icons/Icon';
import type { HeroContent } from '@/data/homeContent';
import { defaultHomeContent } from '@/data/homeContent';

type LuxuryHeroProps = {
  content?: HeroContent;
  slides?: HeroContent[];
};

export function LuxuryHero({ content = defaultHomeContent.hero, slides = defaultHomeContent.heroSlides }: LuxuryHeroProps) {
  const [scrollY, setScrollY] = useState(0);
  const heroLines = content.title.split('\n');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#f8f5f2] via-[#ffffff] to-[#e8d5d0] pb-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234a3f3a' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-20 pb-24 text-center">
        {/* Badge */}
        <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-[#c9a896]/30 bg-white/60 backdrop-blur-sm px-6 py-2 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#c9a896] animate-pulse" />
          <span className="text-xs font-medium tracking-widest text-[#8b6f47] uppercase">{content.badge}</span>
        </div>

        {/* Main Headline */}
        <h1 
          className="animate-fade-in-up delay-100 mb-6 max-w-4xl font-serif text-5xl font-bold leading-tight text-[#4a3f3a] md:text-7xl lg:text-8xl"
          style={{ 
            fontFamily: 'var(--font-vazirmatn)',
            letterSpacing: '-0.02em',
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        >
          {heroLines.map((line, idx) => (
            <span key={`${line}-${idx}`} className={idx === 1 ? 'text-[#a6785d]' : undefined}>
              {line}
              {idx !== heroLines.length - 1 && <br />}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up delay-200 mb-10 max-w-2xl text-lg leading-relaxed text-[#4a3f3a]/70 md:text-xl">
          {content.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up delay-300 flex flex-col gap-4 sm:flex-row">
          <Link
            href={content.primaryCta.href}
            className="group relative overflow-hidden rounded-full bg-[#4a3f3a] px-10 py-4 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            <span className="relative z-10">{content.primaryCta.label}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#c9a896] to-[#4a3f3a] opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
          <Link
            href={content.secondaryCta.href}
            className="rounded-full border-2 border-[#4a3f3a]/20 bg-white/60 backdrop-blur-sm px-10 py-4 text-base font-semibold text-[#4a3f3a] transition-all hover:border-[#c9a896] hover:bg-white"
          >
            {content.secondaryCta.label}
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="animate-fade-in delay-400 mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-[#4a3f3a]/60">
          {content.stats.map((stat) => (
            <div key={stat.id} className="flex items-center gap-2">
              <Icon name="check" size={18} className="text-[#a6785d]" />
              <span>{`${stat.label}: ${stat.value}`}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center gap-2 text-[#4a3f3a]/40">
          <span className="text-xs font-medium">اسکرول کنید</span>
          <Icon name="chevron-down" size={20} />
        </div>
      </div>

      {/* Decorative Elements */}
      <div 
        className="absolute top-20 right-10 h-64 w-64 rounded-full bg-[#e8d5d0]/30 blur-3xl"
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      />
      <div 
        className="absolute bottom-20 left-10 h-96 w-96 rounded-full bg-[#c9a896]/20 blur-3xl"
        style={{ transform: `translateY(${-scrollY * 0.15}px)` }}
      />
    </section>
  );
}
