'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { formatToman } from '@/lib/format';
import { CreativeBanner } from '@/components/sections/CreativeBanner';
import { API_BASE_URL, resolveImageUrl } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { PriceAlertModal } from '@/components/alerts/PriceAlertModal';
import { getAuthToken } from '@/lib/auth';
import { Icon } from '@/components/icons/Icon';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { useProductRating, invalidateRatingCache } from '@/hooks/useProductRating';

export type BackendGame = {
  id: string;
  title: string;
  slug: string;
  description: string;
  detailedDescription?: string;
  genre: string[];
  platform: string;
  regionOptions: string[];
  basePrice: number;

  coverUrl?: string;
  gallery?: string[];
  tags: string[];
  // Media fields
  trailerUrl?: string;
  gameplayVideoUrl?: string;
  screenshots?: string[];
  // Enhanced metadata
  rating?: number;
  releaseDate?: string;
  developer?: string;
  publisher?: string;
  ageRating?: string;
  features?: string[];
  systemRequirements?: {
    minimum?: string;
    recommended?: string;
  };
  // Marketing
  featured?: boolean;
  onSale?: boolean;
  salePrice?: number;
  options: {
    id: string;
    name: string;
    values: string[];
  }[];
  variants: {
    id: string;
    selectedOptions: Record<string, string>;
    price: number;
    stock: number;
  }[];
  // Multi-product fields
  productType?: string;
  customFields?: Record<string, any>;
  inventory?: {
    trackInventory: boolean;
    quantity: number;
    reserved: number;
    lowStockThreshold: number;
    sku?: string;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
  };
  shipping?: {
    requiresShipping: boolean;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    shippingCost?: number;
    freeShippingThreshold?: number;
    freeShipping?: boolean;
  };
};

// Helper function to extract YouTube/Vimeo video ID
const getVideoEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  
  // Vimeo
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  return null;
};

interface GameDetailClientProps {
  initialGame: BackendGame | null;
}

