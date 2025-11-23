'use client';

import { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import type { ProductRequest } from '@/lib/api/product-requests';

interface Props {
  requests: ProductRequest[];
  onDelete: (id: string) => void;
}

export function ProductRequestsList({ requests, onDelete }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این درخواست اطمینان دارید؟')) return;
    
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'تایید شده';
      case 'rejected': return 'رد شده';
      case 'completed': return 'انجام شده';
      default: return 'در انتظار بررسی';
    }
  };

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-400">
          <Icon name="mail" size={24} />
        </div>
        <p className="text-slate-500">هیچ درخواستی ثبت نشده است</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div 
          key={request.id} 
          className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h3 className="font-bold text-slate-900">{request.productName}</h3>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStatusColor(request.status)}`}>
                  {getStatusLabel(request.status)}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Icon name="layers" size={14} />
                  <span>{request.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="package" size={14} />
                  <span>{request.brand}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="calendar" size={14} />
                  <span>{new Date(request.createdAt).toLocaleDateString('fa-IR')}</span>
                </div>
              </div>

              {request.adminNote && (
                <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs">
                  <span className="font-bold text-slate-700">پاسخ ادمین: </span>
                  <span className="text-slate-600">{request.adminNote}</span>
                </div>
              )}
            </div>

            {request.status === 'pending' && (
              <button
                onClick={() => handleDelete(request.id)}
                disabled={deletingId === request.id}
                className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                title="حذف درخواست"
              >
                {deletingId === request.id ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-rose-600" />
                ) : (
                  <Icon name="trash" size={20} />
                )}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
