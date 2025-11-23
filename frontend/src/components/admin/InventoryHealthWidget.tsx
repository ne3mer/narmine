'use client';

import { Icon } from '@/components/icons/Icon';
import Link from 'next/link';

interface InventoryItem {
  id: string;
  title: string;
  sku?: string;
  stock: number;
  threshold: number;
  status: 'low_stock' | 'out_of_stock';
  coverUrl?: string;
}

// Mock data - in a real app this would come from props or API
const MOCK_ALERTS: InventoryItem[] = [
  {
    id: '1',
    title: 'DualSense Edge Controller',
    sku: 'ACC-PS5-001',
    stock: 2,
    threshold: 5,
    status: 'low_stock',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s1k.webp'
  },
  {
    id: '2',
    title: 'God of War Ragnarök - Collector\'s Edition',
    sku: 'GM-PS5-GOW-CE',
    stock: 0,
    threshold: 3,
    status: 'out_of_stock',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s1k.webp'
  },
  {
    id: '3',
    title: 'Spider-Man 2 Action Figure',
    sku: 'FIG-SM2-001',
    stock: 1,
    threshold: 5,
    status: 'low_stock',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s1k.webp'
  }
];

export function InventoryHealthWidget() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Icon name="alert" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">وضعیت موجودی</h3>
            <p className="text-xs text-slate-500">کالاهای نیازمند توجه</p>
          </div>
        </div>
        <Link 
          href="/admin/products?filter=low_stock" 
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
        >
          مدیریت انبار
        </Link>
      </div>

      <div className="space-y-4">
        {MOCK_ALERTS.map((item) => (
          <div key={item.id} className="flex items-center gap-4 rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50">
            <div className={`h-2 w-2 rounded-full ${item.status === 'out_of_stock' ? 'bg-rose-500' : 'bg-amber-500'}`} />
            
            <div className="flex-1 overflow-hidden">
              <h4 className="truncate text-sm font-bold text-slate-900">{item.title}</h4>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>SKU: {item.sku}</span>
                <span>•</span>
                <span className={item.status === 'out_of_stock' ? 'text-rose-600 font-bold' : 'text-amber-600 font-bold'}>
                  {item.status === 'out_of_stock' ? 'ناموجود' : `فقط ${item.stock} عدد مانده`}
                </span>
              </div>
            </div>

            <Link 
              href={`/admin/products/${item.id}/edit`}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
            >
              <Icon name="edit" size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
