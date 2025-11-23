'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { API_BASE_URL, adminHeaders } from '@/lib/api';

type BannerElement = {
  type: 'text' | 'image' | 'icon' | 'button' | 'badge' | 'stats' | 'video';
  content: string;
  style?: Record<string, any>;
  imageUrl?: string;
  iconName?: string;
  href?: string;
  target?: '_blank' | '_self';
  order?: number;
};

type BannerBuilderProps = {
  banner?: any;
  onClose: () => void;
  onSave: () => void;
};

const ICONS = ['🎮', '🎯', '🎨', '🚀', '⭐', '💎', '🔥', '✨', '🎪', '🎭', '🎬', '🎵', '🏆', '💪', '🌟', '💫', '🎊', '🎉', '🎁', '🎈'];

const GRADIENT_PRESETS = [
  { name: 'Emerald', colors: ['#10b981', '#059669', '#047857'], direction: 'to-br' },
  { name: 'Blue', colors: ['#3b82f6', '#2563eb', '#1d4ed8'], direction: 'to-br' },
  { name: 'Purple', colors: ['#8b5cf6', '#7c3aed', '#6d28d9'], direction: 'to-br' },
  { name: 'Pink', colors: ['#ec4899', '#db2777', '#be185d'], direction: 'to-br' },
  { name: 'Orange', colors: ['#f97316', '#ea580c', '#c2410c'], direction: 'to-br' },
  { name: 'Sunset', colors: ['#f59e0b', '#ef4444', '#ec4899'], direction: 'to-r' },
  { name: 'Ocean', colors: ['#06b6d4', '#3b82f6', '#6366f1'], direction: 'to-br' },
  { name: 'Dark', colors: ['#1e293b', '#0f172a', '#020617'], direction: 'to-b' }
];

