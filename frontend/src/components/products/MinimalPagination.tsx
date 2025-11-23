'use client';

import { Icon } from '@/components/icons/Icon';

interface MinimalPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function MinimalPagination({ currentPage, totalPages, onPageChange }: MinimalPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Simple logic for now, can be expanded for large page counts
  const visiblePages = pages.slice(
    Math.max(0, Math.min(currentPage - 3, totalPages - 5)),
    Math.min(totalPages, Math.max(5, currentPage + 2))
  );

  return (
    <div className="flex items-center justify-center gap-2 py-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-emerald-500 hover:text-emerald-500 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-400"
      >
        <Icon name="chevron-right" size={18} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-bold transition ${
              page === currentPage
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {page.toLocaleString('fa-IR')}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-emerald-500 hover:text-emerald-500 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-400"
      >
        <Icon name="chevron-left" size={16} className="rotate-180" />
      </button>
    </div>
  );
}
