'use client';

interface CategorySales {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

// Mock data
const MOCK_SALES: CategorySales[] = [
  { id: '1', name: 'ست‌های خواب لوکس', amount: 125000000, percentage: 65, color: 'bg-emerald-500' },
  { id: '2', name: 'سرویس روتختی و ملحفه', amount: 45000000, percentage: 25, color: 'bg-blue-500' },
  { id: '3', name: 'بالش و کوسن', amount: 15000000, percentage: 8, color: 'bg-purple-500' },
  { id: '4', name: 'اکسسوری دکوراتیو اتاق خواب', amount: 5000000, percentage: 2, color: 'bg-amber-500' },
];

export function SalesByCategoryWidget() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-6 font-bold text-slate-900">فروش بر اساس دسته‌بندی</h3>
      
      <div className="space-y-6">
        {MOCK_SALES.map((item) => (
          <div key={item.id}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{item.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{item.amount.toLocaleString('fa-IR')} تومان</span>
                <span className="text-xs text-slate-500">({item.percentage}٪)</span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div 
                className={`h-full rounded-full ${item.color}`} 
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
