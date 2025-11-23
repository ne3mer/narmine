'use client';

import { SearchBar } from '@/components/filters/SearchBar';
import { Icon } from '@/components/icons/Icon';

interface MinimalHeroProps {
  totalGames: number;
  filteredCount: number;
}

export function MinimalHero({ totalGames, filteredCount }: MinimalHeroProps) {
  return (
    <section className="relative overflow-hidden bg-white pt-20 pb-8 md:pt-24 md:pb-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-12">
        <div className="flex flex-col gap-6 md:gap-10 lg:flex-row lg:items-end lg:justify-between">
          
          {/* Left: Heading & Stats */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px w-6 md:w-8 bg-slate-900"></div>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-slate-900">
                کاتالوگ محصولات
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900 md:text-7xl lg:text-8xl">
              کاوش در<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">
                دنیای خواب
              </span>
            </h1>

            <div className="flex items-center gap-6 md:gap-8 pt-2">
              <div>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">کل محصولات</p>
                <p className="text-xl md:text-2xl font-black text-slate-900">{totalGames.toLocaleString('fa-IR')}</p>
              </div>
              <div className="h-6 md:h-8 w-px bg-slate-200"></div>
              <div>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">نمایش</p>
                <p className="text-xl md:text-2xl font-black text-emerald-500">{filteredCount.toLocaleString('fa-IR')}</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-md pb-2">
            <div className="relative">
              <div className="relative rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <SearchBar />
              </div>
            </div>
            <p className="mt-3 text-right text-[10px] md:text-xs font-medium text-slate-400">
              جستجو بر اساس عنوان، منطقه یا شناسه...
            </p>
          </div>

        </div>
      </div>
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -z-10 h-[300px] w-[300px] md:h-[500px] md:w-[500px] translate-x-1/3 -translate-y-1/4 rounded-full bg-gradient-to-br from-blue-50 to-emerald-50 blur-3xl opacity-60"></div>
      <div className="absolute bottom-0 left-0 -z-10 h-[200px] w-[200px] md:h-[300px] md:w-[300px] -translate-x-1/3 translate-y-1/4 rounded-full bg-slate-50 blur-3xl"></div>
    </section>
  );
}
