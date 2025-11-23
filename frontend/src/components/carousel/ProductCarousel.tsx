'use client';

import { useState, useEffect, useRef } from 'react';
import { ProductCard } from '@/components/cards/ProductCard';
import type { GameCardContent } from '@/data/home';
import { Icon } from '@/components/icons/Icon';

interface GameCarouselProps {
  games: GameCardContent[];
  title?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function ProductCarousel({
  games,
  title = 'محصولات ویژه',
  autoPlay = true,
  autoPlayInterval = 5000
}: GameCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate how many items to show based on screen size
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width < 640) return 1; // sm
    if (width < 1024) return 2; // lg
    if (width < 1280) return 3; // xl
    return 4; // 2xl
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());
  const maxIndex = Math.max(0, games.length - itemsPerView);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isPaused || games.length <= itemsPerView) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) {
          return 0; // Loop back to start
        }
        return prev + 1;
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, isPaused, maxIndex, itemsPerView, games.length, autoPlayInterval]);

  // Scroll to current index
  useEffect(() => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.children[0]?.clientWidth || 0;
      const gap = 16; // gap-4 = 1rem = 16px
      const scrollPosition = currentIndex * (cardWidth + gap);
      
      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  if (games.length === 0) return null;

  return (
    <div className="relative w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900">{title}</h2>
        {games.length > itemsPerView && (
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrev}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="rounded-full bg-white border-2 border-slate-200 p-2 hover:bg-emerald-50 hover:border-emerald-500 transition-all shadow-sm"
              aria-label="قبلی"
            >
              <Icon name="chevron-right" size={20} className="text-slate-700" />
            </button>
            <button
              onClick={goToNext}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="rounded-full bg-white border-2 border-slate-200 p-2 hover:bg-emerald-50 hover:border-emerald-500 transition-all shadow-sm"
              aria-label="بعدی"
            >
              <Icon name="chevron-left" size={20} className="text-slate-700" />
            </button>
          </div>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {games.map((game) => (
            <div
              key={game.id}
              className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] lg:w-[380px] xl:w-[400px]"
            >
              <ProductCard game={game} />
            </div>
          ))}
        </div>

        {/* Gradient Overlays */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />
      </div>

      {/* Dots Indicator */}
      {games.length > itemsPerView && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(games.length / itemsPerView) }).map((_, index) => {
            const startIndex = index * itemsPerView;
            const isActive = currentIndex >= startIndex && currentIndex < startIndex + itemsPerView;
            
            return (
              <button
                key={index}
                onClick={() => goToSlide(startIndex)}
                className={`h-2 rounded-full transition-all ${
                  isActive
                    ? 'w-8 bg-emerald-500'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`برو به اسلاید ${index + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
