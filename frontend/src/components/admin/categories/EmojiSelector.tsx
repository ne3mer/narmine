'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/icons/Icon';

interface EmojiSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const PREDEFINED_EMOJIS = [
  '🛏️', '🛋️', '🏠', '💤', '🧸', 
  '🖼️', '🕯️', '🪴', '🛁', '🧼',
  '🧺', '🧹', '🪑', '🚪', '🔑',
  '🎁', '✨', '⭐', '🌙', '☁️'
];

export default function EmojiSelector({ value, onChange }: EmojiSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);

  // Check if initial value is in predefined list
  useEffect(() => {
    if (value && !PREDEFINED_EMOJIS.includes(value)) {
      setCustomMode(true);
    }
  }, [value]);

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-bold text-slate-700">آیکون (ایموجی)</label>
      
      <div className="flex gap-2">
        {/* Selected Display / Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-2xl shadow-sm transition hover:border-emerald-500 hover:shadow-md"
        >
          {value || '❓'}
        </button>

        {/* Custom Input (if mode active) */}
        {customMode && (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-center text-xl transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="تایپ کنید..."
          />
        )}

        {!customMode && (
          <button
            type="button"
            onClick={() => {
              setCustomMode(true);
              setIsOpen(false);
            }}
            className="flex-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-sm font-medium text-slate-500 transition hover:border-emerald-500 hover:text-emerald-600"
          >
            تایپ دستی...
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">
            <div className="mb-2 text-xs font-bold text-slate-400">پیشنهادی</div>
            <div className="grid grid-cols-5 gap-2">
              {PREDEFINED_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onChange(emoji);
                    setCustomMode(false);
                    setIsOpen(false);
                  }}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl transition ${
                    value === emoji 
                      ? 'bg-emerald-100 ring-2 ring-emerald-500' 
                      : 'bg-slate-50 hover:bg-emerald-50 hover:scale-110'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            
            <div className="mt-3 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  setCustomMode(true);
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-50 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                <Icon name="edit" size={14} />
                <span>تایپ دستی ایموجی دلخواه</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
