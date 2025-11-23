'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/icons/Icon';
import { X } from 'lucide-react';

export function ActiveFilters() {
  const params = useSearchParams();
  const router = useRouter();

  const platforms = params?.get('platforms')?.split(',').filter(Boolean) || [];
  const genres = params?.get('genres')?.split(',').filter(Boolean) || [];
  const regions = params?.get('regions')?.split(',').filter(Boolean) || [];
  const minPrice = params?.get('minPrice');
  const maxPrice = params?.get('maxPrice');
  const safeOnly = params?.get('safeOnly') === 'true';

  const removeFilter = (type: string, value?: string) => {
    const searchParams = new URLSearchParams(params?.toString());
    
    if (type === 'platforms') {
      const newPlatforms = platforms.filter(p => p !== value);
      if (newPlatforms.length > 0) {
        searchParams.set('platforms', newPlatforms.join(','));
      } else {
        searchParams.delete('platforms');
      }
    } else if (type === 'genres') {
      const newGenres = genres.filter(g => g !== value);
      if (newGenres.length > 0) {
        searchParams.set('genres', newGenres.join(','));
      } else {
        searchParams.delete('genres');
      }
    } else if (type === 'regions') {
      const newRegions = regions.filter(r => r !== value);
      if (newRegions.length > 0) {
        searchParams.set('regions', newRegions.join(','));
      } else {
        searchParams.delete('regions');
      }
    } else if (type === 'price') {
      searchParams.delete('minPrice');
      searchParams.delete('maxPrice');
    } else if (type === 'safeOnly') {
      searchParams.delete('safeOnly');
    }
    
    router.push(`/products?${searchParams.toString()}`);
  };

  const allFilters: Array<{ type: string; label: string; value?: string }> = [
    ...platforms.map(p => ({ type: 'platforms', label: `پلتفرم: ${p}`, value: p })),
    ...genres.map(g => ({ type: 'genres', label: `ژانر: ${g}`, value: g })),
    ...regions.map(r => ({ type: 'regions', label: `منطقه: ${r}`, value: r })),
    ...(minPrice || maxPrice ? [{ type: 'price', label: `قیمت: ${minPrice || 0} - ${maxPrice || '∞'} تومان` }] : []),
    ...(safeOnly ? [{ type: 'safeOnly', label: 'فقط Safe Account' }] : [])
  ];

  if (allFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-slate-500">فیلترهای فعال:</span>
      {allFilters.map((filter, index) => (
        <button
          key={`${filter.type}-${filter.value || index}`}
          onClick={() => removeFilter(filter.type, filter.value)}
          className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
        >
          <span>{filter.label}</span>
          <X size={12} className="text-emerald-600" />
        </button>
      ))}
    </div>
  );
}

