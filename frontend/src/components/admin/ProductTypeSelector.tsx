'use client';

import { PRODUCT_TEMPLATES, type ProductTemplate } from '@/config/productTemplates';

interface ProductTypeSelectorProps {
  value: string;
  onChange: (type: string) => void;
}

export function ProductTypeSelector({ value, onChange }: ProductTypeSelectorProps) {
  const templates = Object.values(PRODUCT_TEMPLATES);

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors: Record<string, { border: string; bg: string; text: string; hover: string }> = {
      emerald: {
        border: isSelected ? 'border-emerald-500' : 'border-slate-200',
        bg: isSelected ? 'bg-emerald-50' : 'bg-white',
        text: isSelected ? 'text-emerald-700' : 'text-slate-600',
        hover: 'hover:border-emerald-300 hover:bg-emerald-50/50'
      },
      purple: {
        border: isSelected ? 'border-purple-500' : 'border-slate-200',
        bg: isSelected ? 'bg-purple-50' : 'bg-white',
        text: isSelected ? 'text-purple-700' : 'text-slate-600',
        hover: 'hover:border-purple-300 hover:bg-purple-50/50'
      },
      blue: {
        border: isSelected ? 'border-blue-500' : 'border-slate-200',
        bg: isSelected ? 'bg-blue-50' : 'bg-white',
        text: isSelected ? 'text-blue-700' : 'text-slate-600',
        hover: 'hover:border-blue-300 hover:bg-blue-50/50'
      },
      indigo: {
        border: isSelected ? 'border-indigo-500' : 'border-slate-200',
        bg: isSelected ? 'bg-indigo-50' : 'bg-white',
        text: isSelected ? 'text-indigo-700' : 'text-slate-600',
        hover: 'hover:border-indigo-300 hover:bg-indigo-50/50'
      },
      pink: {
        border: isSelected ? 'border-pink-500' : 'border-slate-200',
        bg: isSelected ? 'bg-pink-50' : 'bg-white',
        text: isSelected ? 'text-pink-700' : 'text-slate-600',
        hover: 'hover:border-pink-300 hover:bg-pink-50/50'
      },
      cyan: {
        border: isSelected ? 'border-cyan-500' : 'border-slate-200',
        bg: isSelected ? 'bg-cyan-50' : 'bg-white',
        text: isSelected ? 'text-cyan-700' : 'text-slate-600',
        hover: 'hover:border-cyan-300 hover:bg-cyan-50/50'
      }
    };

    return colors[color] || colors.emerald;
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-bold text-slate-900 mb-2">
          نوع محصول
        </label>
        <p className="text-xs text-slate-500 mb-3">
          نوع محصولی که می‌خواهید اضافه کنید را انتخاب کنید
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {templates.map((template) => {
          const isSelected = value === template.id;
          const colorClasses = getColorClasses(template.color, isSelected);

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onChange(template.id)}
              className={`
                relative rounded-2xl border-2 p-4 text-right transition-all duration-200
                ${colorClasses.border}
                ${colorClasses.bg}
                ${colorClasses.hover}
                ${isSelected ? 'ring-2 ring-offset-2 ring-' + template.color + '-500/20 scale-105' : ''}
              `}
            >
              {/* Icon */}
              <div className="text-4xl mb-2">{template.icon}</div>

              {/* Name */}
              <div className={`font-bold text-base mb-1 ${colorClasses.text}`}>
                {template.name}
              </div>

              {/* Description */}
              <div className="text-xs text-slate-500">
                {template.description}
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 left-2">
                  <div className={`w-6 h-6 rounded-full bg-${template.color}-500 flex items-center justify-center`}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-1 mt-3">
                {template.inventory.trackInventory && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    📦 موجودی
                  </span>
                )}
                {template.shipping.requiresShipping && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    🚚 ارسال
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected template info */}
      {value && PRODUCT_TEMPLATES[value] && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{PRODUCT_TEMPLATES[value].icon}</div>
            <div className="flex-1">
              <div className="font-bold text-blue-900 mb-1">
                {PRODUCT_TEMPLATES[value].name} انتخاب شد
              </div>
              <div className="text-sm text-blue-700">
                {PRODUCT_TEMPLATES[value].inventory.trackInventory && '✓ موجودی track می‌شود'}
                {PRODUCT_TEMPLATES[value].inventory.trackInventory && PRODUCT_TEMPLATES[value].shipping.requiresShipping && ' • '}
                {PRODUCT_TEMPLATES[value].shipping.requiresShipping && '✓ نیاز به ارسال دارد'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
