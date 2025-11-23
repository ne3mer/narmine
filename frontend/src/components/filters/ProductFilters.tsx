'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/icons/Icon';
import { X, ChevronDown } from 'lucide-react';

type FilterState = {
  platforms: string[];
  genres: string[];
  regions: string[];
  priceRange: { min: number; max: number };
  safeOnly: boolean;
  sort: string;
};

const PLATFORMS = ['PS4', 'PS5', 'Xbox', 'PC', 'Nintendo Switch'];
const GENRES = ['Action', 'Adventure', 'RPG', 'Sports', 'Racing', 'Fighting', 'Shooter', 'Strategy', 'Simulation'];
const REGIONS = ['R1', 'R2', 'R3', 'US', 'EU', 'JP'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'oldest', label: 'قدیمی‌ترین' },
  { value: 'price-low', label: 'قیمت: کم به زیاد' },
  { value: 'price-high', label: 'قیمت: زیاد به کم' },
  { value: 'name', label: 'نام: الفبایی' }
];

type ProductFiltersProps = {
  activeFiltersCount?: number;
  onClearFilters?: () => void;
  inline?: boolean;
};

export function ProductFilters({ activeFiltersCount, onClearFilters, inline = false }: ProductFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    platforms: [],
    genres: [],
    regions: [],
    priceRange: { min: 0, max: 10000000 },
    safeOnly: false,
    sort: 'newest'
  });

  useEffect(() => {
    const platforms = params?.get('platforms')?.split(',').filter(Boolean) || [];
    const genres = params?.get('genres')?.split(',').filter(Boolean) || [];
    const regions = params?.get('regions')?.split(',').filter(Boolean) || [];
    const minPrice = params?.get('minPrice') ? Number(params.get('minPrice')) : 0;
    const maxPrice = params?.get('maxPrice') ? Number(params.get('maxPrice')) : 10000000;
    const safeOnly = params?.get('safeOnly') === 'true';
    const sort = params?.get('sort') || 'newest';

    setFilters({
      platforms,
      genres,
      regions,
      priceRange: { min: minPrice, max: maxPrice },
      safeOnly,
      sort
    });
  }, [params]);

  const updateURL = (newFilters: FilterState) => {
    const searchParams = new URLSearchParams();

    if (newFilters.platforms.length > 0) {
      searchParams.set('platforms', newFilters.platforms.join(','));
    }
    if (newFilters.genres.length > 0) {
      searchParams.set('genres', newFilters.genres.join(','));
    }
    if (newFilters.regions.length > 0) {
      searchParams.set('regions', newFilters.regions.join(','));
    }
    if (newFilters.priceRange.min > 0) {
      searchParams.set('minPrice', newFilters.priceRange.min.toString());
    }
    if (newFilters.priceRange.max < 10000000) {
      searchParams.set('maxPrice', newFilters.priceRange.max.toString());
    }
    if (newFilters.safeOnly) {
      searchParams.set('safeOnly', 'true');
    }
    if (newFilters.sort !== 'newest') {
      searchParams.set('sort', newFilters.sort);
    }

    const query = params?.get('q');
    if (query) {
      searchParams.set('q', query);
    }

    const queryString = searchParams.toString();
    router.push(queryString ? `/products?${queryString}` : '/products');
  };

  const toggleFilter = (type: 'platforms' | 'genres' | 'regions', value: string) => {
    const newFilters = { ...filters };
    const list = newFilters[type];
    const index = list.indexOf(value);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(value);
    }
    updateURL(newFilters);
  };

  const handlePriceChange = (field: 'min' | 'max', value: number) => {
    const newFilters = {
      ...filters,
      priceRange: { ...filters.priceRange, [field]: value }
    };
    updateURL(newFilters);
  };

  const handleSafeToggle = () => {
    const newFilters = { ...filters, safeOnly: !filters.safeOnly };
    updateURL(newFilters);
  };

  const handleSortChange = (value: string) => {
    const newFilters = { ...filters, sort: value };
    updateURL(newFilters);
  };

  const clearFilters = () => {
    const query = params?.get('q');
    router.push(query ? `/products?q=${query}` : '/products');
  };

  const activeFilterCount =
    filters.platforms.length +
    filters.genres.length +
    filters.regions.length +
    (filters.safeOnly ? 1 : 0) +
    (filters.priceRange.min > 0 || filters.priceRange.max < 10000000 ? 1 : 0);

  const filterControls = (
    <div className={`space-y-6 ${inline ? 'max-h-[70vh] overflow-y-auto pr-1' : 'max-h-[70vh] overflow-y-auto'}`}>
      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">مرتب‌سازی</label>
        <select
          value={filters.sort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Icon name="game" size={18} />
            پلتفرم
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((platform) => (
            <button
              key={platform}
              onClick={() => toggleFilter('platforms', platform)}
              className={`rounded-2xl border px-4 py-2 text-xs font-semibold transition ${
                filters.platforms.includes(platform)
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Icon name="sparkles" size={18} />
            ژانر
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => toggleFilter('genres', genre.toLowerCase())}
              className={`rounded-2xl border px-3 py-1.5 text-xs font-semibold transition ${
                filters.genres.includes(genre.toLowerCase())
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Icon name="globe" size={18} />
            منطقه
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((region) => (
            <button
              key={region}
              onClick={() => toggleFilter('regions', region)}
              className={`rounded-2xl border px-3 py-1.5 text-xs font-semibold transition ${
                filters.regions.includes(region)
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-3 block text-sm font-bold text-slate-700">بازه قیمت (تومان)</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500">حداقل</span>
            <input
              type="number"
              value={filters.priceRange.min}
              onChange={(e) => handlePriceChange('min', Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500">حداکثر</span>
            <input
              type="number"
              value={filters.priceRange.max}
              onChange={(e) => handlePriceChange('max', Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <div>
          <p className="text-sm font-bold text-slate-700">فقط Safe Account</p>
          <p className="text-xs text-slate-500">نمایش نتایج دارای گارانتی ضد بن</p>
        </div>
        <button
          onClick={handleSafeToggle}
          className={`relative h-6 w-11 rounded-full transition ${filters.safeOnly ? 'bg-emerald-500' : 'bg-slate-300'}`}
        >
          <span
            className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white transition ${
              filters.safeOnly ? 'left-6' : 'left-1'
            }`}
          />
        </button>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Icon name="filter" size={18} />
            تمام فیلترها
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
            >
              <X size={14} />
              پاک کردن همه
            </button>
          )}
        </div>
        {filterControls}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50"
      >
        <Icon name="filter" size={18} />
        <span>فیلترها</span>
        {activeFilterCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-2xl md:left-auto md:w-[600px]">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-black text-slate-900">
                <Icon name="filter" size={20} />
                فیلترها و مرتب‌سازی
              </h3>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                  >
                    <X size={14} />
                    پاک کردن همه
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="rounded-xl p-1.5 transition hover:bg-slate-100">
                  <X size={18} className="text-slate-600" />
                </button>
              </div>
            </div>
            {filterControls}
          </div>
        </>
      )}
    </div>
  );
}
