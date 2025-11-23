'use client';

import { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { GameFilters } from '@/components/filters/GameFilters';
import { ActiveFilters } from '@/components/filters/ActiveFilters';

interface FilterAccordionProps {
  activeFiltersCount: number;
  onClearFilters: () => void;
}

export function FilterAccordion({ activeFiltersCount, onClearFilters }: FilterAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full border-b border-slate-100 bg-white">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-12">
        
        {/* Accordion Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between py-4 md:py-6 transition hover:opacity-70"
        >
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <Icon name="filter" size={18} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-900">فیلترهای پیشرفته</span>
            </div>
            {activeFiltersCount > 0 && (
              <div className="flex h-5 w-5 md:h-6 md:min-w-6 items-center justify-center rounded-full bg-emerald-500 px-1.5 md:px-2 text-[10px] md:text-xs font-bold text-white">
                {activeFiltersCount}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            {activeFiltersCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClearFilters();
                }}
                className="text-[10px] md:text-xs font-bold text-rose-500 hover:text-rose-600 transition"
              >
                پاک کردن همه
              </button>
            )}
            <Icon 
              name="chevron-down" 
              size={20} 
              className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </div>
        </button>

        {/* Accordion Content */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pb-6 md:pb-8 space-y-6">
            <GameFilters inline />
            
            {activeFiltersCount > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">فیلترهای فعال</p>
                <ActiveFilters />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
