'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatToman } from '@/lib/format';
import { Icon } from '@/components/icons/Icon';

interface DiscountDesignerProps {
  basePrice: number;
  salePrice: string;
  enabled: boolean;
  onToggle: (next: boolean) => void;
  onSalePriceChange: (value: string) => void;
}

const roundPrice = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  return Math.max(0, Math.round(value / 1000) * 1000);
};

export const DiscountDesigner = ({ basePrice, salePrice, enabled, onToggle, onSalePriceChange }: DiscountDesignerProps) => {
  const numericBase = Number(basePrice) > 0 ? Number(basePrice) : 0;
  const numericSale = Number(salePrice) > 0 ? Number(salePrice) : 0;

  const derivedPercent = useMemo(() => {
    if (!enabled || numericBase <= 0 || !numericSale || numericSale >= numericBase) return 0;
    return Math.round(((numericBase - numericSale) / numericBase) * 100);
  }, [enabled, numericBase, numericSale]);

  const [percent, setPercent] = useState(derivedPercent);

  useEffect(() => {
    setPercent(derivedPercent);
  }, [derivedPercent]);

  const savings = enabled && numericBase > numericSale ? numericBase - numericSale : 0;

  const applySalePrice = (value?: number | null) => {
    if (!value || value <= 0) {
      onSalePriceChange('');
      return;
    }
    if (numericBase > 0) {
      const maxValue = numericBase - 1;
      const sanitized = Math.min(value, maxValue);
      onSalePriceChange(String(Math.max(0, sanitized)));
    } else {
      onSalePriceChange(String(Math.max(0, value)));
    }
  };

  const handlePercentChange = (nextPercent: number) => {
    setPercent(nextPercent);
    if (!numericBase || nextPercent <= 0) {
      applySalePrice(null);
      return;
    }
    const discounted = numericBase * (1 - nextPercent / 100);
    applySalePrice(roundPrice(discounted));
  };

  const handleManualSalePrice = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      onSalePriceChange('');
      return;
    }
    applySalePrice(parsed);
  };

  const handleToggleChange = (checked: boolean) => {
    onToggle(checked);
    if (!checked) {
      setPercent(0);
      onSalePriceChange('');
      return;
    }

    if (!numericBase) return;
    const defaultPrice = numericSale && numericSale < numericBase
      ? numericSale
      : roundPrice(numericBase * 0.85);
    applySalePrice(defaultPrice || numericBase);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/60 p-6 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Icon name="sparkles" size={18} className="text-rose-500" />
            طراح تخفیف محصول
          </p>
          <p className="text-xs text-slate-500 mt-1">قیمت قبل و بعد از تخفیف را با ابزار تعاملی تنظیم کنید.</p>
        </div>
        <label className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">وضعیت تخفیف</span>
          <button
            type="button"
            onClick={() => handleToggleChange(!enabled)}
            className={`relative h-8 w-14 rounded-full transition ${
              enabled ? 'bg-rose-500' : 'bg-slate-200'
            }`}
            aria-pressed={enabled}
          >
            <span
              className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition ${
                enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </label>
      </div>

      {enabled ? (
        numericBase > 0 ? (
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span>درصد تخفیف</span>
                  <span className="font-bold text-slate-600">{percent}%</span>
                </div>
                <input
                  type="range"
                  value={percent}
                  step={1}
                  min={0}
                  max={70}
                  onChange={(event) => handlePercentChange(Number(event.target.value))}
                  className="w-full accent-rose-500"
                />
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <span>0%</span>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span>70%</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <label className="text-xs font-bold text-slate-600 mb-2 block">قیمت بعد از تخفیف (تومان)</label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(event) => handleManualSalePrice(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  min={0}
                />
                <p className="mt-1 text-[11px] text-slate-400">باید کمتر از {formatToman(numericBase)} تومان باشد.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">قیمت اصلی</p>
                <p className="text-xl font-black text-slate-900">{formatToman(numericBase)}</p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-xs text-rose-500">درصد تخفیف</p>
                <p className="text-xl font-black text-rose-500">{percent}%</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs text-emerald-600">سود مشتری</p>
                <p className="text-xl font-black text-emerald-600">{formatToman(savings)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            ابتدا قیمت پایه را وارد کنید تا بتوانید تخفیف را محاسبه کنید.
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          با فعال‌سازی تخفیف، امکان تنظیم درصد و قیمت نهایی برای این محصول فراهم می‌شود.
        </div>
      )}
    </div>
  );
};