export default function GameDetailClient({ initialGame }: GameDetailClientProps) {
  const params = useParams();
  const { addToCart } = useCart();
  const [game, setGame] = useState<BackendGame | null>(initialGame);
  const [loading, setLoading] = useState(!initialGame);
  const [error, setError] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [currentVariant, setCurrentVariant] = useState<any>(null);
  const [showPriceAlertModal, setShowPriceAlertModal] = useState(false);
  const [existingAlert, setExistingAlert] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'media' | 'specs' | 'reviews'>('overview');
  const [reviewsKey, setReviewsKey] = useState(0);
  const { rating: gameRating, reviewCount } = useProductRating(game?.id);

  useEffect(() => {
    if (game?.options?.length) {
      const initial: Record<string, string> = {};
      game.options.forEach((opt) => {
        initial[opt.name] = opt.values[0];
      });
      setSelectedOptions(initial);
    }
  }, [game]);

  useEffect(() => {
    if (!game?.variants?.length) {
      setCurrentVariant(null);
      return;
    }
    const variant = game.variants.find((v) =>
      Object.entries(selectedOptions).every(([k, val]) => v.selectedOptions[k] === val)
    );
    setCurrentVariant(variant || null);
  }, [selectedOptions, game]);

  const currentPrice = currentVariant ? currentVariant.price : (game?.onSale && game?.salePrice ? game.salePrice : game?.basePrice || 0);
  const originalPrice = game?.onSale && game?.salePrice ? game.basePrice : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  // Only fetch if we don't have initialGame or if the slug changes
  useEffect(() => {
    if (initialGame && initialGame.slug === params?.slug) {
        setLoading(false);
        return;
    }

    const fetchGame = async () => {
      const slug = params?.slug as string;
      if (!slug) return;

      setLoading(true);
      try {
        const decodedSlug = decodeURIComponent(slug);
        const response = await fetch(`${API_BASE_URL}/api/games/${decodedSlug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
        setError('محصول پیدا نشد');
          } else {
            throw new Error('خطا در دریافت اطلاعات محصول');
          }
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        const foundGame: BackendGame = data.data;
        
        if (!foundGame) {
          setError('محصول پیدا نشد');
        } else {
          setGame(foundGame);
          checkExistingAlert(foundGame.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در بارگذاری محصول');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [params?.slug, initialGame]);

  const checkExistingAlert = async (gameId: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/price-alerts`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const alerts = Array.isArray(data?.data) ? data.data : [];
        const alert = alerts.find((a: any) => a.gameId?.id === gameId || a.gameId?._id === gameId);
        if (alert) {
          setExistingAlert({
            id: alert.id || alert._id,
            targetPrice: alert.targetPrice,
            channel: alert.channel,
            destination: alert.destination
          });
        }
      }
    } catch (err) {
      // Silent fail - user might not be logged in
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-slate-200 rounded-3xl" />
            <div className="h-8 bg-slate-200 rounded w-1/2" />
            <div className="h-4 bg-slate-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-3xl bg-white border border-rose-200 p-8 text-center shadow-lg">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-rose-900 mb-2">محصول پیدا نشد</h1>
          <p className="text-sm text-rose-600">{error || 'این محصول در دیتابیس موجود نیست'}</p>
        </div>
      </div>
    );
  }

  const defaultCover = game.coverUrl ? resolveImageUrl(game.coverUrl) : 'https://images.igdb.com/igdb/image/upload/t_cover_big/nocover.webp';
  const gallery = game.gallery && game.gallery.length > 0 ? game.gallery.map(url => resolveImageUrl(url)) : [defaultCover];
  const screenshots = game.screenshots && game.screenshots.length > 0 ? game.screenshots.map(url => resolveImageUrl(url)) : [];
  const allImages = [defaultCover, ...gallery, ...screenshots].filter((img, idx, arr) => arr.indexOf(img) === idx);
  
  const trailerEmbedUrl = game.trailerUrl ? getVideoEmbedUrl(game.trailerUrl) : null;
  const gameplayEmbedUrl = game.gameplayVideoUrl ? getVideoEmbedUrl(game.gameplayVideoUrl) : null;

  const guarantee = [
    'گارانتی ۷ روزه تعویض یا بازگشت در صورت هرگونه مشکل',
    'پشتیبانی ۲۴ ساعته تلگرام و واتساپ',
    'ارسال سریع و ایمن به سراسر کشور'
  ];

  const activationSteps = [
    'پس از ثبت سفارش، تیم پشتیبانی برای هماهنگی ارسال با شما تماس می‌گیرد',
    'سفارش ظرف حداکثر ۲۴ ساعت بسته‌بندی و به پست تحویل می‌شود',
    'هنگام تحویل، سلامت کالای خواب و لوازم جانبی را بررسی کنید',
    'برای راهنمایی نگهداری یا شست‌وشو با پشتیبانی در تماس باشید'
  ];

  return (
    <div className="bg-gradient-to-b from-[#f8f5f2] to-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        {/* Hero Section */}
        <div className="relative mb-8 rounded-[32px] border border-[#c9a896]/20 bg-white/90 shadow-[0_25px_80px_rgba(74,63,58,0.08)] backdrop-blur">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -right-6 top-6 h-40 w-40 rounded-full bg-[#f4e8dc] blur-[120px]" />
            <div className="absolute left-6 bottom-6 h-48 w-48 rounded-full bg-[#e0d0c7] blur-[140px]" />
          </div>
          <div className="relative grid gap-6 p-6 md:grid-cols-2 md:gap-8 md:p-12">
            <div className="space-y-4 md:space-y-6">
              {game.featured && (
                <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4a3f3a] to-[#c9a896] px-3 py-1 md:px-4 md:py-1.5 text-[10px] md:text-xs font-bold text-white shadow-sm">
                  <Icon name="star" size={14} />
                  محصول ویژه
                </span>
              )}
              <div>
                <p className="mb-2 text-xs md:text-sm font-semibold text-[#c9a896]">{game.platform}</p>
                <h1 className="mb-3 md:mb-4 font-serif text-3xl font-bold leading-tight text-[#4a3f3a] md:text-5xl" style={{ fontFamily: 'var(--font-vazirmatn)' }}>{game.title}</h1>
                <p className="text-base md:text-lg leading-relaxed text-[#4a3f3a]/70">{game.description}</p>
              </div>
              
              {/* Rating & Metadata */}
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                {gameRating !== null && gameRating > 0 && (
                  <div className="flex items-center gap-2 rounded-full border border-[#c9a896]/30 bg-[#f8f5f2] px-3 py-1.5 md:px-4 md:py-2 text-[#c9a896]">
                    <Icon name="star" size={16} className="text-[#c9a896] md:w-[18px] md:h-[18px]" />
                    <span className="font-bold text-sm md:text-base text-[#4a3f3a]">{gameRating.toFixed(1)}</span>
                    {reviewCount > 0 && (
                      <span className="text-[10px] md:text-xs text-[#4a3f3a]/60">({reviewCount})</span>
                    )}
                  </div>
                )}
                {game.releaseDate && (
                  <div className="text-xs md:text-sm text-[#4a3f3a]/60">
                    <span className="font-semibold text-[#4a3f3a]">تاریخ عرضه:</span> {new Date(game.releaseDate).toLocaleDateString('fa-IR')}
                  </div>
                )}
                {game.ageRating && (
                  <div className="rounded-full border border-[#c9a896]/40 bg-white px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-bold text-[#4a3f3a]">
                    {game.ageRating}
                  </div>
                )}
              </div>

              {/* Tags */}
              {game.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {game.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-[#c9a896]/30 bg-white px-2.5 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-semibold text-[#4a3f3a]/70">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Cover Image */}
            <div className="relative aspect-square sm:aspect-[4/3] md:aspect-auto md:h-full overflow-hidden rounded-2xl border border-[#c9a896]/30 bg-[#f8f5f2] shadow-lg">
              <Image 
                src={defaultCover} 
                alt={game.title} 
                fill 
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
                unoptimized
              />
              {game.onSale && (
                <div className="absolute left-4 top-4 rounded-full bg-[#4a3f3a] px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-bold text-white shadow-lg">
                  {discountPercent}% تخفیف
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
          
          {/* Sidebar - Purchase Card (Appears first on mobile) */}
          <div className="lg:col-span-1 lg:col-start-3 lg:row-start-1">
            <div className="sticky top-8 space-y-6">
              {/* Price Card */}
              <div className="rounded-3xl border border-[#c9a896]/30 bg-white/90 p-6 shadow-lg backdrop-blur">
                <div className="mb-6">
                  {originalPrice && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-[#4a3f3a]/50 line-through">{formatToman(originalPrice)}</span>
                      <span className="rounded-full bg-[#c9a896] px-2 py-0.5 text-xs font-bold text-white">
                        {discountPercent}% تخفیف
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-[#4a3f3a]/60 mb-1">قیمت</p>
                  <p className="text-3xl sm:text-4xl font-black text-[#4a3f3a]">{formatToman(currentPrice)}</p>
                  <p className="text-sm text-[#c9a896] font-semibold mt-1">تومان</p>
                </div>

                {game.options.length > 0 && (
                  <div className="space-y-4 mb-6">
                    {game.options.map((opt) => (
                      <div key={opt.id}>
                        <label className="mb-2 block text-sm font-bold text-slate-700">{opt.name}</label>
                        <select
                          value={selectedOptions[opt.name] || ''}
                          onChange={(e) => setSelectedOptions((prev) => ({ ...prev, [opt.name]: e.target.value }))}
                          className="w-full rounded-xl border-2 border-[#c9a896]/40 bg-white px-4 py-3 text-sm font-semibold focus:border-[#c9a896] focus:ring-2 focus:ring-[#c9a896]/20 transition"
                        >
                          {opt.values.map((val) => (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inventory Status */}
                {game.inventory?.trackInventory && (
                  <div className={`mb-4 rounded-xl border p-3 ${
                    game.inventory.status === 'out_of_stock' ? 'bg-rose-50 border-rose-200' :
                    game.inventory.status === 'low_stock' ? 'bg-amber-50 border-amber-200' :
                    'bg-emerald-50 border-emerald-200'
                  }`}>
                    <p className={`text-xs font-bold ${
                      game.inventory.status === 'out_of_stock' ? 'text-rose-800' :
                      game.inventory.status === 'low_stock' ? 'text-amber-800' :
                      'text-emerald-800'
                    }`}>
                      {game.inventory.status === 'out_of_stock' ? '❌ موجود نیست' :
                       game.inventory.status === 'low_stock' ? `⚠️ موجودی کم: ${game.inventory.quantity} عدد` :
                       `✅ موجود در انبار (${game.inventory.quantity} عدد)`}
                    </p>
                  </div>
                )}

                {/* Shipping Info */}
                {game.shipping?.requiresShipping && (
                  <div className="mb-4 rounded-xl bg-[#f8f5f2] border border-[#c9a896]/30 p-3 space-y-2">
                    <p className="text-xs font-bold text-[#4a3f3a] flex items-center gap-2">
                      <Icon name="truck" size={14} />
                      اطلاعات ارسال
                    </p>
                    <div className="text-xs text-[#4a3f3a]/70 space-y-1">
                      {game.shipping.freeShipping ? (
                        <p className="text-emerald-600 font-semibold">ارسال رایگان</p>
                      ) : (
                        <p>هزینه ارسال: {game.shipping.shippingCost ? formatToman(game.shipping.shippingCost) : 'محاسبه در سبد خرید'} تومان</p>
                      )}
                      {game.shipping.weight && <p>وزن: {game.shipping.weight} گرم</p>}
                    </div>
                  </div>
                )}

                {/* Legacy Variant Stock Logic (Fallback) */}
                {!game.inventory?.trackInventory && currentVariant && currentVariant.stock <= 5 && currentVariant.stock > 0 && (
                  <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3">
                    <p className="text-xs font-bold text-amber-800">
                      ⚠️ فقط {currentVariant.stock} عدد باقی مانده!
                    </p>
                  </div>
                )}

                {!game.inventory?.trackInventory && currentVariant && currentVariant.stock === 0 && (
                  <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3">
                    <p className="text-xs font-bold text-rose-800">❌ موجود نیست</p>
                  </div>
                )}

                <div className="space-y-3">
                  <button 
                    onClick={async () => {
                      try {
                        await addToCart(game.id, 1, currentVariant?.id, selectedOptions);
                        alert('به سبد خرید اضافه شد');
                      } catch (err) {
                        alert('لطفاً وارد حساب کاربری شوید');
                      }
                    }}
                    disabled={(game.inventory?.status === 'out_of_stock') || (currentVariant && currentVariant.stock === 0)}
                    className="w-full rounded-2xl bg-[#4a3f3a] py-4 text-base font-bold text-white shadow-lg shadow-[#4a3f3a]/30 transition hover:bg-[#2f2723] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {game.inventory?.status === 'out_of_stock' || (currentVariant && currentVariant.stock === 0) ? 'موجود نیست' : 'افزودن به سبد خرید'}
                  </button>
                  <button 
                    onClick={() => {
                      const token = getAuthToken();
                      if (!token) {
                        alert('لطفاً ابتدا وارد حساب کاربری خود شوید');
                        return;
                      }
                      setShowPriceAlertModal(true);
                    }}
                    className="w-full rounded-2xl border-2 border-[#c9a896]/40 bg-white px-4 py-3 text-sm font-semibold text-[#4a3f3a] hover:bg-[#f8f5f2] transition"
                >
                    {existingAlert ? '✏️ ویرایش هشدار قیمت' : '🔔 تنظیم هشدار قیمت'}
                  </button>
                </div>


              </div>

              {/* Guarantee Card */}
              <div className="rounded-3xl border border-[#c9a896]/30 bg-white p-6 shadow-md">
                <p className="text-sm font-bold text-[#c9a896] mb-3 flex items-center gap-2">
                  <Icon name="shield" size={18} />
                  ضمانت نرمینه خواب
                </p>
                <ul className="space-y-2 text-sm text-[#4a3f3a]/80">
                  {[
                    'تضمین کیفیت و اصالت کالا',
                    'ارسال سریع و مطمئن',
                    'پشتیبانی ۲۴ ساعته'
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Icon name="check" size={16} className="text-[#c9a896] flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 space-y-8">
            {/* Tabs */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 flex overflow-x-auto scrollbar-hide">
                {[
                  { id: 'overview', label: 'بررسی', icon: 'file' },
                  { id: 'media', label: 'رسانه', icon: 'image' },
                  { id: 'specs', label: 'مشخصات', icon: 'file' },
                  { id: 'reviews', label: 'نظرات', icon: 'message' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-4 text-sm font-bold transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-rose-50 text-rose-600 border-b-2 border-rose-400'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon name={tab.icon as any} size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-4 sm:p-6 md:p-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {game.detailedDescription && (
                      <div 
                        className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base"
                        dangerouslySetInnerHTML={{ __html: game.detailedDescription }}
                      />
                    )}
                    
                    {game.features && game.features.length > 0 && (
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">ویژگی‌های محصول</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {game.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                        <Icon name="check" size={18} className="text-rose-500 flex-shrink-0" />
                              <span className="text-sm text-slate-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Activation Steps */}
                  <div className="rounded-2xl bg-gradient-to-br from-[#f7f8fb] to-white p-4 sm:p-6 border border-slate-100">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">راهنمای خرید</h3>
                      <ol className="space-y-4">
                        {[
                          'رنگ و طرح مورد نظر خود را انتخاب کنید',
                          'محصول را به سبد خرید اضافه کنید',
                          'آدرس و مشخصات گیرنده را وارد نمایید',
                          'پس از پرداخت، سفارش شما پردازش و ارسال خواهد شد'
                        ].map((step, index) => (
                          <li key={step} className="flex items-start gap-4">
                          <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#0a84ff] font-bold text-white flex-shrink-0 shadow-lg text-sm sm:text-base">
                              {index + 1}
                            </span>
                          <span className="text-sm text-rose-600 leading-relaxed pt-1.5 sm:pt-2">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}

                {/* Media Tab */}
                {activeTab === 'media' && (
                  <div className="space-y-8">
                    {/* Trailer */}
                    {trailerEmbedUrl && (
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">ویدیو معرفی محصول</h3>
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                          <iframe
                            src={trailerEmbedUrl}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}

                    {/* Gameplay Video */}
                    {gameplayEmbedUrl && (
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">ویدیو بررسی</h3>
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                          <iframe
                            src={gameplayEmbedUrl}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}

                    {/* Screenshots Gallery */}
                    {screenshots.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">اسکرین‌شات‌ها</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {screenshots.map((screenshot, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedImageIndex(allImages.indexOf(screenshot));
                                setShowImageModal(true);
                              }}
                              className="relative aspect-video rounded-xl overflow-hidden group hover:scale-105 transition-transform shadow-lg"
                            >
                              <Image
                                src={screenshot}
                                alt={`Screenshot ${idx + 1}`}
                                fill
                                sizes="(max-width: 768px) 50vw, 33vw"
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition"></div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Image Gallery */}
                    {allImages.length > 1 && (
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">گالری تصاویر</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {allImages.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedImageIndex(idx);
                                setShowImageModal(true);
                              }}
                              className="relative aspect-square rounded-xl overflow-hidden group hover:scale-105 transition-transform shadow-lg"
                            >
                              <Image
                                src={img}
                                alt={`Gallery ${idx + 1}`}
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-cover"
                                unoptimized
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition"></div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Specs Tab */}
                {activeTab === 'specs' && (
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="rounded-2xl bg-slate-50 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">مشخصات محصول</h3>
                        <div className="space-y-3 text-sm">
                          {game.platform && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">برند:</span>
                              <span className="font-semibold text-slate-900">{game.platform}</span>
                            </div>
                          )}
                          {game.genre.length > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">دسته‌بندی:</span>
                              <span className="font-semibold text-slate-900">{game.genre.join(', ')}</span>
                            </div>
                          )}
                          {game.developer && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">تولیدکننده:</span>
                              <span className="font-semibold text-slate-900">{game.developer}</span>
                            </div>
                          )}
                          {game.shipping?.weight && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">وزن:</span>
                              <span className="font-semibold text-slate-900">{game.shipping.weight} گرم</span>
                            </div>
                          )}
                          {game.shipping?.dimensions && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">ابعاد:</span>
                              <span className="font-semibold text-slate-900">
                                {game.shipping.dimensions.length}x{game.shipping.dimensions.width}x{game.shipping.dimensions.height} سانتی‌متر
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#f8f5f2] p-6">
                        <h3 className="text-lg font-bold text-[#4a3f3a] mb-4">نکات نگهداری و شستشو</h3>
                        <div className="space-y-4 text-sm text-[#4a3f3a]/80">
                          <div>
                            <h4 className="font-semibold text-[#4a3f3a] mb-2">دستورالعمل شستشو:</h4>
                            <p className="whitespace-pre-line">
                              - شستشو با دمای ۳۰ درجه سانتی‌گراد
                              - از سفیدکننده استفاده نشود
                              - خشک‌شویی نشود
                              - اتوکشی با دمای پایین
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Custom Fields */}
                      {game.customFields && Object.entries(game.customFields).length > 0 && (
                        <div className="rounded-2xl bg-[#f8f5f2] p-6 mt-6">
                          <h3 className="text-lg font-bold text-[#4a3f3a] mb-4">مشخصات تکمیلی</h3>
                          <div className="space-y-3 text-sm text-[#4a3f3a]/80">
                            {Object.entries(game.customFields).map(([key, value]) => (
                              <div key={key} className="flex justify-between border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                                <span>{key}:</span>
                                <span className="font-semibold text-[#4a3f3a]">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-8">
                    <ReviewForm 
                      gameId={game.id} 
                      onSuccess={() => {
                        setReviewsKey(prev => prev + 1);
                        invalidateRatingCache(game.id);
                      }}
                    />
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">نظرات کاربران</h3>
                      <ReviewsList key={reviewsKey} gameId={game.id} />
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Creative Banner */}
        <div className="mt-8">
          <CreativeBanner />
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-rose-400 transition"
          >
            <Icon name="x" size={32} />
          </button>
          <div className="relative max-w-5xl w-full h-full flex items-center">
            <Image
              src={allImages[selectedImageIndex]}
              alt={`Image ${selectedImageIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              unoptimized
            />
          </div>
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-rose-400 transition"
              >
                <Icon name="chevron-left" size={32} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-rose-400 transition"
              >
                <Icon name="chevron-right" size={32} />
              </button>
            </>
          )}
        </div>
      )}

      {/* Price Alert Modal */}
      {game && (
        <PriceAlertModal
          gameId={game.id}
          gameTitle={game.title}
          currentPrice={currentPrice}
          isOpen={showPriceAlertModal}
          onClose={() => {
            setShowPriceAlertModal(false);
            setExistingAlert(null);
          }}
          onSuccess={() => {
            checkExistingAlert(game.id);
          }}
          existingAlert={existingAlert}
        />
      )}
    </div>
  );
}
