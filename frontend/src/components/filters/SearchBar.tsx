'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/icons/Icon';
import { X } from 'lucide-react';

export const SearchBar = () => {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState('');
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    const initial = params?.get('q') ?? '';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(initial);
  }, [params]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const searchParams = new URLSearchParams();
    
    if (query.trim()) {
      searchParams.set('q', query.trim());
    }
    
    // Preserve other filters
    const platforms = params?.get('platforms');
    const genres = params?.get('genres');
    const regions = params?.get('regions');
    const minPrice = params?.get('minPrice');
    const maxPrice = params?.get('maxPrice');
    const safeOnly = params?.get('safeOnly');
    const sort = params?.get('sort');
    
    if (platforms) searchParams.set('platforms', platforms);
    if (genres) searchParams.set('genres', genres);
    if (regions) searchParams.set('regions', regions);
    if (minPrice) searchParams.set('minPrice', minPrice);
    if (maxPrice) searchParams.set('maxPrice', maxPrice);
    if (safeOnly) searchParams.set('safeOnly', safeOnly);
    if (sort) searchParams.set('sort', sort);
    
    const url = searchParams.toString() ? `/products?${searchParams.toString()}` : '/products';
    router.push(url);
  };

  const clearSearch = () => {
    setQuery('');
    const searchParams = new URLSearchParams();
    
    // Preserve filters but remove search
    const platforms = params?.get('platforms');
    const genres = params?.get('genres');
    const regions = params?.get('regions');
    const minPrice = params?.get('minPrice');
    const maxPrice = params?.get('maxPrice');
    const safeOnly = params?.get('safeOnly');
    const sort = params?.get('sort');
    
    if (platforms) searchParams.set('platforms', platforms);
    if (genres) searchParams.set('genres', genres);
    if (regions) searchParams.set('regions', regions);
    if (minPrice) searchParams.set('minPrice', minPrice);
    if (maxPrice) searchParams.set('maxPrice', maxPrice);
    if (safeOnly) searchParams.set('safeOnly', safeOnly);
    if (sort) searchParams.set('sort', sort);
    
    const url = searchParams.toString() ? `/products?${searchParams.toString()}` : '/products';
    router.push(url);
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-[30px] bg-white p-4 text-sm text-slate-600"
    >
      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0a84ff]">
        <Icon name="search" size={14} />
        جستجو در نرمینه خواب
      </label>
      <div className="flex items-center gap-3 rounded-2xl border border-[#e5e6eb] bg-[#f7f7fa] px-4 py-3">
        <Icon name="search" size={18} className="text-slate-500" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="نام محصول، دسته‌بندی، برند..."
          className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="rounded-lg p-1 text-slate-500 transition hover:bg-white hover:text-slate-700"
          >
            <X size={16} />
          </button>
        )}
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-[#007aff] px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#0a84ff]"
        >
          <Icon name="search" size={14} />
          جستجو
        </button>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        {['روبالشی', 'پتو', 'روتختی', 'بالش طبی'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setQuery(tag);
              setTimeout(() => {
                formRef.current?.requestSubmit();
              }, 0);
            }}
            className="rounded-full border border-[#d1d1d6] bg-white px-3 py-1.5 text-slate-600 transition hover:bg-[#f1f2f6]"
          >
            {tag}
          </button>
        ))}
      </div>
    </form>
  );
};
