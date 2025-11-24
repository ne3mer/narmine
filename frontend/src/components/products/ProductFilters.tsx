'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/icons/Icon';
import { API_BASE_URL } from '@/lib/api';
import { formatToman } from '@/lib/format';

export type FilterState = {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  sort: string;
  onSale: boolean;
};

interface ProductFiltersProps {
  initialFilters?: Partial<FilterState>;
  onFilterChange: (filters: FilterState) => void;
}

export const ProductFilters = ({ initialFilters, onFilterChange }: ProductFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    minPrice: 0,
    maxPrice: 50000000, // 50M Toman max default
    sort: '-createdAt',
    onSale: false,
    ...initialFilters
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Debounce filter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(filters);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters, onFilterChange]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories?active=true`);
        if (res.ok) {
          const data = await res.json();
          setCategories(Array.isArray(data.data) ? data.data : []);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (slug: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === slug ? '' : slug
    }));
  };

  return (
    <div className="w-full space-y-6 sticky top-20 z-40">
      {/* Main Filter Bar */}
      <div className="bg-white/80 backdrop-blur-xl border border-[#c9a896]/20 rounded-3xl p-4 shadow-xl shadow-[#c9a896]/5">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          
          {/* Search Input */}
          <div className={`relative transition-all duration-300 ${isSearchFocused ? 'flex-[2]' : 'flex-1'} w-full`}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all ${
              isSearchFocused 
                ? 'bg-white border-[#c9a896] shadow-lg' 
                : 'bg-[#f8f5f2] border-transparent hover:bg-white hover:border-[#c9a896]/30'
            }`}>
              <Icon name="search" size={20} className={isSearchFocused ? 'text-[#c9a896]' : 'text-[#4a3f3a]/40'} />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="جستجو در بین محصولات..."
                className="w-full bg-transparent outline-none text-[#4a3f3a] placeholder:text-[#4a3f3a]/40 font-medium"
              />
              {filters.search && (
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                  className="p-1 hover:bg-[#c9a896]/10 rounded-full text-[#4a3f3a]/60"
                >
                  <Icon name="x" size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Actions Group */}
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {/* Sort Dropdown */}
            <div className="relative group min-w-[160px]">
              <select
                value={filters.sort}
                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                className="w-full appearance-none bg-[#f8f5f2] hover:bg-white border-2 border-transparent hover:border-[#c9a896]/30 rounded-2xl px-4 py-3 pr-10 text-sm font-bold text-[#4a3f3a] cursor-pointer transition-all outline-none"
              >
                <option value="-createdAt">جدیدترین</option>
                <option value="price">ارزان‌ترین</option>
                <option value="-price">گران‌ترین</option>
                <option value="-sold">پرفروش‌ترین</option>
                <option value="-rating">محبوب‌ترین</option>
              </select>
              <Icon name="chevron-down" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a3f3a]/60 pointer-events-none" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-2 transition-all font-bold whitespace-nowrap ${
                showAdvanced 
                  ? 'bg-[#4a3f3a] border-[#4a3f3a] text-white shadow-lg' 
                  : 'bg-[#f8f5f2] border-transparent text-[#4a3f3a] hover:bg-white hover:border-[#c9a896]/30'
              }`}
            >
              <Icon name="filter" size={18} />
              <span>فیلترها</span>
              {(filters.onSale || filters.minPrice > 0 || filters.maxPrice < 50000000) && (
                <span className="w-2 h-2 rounded-full bg-[#c9a896] animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-6 border-t border-[#c9a896]/10 pt-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar mask-gradient">
            <button
              onClick={() => handleCategoryClick('')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                filters.category === ''
                  ? 'bg-[#4a3f3a] text-white shadow-md transform scale-105'
                  : 'bg-white text-[#4a3f3a]/60 hover:bg-[#f8f5f2] hover:text-[#4a3f3a]'
              }`}
            >
              <Icon name="grid" size={16} />
              <span>همه محصولات</span>
            </button>
            
            {categories.map((cat) => (
              <button
                key={cat.id || cat._id}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  filters.category === cat.slug
                    ? 'bg-[#c9a896] text-white shadow-md transform scale-105'
                    : 'bg-white text-[#4a3f3a]/60 hover:bg-[#f8f5f2] hover:text-[#4a3f3a]'
                }`}
              >
                <span>{cat.icon || '🛏️'}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Filters Drawer */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/90 backdrop-blur-xl border border-[#c9a896]/20 rounded-3xl p-6 shadow-xl grid md:grid-cols-2 gap-8">
              
              {/* Price Range */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#4a3f3a] flex items-center gap-2">
                    <Icon name="dollar" size={18} />
                    محدوده قیمت
                  </h3>
                  <span className="text-xs font-medium text-[#4a3f3a]/60 bg-[#f8f5f2] px-3 py-1 rounded-full">
                    {formatToman(filters.minPrice)} تا {formatToman(filters.maxPrice)} تومان
                  </span>
                </div>
                
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max="50000000"
                    step="100000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-[#f8f5f2] rounded-lg appearance-none cursor-pointer accent-[#4a3f3a]"
                  />
                  <div className="flex justify-between mt-2 text-xs text-[#4a3f3a]/40 font-medium">
                    <span>ارزان‌ترین</span>
                    <span>گران‌ترین</span>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                <h3 className="font-bold text-[#4a3f3a] flex items-center gap-2">
                  <Icon name="settings" size={18} />
                  تنظیمات نمایش
                </h3>
                
                <div className="flex flex-wrap gap-4">
                  <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all flex-1 ${
                    filters.onSale 
                      ? 'border-rose-500 bg-rose-50' 
                      : 'border-transparent bg-[#f8f5f2] hover:border-[#c9a896]/30'
                  }`}>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      filters.onSale ? 'border-rose-500 bg-rose-500' : 'border-[#4a3f3a]/20'
                    }`}>
                      {filters.onSale && <Icon name="check" size={14} className="text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={filters.onSale}
                      onChange={(e) => setFilters(prev => ({ ...prev, onSale: e.target.checked }))}
                    />
                    <div>
                      <span className={`block font-bold ${filters.onSale ? 'text-rose-600' : 'text-[#4a3f3a]'}`}>فقط تخفیف‌دارها</span>
                      <span className="text-xs text-[#4a3f3a]/60">نمایش کالاهای دارای تخفیف ویژه</span>
                    </div>
                  </label>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
