'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import type { HeroContent } from '@/data/homeContent';

interface HeroCarouselProps {
  slides: HeroContent[];
  autoPlayInterval?: number;
}

export function HeroCarousel({ slides, autoPlayInterval = 5000 }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, autoPlayInterval]);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <section
      className="relative w-full overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl shadow-pink-500/20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images */}
      <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[16/7] w-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {slide.image ? (
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500" />
            )}
            {/* Gradient overlay for text readability - Softer & Dreamier */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#4a0e4e]/80 via-[#4a0e4e]/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#4a0e4e]/60 via-transparent to-transparent" />
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-20 flex items-end">
        <div className="container mx-auto px-6 pb-8 sm:px-10 sm:pb-12 md:px-12 md:pb-16 lg:px-20 lg:pb-20">
          <div className="max-w-full sm:max-w-xl md:max-w-2xl space-y-4 sm:space-y-5 md:space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 backdrop-blur-xl px-4 py-1.5 sm:px-5 sm:py-2 text-white shadow-lg animate-fade-in-up">
              <div className="h-2 w-2 rounded-full bg-pink-400 animate-pulse shadow-[0_0_10px_rgba(244,114,182,0.8)]" />
              <span className="text-xs font-bold uppercase tracking-widest">
                {currentSlide.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight text-white drop-shadow-lg animate-fade-in-up delay-100">
              {currentSlide.title}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed drop-shadow-md animate-fade-in-up delay-200 max-w-full sm:max-w-md md:max-w-xl line-clamp-2 sm:line-clamp-3 font-medium">
              {currentSlide.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-4 animate-fade-in-up delay-300">
              <Link
                href={currentSlide.primaryCta.href}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-bold text-white shadow-xl shadow-pink-500/40 transition-all hover:scale-105 hover:shadow-pink-500/60 text-center"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {currentSlide.primaryCta.label}
                  <Icon name="arrow-left" size={20} className="transition-transform group-hover:-translate-x-1 hidden sm:inline" />
                </span>
              </Link>
              <Link
                href={currentSlide.secondaryCta.href}
                className="rounded-2xl border border-white/40 bg-white/10 backdrop-blur-md px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-bold text-white transition-all hover:bg-white/20 hover:border-white/60 text-center"
              >
                {currentSlide.secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Hidden on mobile */}
      <button
        onClick={prevSlide}
        className="absolute left-4 sm:left-6 md:left-8 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md p-3 sm:p-4 text-white shadow-xl transition hover:scale-110 hover:bg-white/20 hidden sm:block group"
        aria-label="Previous slide"
      >
        <Icon name="chevron-left" size={24} className="transition-transform group-hover:-translate-x-0.5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 sm:right-6 md:right-8 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md p-3 sm:p-4 text-white shadow-xl transition hover:scale-110 hover:bg-white/20 hidden sm:block group"
        aria-label="Next slide"
      >
        <Icon name="chevron-right" size={24} className="transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* Progress Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 z-30 flex -translate-x-1/2 gap-2 sm:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${
              index === currentIndex 
                ? 'w-8 sm:w-12 bg-pink-500 shadow-lg shadow-pink-500/50' 
                : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
