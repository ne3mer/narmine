'use client';

import { type ProductFieldDefinition } from '@/config/productTemplates';

interface DynamicFieldProps {
  field: ProductFieldDefinition;
  value: any;
  onChange: (value: any) => void;
}

export function DynamicField({ field, value, onChange }: DynamicFieldProps) {
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
          />
        );

      case 'number':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              min={field.validation?.min}
              max={field.validation?.max}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
            />
            {field.unit && (
              <span className="text-sm text-slate-500 font-medium">{field.unit}</span>
            )}
          </div>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
          >
            <option value="">انتخاب کنید...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValue = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      onChange([...currentValue, option]);
                    } else {
                      onChange(currentValue.filter((v: string) => v !== option));
                    }
                  }}
                  className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 w-5 h-5"
            />
            <span className="text-sm text-slate-600">
              {field.helpText || 'فعال'}
            </span>
          </label>
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-sm font-bold text-slate-900">
          {field.label}
          {field.required && <span className="text-rose-500 mr-1">*</span>}
        </span>
        {field.labelEn && (
          <span className="text-xs text-slate-400 mr-2">({field.labelEn})</span>
        )}
      </label>
      
      {renderField()}
      
      {field.helpText && field.type !== 'boolean' && (
        <p className="text-xs text-slate-500">{field.helpText}</p>
      )}
    </div>
  );
}