export function BannerBuilder({ banner, onClose, onSave }: BannerBuilderProps) {
  const [name, setName] = useState(banner?.name || '');
  const [type, setType] = useState(banner?.type || 'promotional');
  const [layout, setLayout] = useState(banner?.layout || 'centered');
  const [active, setActive] = useState(banner?.active !== false);
  const [priority, setPriority] = useState(banner?.priority || 0);
  const [displayOn, setDisplayOn] = useState<string[]>(banner?.displayOn || ['home']);
  const [background, setBackground] = useState(banner?.background || {
    type: 'gradient',
    gradientColors: ['#0f172a', '#1e293b', '#334155'],
    gradientDirection: 'to-br'
  });
  const [elements, setElements] = useState<BannerElement[]>(banner?.elements || []);
  const [selectedElement, setSelectedElement] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);

  const addElement = (elementType: BannerElement['type']) => {
    let defaultContent = '';
    switch (elementType) {
      case 'text':
        defaultContent = 'متن جدید';
        break;
      case 'button':
        defaultContent = 'دکمه';
        break;
      case 'badge':
        defaultContent = 'برچسب';
        break;
      case 'icon':
        defaultContent = '🎮';
        break;
      case 'image':
        defaultContent = 'تصویر';
        break;
      case 'video':
        defaultContent = 'ویدیو';
        break;
      default:
        defaultContent = '';
    }

    const newElement: BannerElement = {
      type: elementType,
      content: defaultContent,
      order: elements.length,
      style: {
        fontSize: elementType === 'text' ? 'text-2xl' : '',
        fontWeight: 'bold',
        color: '#ffffff'
      },
      ...(elementType === 'icon' && { iconName: '🎮' })
    };
    setElements([...elements, newElement]);
    setSelectedElement(elements.length);
  };

  const updateElement = (index: number, updates: Partial<BannerElement>) => {
    const updated = [...elements];
    updated[index] = { ...updated[index], ...updates };
    setElements(updated);
  };

  const deleteElement = (index: number) => {
    setElements(elements.filter((_, i) => i !== index));
    if (selectedElement === index) setSelectedElement(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('نام بنر الزامی است');
      return;
    }

    if (!background || !background.type) {
      alert('لطفاً نوع پس‌زمینه را انتخاب کنید');
      return;
    }

    if (!elements || elements.length === 0) {
      alert('لطفاً حداقل یک عنصر به بنر اضافه کنید');
      return;
    }

    setSaving(true);
    try {
      const bannerData: any = {
        name: name.trim(),
        type,
        layout,
        active: active !== false,
        priority: priority || 0,
        displayOn: displayOn && displayOn.length > 0 ? displayOn : ['home'],
        background: {
          type: background.type,
          ...(background.type === 'gradient' && {
            gradientColors: background.gradientColors || [],
            gradientDirection: background.gradientDirection || 'to-br'
          }),
          ...(background.type === 'solid' && {
            color: background.color || '#000000'
          }),
          ...(background.type === 'image' && {
            imageUrl: background.imageUrl || '',
            overlay: background.overlay || false,
            overlayColor: background.overlayColor,
            overlayOpacity: background.overlayOpacity
          }),
          ...(background.type === 'video' && {
            videoUrl: background.videoUrl || '',
            overlay: background.overlay || false,
            overlayColor: background.overlayColor,
            overlayOpacity: background.overlayOpacity
          })
        },
        elements: elements.map((el, idx) => {
          // Ensure content is set based on element type
          let content = el.content || '';
          if (!content) {
            switch (el.type) {
              case 'text':
                content = 'متن جدید';
                break;
              case 'button':
                content = 'دکمه';
                break;
              case 'badge':
                content = 'برچسب';
                break;
              case 'icon':
                content = el.iconName || '🎮';
                break;
              case 'image':
                content = el.imageUrl || 'تصویر';
                break;
              case 'video':
                content = el.imageUrl || 'ویدیو';
                break;
              default:
                content = '';
            }
          }

          const elementData: any = {
            type: el.type,
            content: content,
            order: el.order !== undefined ? el.order : idx
          };

          // Add optional fields only if they exist
          if (el.style && Object.keys(el.style).length > 0) {
            elementData.style = el.style;
          }
          if (el.imageUrl) {
            elementData.imageUrl = el.imageUrl;
          }
          if (el.iconName) {
            elementData.iconName = el.iconName;
          }
          if (el.href) {
            elementData.href = el.href;
            elementData.target = el.target || '_self';
          }

          return elementData;
        }),
        containerStyle: {
          padding: '2rem',
          borderRadius: '2rem',
          minHeight: '200px'
        }
      };

      const url = banner
        ? `${API_BASE_URL}/api/banners/${banner.id || banner._id}`
        : `${API_BASE_URL}/api/banners`;
      const method = banner ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: adminHeaders(),
        body: JSON.stringify(bannerData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `خطا در ذخیره بنر (${response.status})`);
      }

      const result = await response.json();
      onSave();
    } catch (err) {
      console.error('Error saving banner:', err);
      alert(err instanceof Error ? err.message : 'خطا در ذخیره بنر');
    } finally {
      setSaving(false);
    }
  };

  const getBackgroundStyle = () => {
    if (background.type === 'gradient' && background.gradientColors) {
      const dir = background.gradientDirection || 'to-r';
      const direction = dir === 'to-r' ? 'to right' : dir === 'to-l' ? 'to left' : dir === 'to-b' ? 'to bottom' : dir === 'to-t' ? 'to top' : dir === 'to-br' ? 'to bottom right' : dir === 'to-bl' ? 'to bottom left' : dir === 'to-tr' ? 'to top right' : 'to top left';
      return {
        background: `linear-gradient(${direction}, ${background.gradientColors.join(', ')})`
      };
    }
    if (background.type === 'solid' && background.color) {
      return { backgroundColor: background.color };
    }
    if (background.type === 'image' && background.imageUrl) {
      return { backgroundImage: `url(${background.imageUrl})` };
    }
    return {};
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                {banner ? 'ویرایش بنر' : 'ایجاد بنر جدید'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">سازنده بنر خلاقانه</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 hover:bg-slate-100 transition"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 p-6">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            {/* Basic Settings */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900 mb-4">تنظیمات پایه</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">نام بنر</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                    placeholder="مثلاً: بنر تبلیغاتی زمستان"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">نوع</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                    >
                      <option value="hero">Hero</option>
                      <option value="promotional">تبلیغاتی</option>
                      <option value="announcement">اعلان</option>
                      <option value="cta">CTA</option>
                      <option value="testimonial">نظرات</option>
                      <option value="custom">سفارشی</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">چیدمان</label>
                    <select
                      value={layout}
                      onChange={(e) => setLayout(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                    >
                      <option value="centered">وسط‌چین</option>
                      <option value="split">دو ستونه</option>
                      <option value="overlay">روی تصویر</option>
                      <option value="card">کارت</option>
                      <option value="full-width">تمام عرض</option>
                      <option value="floating">شناور</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">اولویت</label>
                    <input
                      type="number"
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-semibold text-slate-700">فعال</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">نمایش در صفحات</label>
                  <div className="flex flex-wrap gap-2">
                    {['home', 'games', 'account', 'all'].map((page) => (
                      <label key={page} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={displayOn.includes(page)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDisplayOn([...displayOn, page]);
                            } else {
                              setDisplayOn(displayOn.filter((p) => p !== page));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-xs text-slate-600">{page}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Background Settings */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900 mb-4">پس‌زمینه</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">نوع</label>
                  <select
                    value={background.type}
                    onChange={(e) => setBackground({ ...background, type: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  >
                    <option value="gradient">گرادیانت</option>
                    <option value="solid">رنگ یکدست</option>
                    <option value="image">تصویر</option>
                    <option value="video">ویدیو</option>
                  </select>
                </div>

                {background.type === 'gradient' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">پیش‌تنظیمات</label>
                      <div className="grid grid-cols-4 gap-2">
                        {GRADIENT_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => setBackground({
                              ...background,
                              gradientColors: preset.colors,
                              gradientDirection: preset.direction
                            })}
                            className="h-12 rounded-xl border-2 border-slate-200 hover:border-emerald-500 transition"
                            style={{
                              background: `linear-gradient(to bottom right, ${preset.colors.join(', ')})`
                            }}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">رنگ‌ها (با کاما جدا کنید)</label>
                      <input
                        type="text"
                        value={background.gradientColors?.join(', ') || ''}
                        onChange={(e) => setBackground({
                          ...background,
                          gradientColors: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                        })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                        placeholder="#0f172a, #1e293b, #334155"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">جهت</label>
                      <select
                        value={background.gradientDirection || 'to-br'}
                        onChange={(e) => setBackground({ ...background, gradientDirection: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                      >
                        <option value="to-r">راست</option>
                        <option value="to-l">چپ</option>
                        <option value="to-b">پایین</option>
                        <option value="to-t">بالا</option>
                        <option value="to-br">پایین راست</option>
                        <option value="to-bl">پایین چپ</option>
                        <option value="to-tr">بالا راست</option>
                        <option value="to-tl">بالا چپ</option>
                      </select>
                    </div>
                  </>
                )}

                {background.type === 'solid' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">رنگ</label>
                    <input
                      type="color"
                      value={background.color || '#000000'}
                      onChange={(e) => setBackground({ ...background, color: e.target.value })}
                      className="w-full h-12 rounded-xl border border-slate-200"
                    />
                  </div>
                )}

                {(background.type === 'image' || background.type === 'video') && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">آدرس URL</label>
                    <input
                      type="url"
                      value={background.type === 'image' ? (background.imageUrl || '') : (background.videoUrl || '')}
                      onChange={(e) => setBackground({
                        ...background,
                        [background.type === 'image' ? 'imageUrl' : 'videoUrl']: e.target.value
                      })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Elements */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">عناصر</h3>
                <div className="flex gap-2">
                  {['text', 'image', 'icon', 'button', 'badge'].map((elType) => (
                    <button
                      key={elType}
                      onClick={() => addElement(elType as BannerElement['type'])}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition"
                    >
                      + {elType}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {elements.map((element, index) => (
                  <div
                    key={index}
                    className={`rounded-xl border p-3 cursor-pointer transition ${
                      selectedElement === index
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 bg-white'
                    }`}
                    onClick={() => setSelectedElement(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{element.type === 'icon' ? element.iconName : '📝'}</span>
                        <span className="text-sm font-semibold text-slate-700">{element.type}</span>
                        <span className="text-xs text-slate-400">{element.content?.substring(0, 20)}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(index);
                        }}
                        className="text-rose-500 hover:text-rose-600"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Element Editor */}
            {selectedElement !== null && elements[selectedElement] && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <h3 className="font-bold text-slate-900 mb-4">ویرایش عنصر</h3>
                <div className="space-y-3">
                  {elements[selectedElement].type === 'text' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">متن</label>
                        <textarea
                          value={elements[selectedElement].content}
                          onChange={(e) => updateElement(selectedElement, { content: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">اندازه فونت</label>
                          <input
                            type="text"
                            value={elements[selectedElement].style?.fontSize || ''}
                            onChange={(e) => updateElement(selectedElement, {
                              style: { ...elements[selectedElement].style, fontSize: e.target.value }
                            })}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                            placeholder="text-2xl"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">رنگ</label>
                          <input
                            type="color"
                            value={elements[selectedElement].style?.color || '#ffffff'}
                            onChange={(e) => updateElement(selectedElement, {
                              style: { ...elements[selectedElement].style, color: e.target.value }
                            })}
                            className="w-full h-10 rounded-xl border border-slate-200"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {elements[selectedElement].type === 'icon' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">انتخاب آیکون</label>
                        <div className="grid grid-cols-10 gap-2">
                          {ICONS.map((icon) => (
                            <button
                              key={icon}
                              onClick={() => updateElement(selectedElement, { iconName: icon })}
                              className={`h-10 w-10 rounded-lg text-xl transition ${
                                elements[selectedElement].iconName === icon
                                  ? 'bg-emerald-500 scale-110'
                                  : 'bg-white hover:bg-slate-100'
                              }`}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {elements[selectedElement].type === 'image' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">آدرس تصویر</label>
                      <input
                        type="url"
                        value={elements[selectedElement].imageUrl || ''}
                        onChange={(e) => updateElement(selectedElement, { imageUrl: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  )}

                  {elements[selectedElement].type === 'button' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">متن دکمه</label>
                        <input
                          type="text"
                          value={elements[selectedElement].content}
                          onChange={(e) => updateElement(selectedElement, { content: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">لینک</label>
                        <input
                          type="url"
                          value={elements[selectedElement].href || ''}
                          onChange={(e) => updateElement(selectedElement, { href: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                          placeholder="/products"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">ترتیب</label>
                    <input
                      type="number"
                      value={elements[selectedElement].order || 0}
                      onChange={(e) => updateElement(selectedElement, { order: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">پیش‌نمایش</h3>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="text-xs font-semibold text-slate-500"
                >
                  {previewMode ? '📱' : '💻'}
                </button>
              </div>
              <div
                className={`rounded-xl border-2 border-dashed border-slate-300 overflow-hidden ${
                  previewMode ? 'aspect-video' : 'min-h-[400px]'
                }`}
                style={getBackgroundStyle()}
              >
                {background.type === 'image' && background.imageUrl && (
                  <div className="relative h-full w-full">
                    <Image
                      src={background.imageUrl}
                      alt="Preview"
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                    {background.overlay && (
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundColor: background.overlayColor || 'rgba(0,0,0,0.5)',
                          opacity: background.overlayOpacity || 0.5
                        }}
                      />
                    )}
                  </div>
                )}
                <div className="relative z-10 p-8 flex flex-wrap items-center gap-4">
                  {elements
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((element, index) => {
                      if (element.type === 'text') {
                        return (
                          <div
                            key={index}
                            style={element.style}
                            dangerouslySetInnerHTML={{ __html: element.content }}
                          />
                        );
                      }
                      if (element.type === 'icon') {
                        return <span key={index} className="text-4xl">{element.iconName}</span>;
                      }
                      if (element.type === 'image' && element.imageUrl) {
                        return (
                          <div key={index} className="relative h-32 w-32">
                            <Image
                              src={element.imageUrl}
                              alt=""
                              fill
                              sizes="128px"
                              className="object-contain"
                            />
                          </div>
                        );
                      }
                      if (element.type === 'button') {
                        return (
                          <button
                            key={index}
                            style={element.style}
                            className="rounded-xl bg-white px-6 py-3 font-bold text-slate-900"
                          >
                            {element.content}
                          </button>
                        );
                      }
                      if (element.type === 'badge') {
                        return (
                          <span
                            key={index}
                            style={element.style}
                            className="rounded-full bg-white/20 px-4 py-1 text-sm font-semibold"
                          >
                            {element.content}
                          </span>
                        );
                      }
                      return null;
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            انصراف
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50 transition"
          >
            {saving ? 'در حال ذخیره...' : 'ذخیره بنر'}
          </button>
        </div>
      </div>
    </div>
  );
}
