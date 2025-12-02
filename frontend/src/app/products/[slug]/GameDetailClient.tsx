'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { formatToman, toPersianDigits } from '@/lib/format';
import { API_BASE_URL, resolveImageUrl } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { PriceAlertModal } from '@/components/alerts/PriceAlertModal';
import { getAuthToken } from '@/lib/auth';
import { Icon } from '@/components/icons/Icon';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { useProductRating } from '@/hooks/useProductRating';

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
  cover?: string;
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
    salePrice?: number;
    onSale?: boolean;
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

interface Props {
  game: BackendGame;
}

export default function GameDetailClient({ game }: Props) {
  const { addToCart } = useCart();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [currentVariant, setCurrentVariant] = useState<BackendGame['variants'][0] | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [addingToCart, setAddingToCart] = useState(false);
  const [showPriceAlert, setShowPriceAlert] = useState(false);

  // Initialize selected options
  useEffect(() => {
    if (game.options && game.options.length > 0) {
      const initialOptions: Record<string, string> = {};
      game.options.forEach(opt => {
        initialOptions[opt.name] = opt.values[0];
      });
      setSelectedOptions(initialOptions);
    }
  }, [game.options]);

  // Update current variant based on selected options
  useEffect(() => {
    if (game.variants && game.variants.length > 0) {
      const variant = game.variants.find(v => 
        Object.entries(selectedOptions).every(([key, value]) => v.selectedOptions[key] === value)
      );
      setCurrentVariant(variant || game.variants[0]);
    }
  }, [selectedOptions, game.variants]);

  // Determine current price based on variant and discount
  let currentPrice = currentVariant ? currentVariant.price : (game.salePrice || game.basePrice);
  let basePrice = currentVariant ? currentVariant.price : game.basePrice;
  let isOnSale = currentVariant ? currentVariant.onSale : game.onSale;

  if (currentVariant) {
    if (currentVariant.onSale && currentVariant.salePrice) {
      currentPrice = currentVariant.salePrice;
    }
  } else if (game.onSale && game.salePrice) {
    currentPrice = game.salePrice;
  }

  const discountPercent = isOnSale && basePrice > currentPrice
    ? Math.round(((basePrice - currentPrice) / basePrice) * 100)
    : 0;
  const savings = basePrice > currentPrice ? basePrice - currentPrice : 0;

  // Image resolution - prioritize cover over coverUrl as it's more reliable
  const coverImage = game.cover || game.coverUrl;
  const defaultCover = coverImage 
    ? resolveImageUrl(coverImage) 
    : 'https://images.igdb.com/igdb/image/upload/t_cover_big/nocover.webp';
    
  const gallery = game.gallery && game.gallery.length > 0 ? game.gallery.map(url => resolveImageUrl(url)) : [defaultCover];
  const screenshots = game.screenshots && game.screenshots.length > 0 ? game.screenshots.map(url => resolveImageUrl(url)) : [];
  
  // Ensure we don't have duplicates in allImages
  const allImages = [defaultCover, ...gallery, ...screenshots].filter((img, idx, arr) => arr.indexOf(img) === idx);

  const trailerEmbedUrl = getVideoEmbedUrl(game.trailerUrl || '');
  const gameplayEmbedUrl = getVideoEmbedUrl(game.gameplayVideoUrl || '');

  // Calculate rating
  const { rating: dynamicRating, reviewCount, refetch: refetchRating } = useProductRating(game.id);
  const gameRating = dynamicRating !== null && dynamicRating > 0 ? dynamicRating : (game.rating || 0);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addToCart(game.id, 1, currentVariant?.id, selectedOptions);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2] pb-20">
      {/* Creative Hero Section with Blurred Background */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        {/* Blurred Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src={defaultCover}
            alt="Background"
            fill
            className="object-cover blur-2xl opacity-50 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f8f5f2]/20 via-[#f8f5f2]/60 to-[#f8f5f2]" />
        </div>

        {/* Main Content Container */}
        <div className="container mx-auto px-4 h-full relative z-10 flex items-center justify-center">
          <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-6xl mt-20">
            
            {/* Main Image - Full Display */}
            <button
              onClick={() => {
                setSelectedImageIndex(0);
                setShowImageModal(true);
              }}
              className="relative w-full max-w-md aspect-[3/4] md:aspect-square rounded-3xl overflow-hidden shadow-2xl group transition-transform hover:scale-[1.02] duration-500 bg-white/50 backdrop-blur-sm border border-white/40"
            >
              <Image 
                src={defaultCover} 
                alt={game.title} 
                fill 
                className="object-contain p-2"
                priority
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 bg-white/90 backdrop-blur-md rounded-full px-6 py-3 flex items-center gap-2 shadow-lg">
                  <Icon name="search" size={20} className="text-[#4a3f3a]" />
                  <span className="text-[#4a3f3a] font-bold text-sm">مشاهده تمام صفحه</span>
                </div>
              </div>

              {/* Badges */}
              {game.onSale && (
                <div className="absolute top-4 left-4 bg-rose-500 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg animate-pulse">
                  {toPersianDigits(discountPercent)}% تخفیف
                </div>
              )}
            </button>

            {/* Hero Info */}
            <div className="flex-1 text-center md:text-right space-y-6">
              <h1 className="text-4xl md:text-6xl font-black text-[#4a3f3a] drop-shadow-sm font-serif leading-tight">
                {game.title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[#4a3f3a]/80">
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#c9a896]/20 cursor-pointer hover:bg-white/80 transition-colors">
                  <Icon name="star" size={20} className="text-amber-500 fill-amber-500" />
                  <span className="font-bold">{toPersianDigits(gameRating.toFixed(1))}</span>
                </div>
              </div>

              <p className="text-lg text-[#4a3f3a]/80 leading-relaxed max-w-2xl line-clamp-3">
                {game.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#c9a896]/20 p-2 flex overflow-x-auto">
              {[
                { id: 'overview', label: 'بررسی اجمالی', icon: 'file' },
                { id: 'media', label: 'ویدیوها', icon: 'video' },
                { id: 'specs', label: 'مشخصات محصول', icon: 'file' },
                { id: 'reviews', label: 'نظرات کاربران', icon: 'message' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#4a3f3a] text-white shadow-md'
                      : 'text-[#4a3f3a]/60 hover:bg-[#f8f5f2] hover:text-[#4a3f3a]'
                  }`}
                >
                  <Icon name={tab.icon as any} size={18} />
                  <span className="font-bold">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#c9a896]/20 p-6 md:p-8 min-h-[400px]">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {game.detailedDescription && (
                    <div 
                      className="prose prose-slate max-w-none text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: game.detailedDescription }}
                    />
                  )}

                  {/* Creative Image Gallery */}
                  {allImages.length > 1 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-[#4a3f3a] flex items-center gap-2">
                        <Icon name="image" size={24} />
                        گالری تصاویر
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {allImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedImageIndex(idx);
                              setShowImageModal(true);
                            }}
                            className="relative aspect-[4/3] rounded-2xl overflow-hidden group bg-slate-100 border border-slate-200 hover:border-[#c9a896] transition-all duration-300 hover:shadow-lg"
                          >
                            <Image
                              src={img}
                              alt={`${game.title} - ${idx + 1}`}
                              fill
                              className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-8">
                  {!trailerEmbedUrl && !gameplayEmbedUrl && (
                    <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <Icon name="video" size={48} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500 font-medium">ویدیویی برای این محصول ثبت نشده است</p>
                    </div>
                  )}
                  
                  {trailerEmbedUrl && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-[#4a3f3a]">تریلر رسمی</h3>
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-black">
                        <iframe
                          src={trailerEmbedUrl}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  {gameplayEmbedUrl && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-[#4a3f3a]">گیم‌پلی</h3>
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-black">
                        <iframe
                          src={gameplayEmbedUrl}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Features */}
                    {game.features && game.features.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[#4a3f3a] font-bold text-lg border-b border-[#c9a896]/20 pb-2">
                          <Icon name="check" size={24} />
                          <h3>ویژگی‌های محصول</h3>
                        </div>
                        <div className="bg-[#f8f5f2] rounded-2xl p-6 border border-[#c9a896]/10 space-y-3">
                          {game.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <div className="mt-1.5 w-2 h-2 rounded-full bg-[#c9a896]" />
                              <span className="text-slate-700 leading-relaxed">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Shipping & Dimensions */}
                    {game.shipping && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[#4a3f3a] font-bold text-lg border-b border-[#c9a896]/20 pb-2">
                          <Icon name="box" size={24} />
                          <h3>مشخصات فیزیکی و ارسال</h3>
                        </div>
                        <div className="bg-[#f8f5f2] rounded-2xl p-6 border border-[#c9a896]/10 space-y-4">
                          {game.shipping.weight && (
                            <div className="flex justify-between items-center border-b border-[#c9a896]/10 pb-3 last:border-0 last:pb-0">
                              <span className="text-slate-600 font-medium">وزن</span>
                              <span className="text-[#4a3f3a] font-bold">{toPersianDigits(game.shipping.weight)} گرم</span>
                            </div>
                          )}
                          {game.shipping.dimensions && (
                            <div className="flex justify-between items-center border-b border-[#c9a896]/10 pb-3 last:border-0 last:pb-0">
                              <span className="text-slate-600 font-medium">ابعاد</span>
                              <span className="text-[#4a3f3a] font-bold" dir="ltr">
                                {toPersianDigits(game.shipping.dimensions.length)} x {toPersianDigits(game.shipping.dimensions.width)} x {toPersianDigits(game.shipping.dimensions.height)} cm
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center border-b border-[#c9a896]/10 pb-3 last:border-0 last:pb-0">
                            <span className="text-slate-600 font-medium">قابلیت ارسال</span>
                            <span className="text-[#4a3f3a] font-bold">
                              {game.shipping.requiresShipping ? 'دارد' : 'ندارد (محصول دیجیتال)'}
                            </span>
                          </div>
                          {game.shipping.freeShipping && (
                            <div className="flex justify-between items-center border-b border-[#c9a896]/10 pb-3 last:border-0 last:pb-0">
                              <span className="text-slate-600 font-medium">هزینه ارسال</span>
                              <span className="text-emerald-600 font-bold">رایگان</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {(!game.features?.length && !game.shipping) && (
                    <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <Icon name="file" size={48} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500 font-medium">مشخصات تکمیلی برای این محصول ثبت نشده است</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-8">
                  <div className="bg-[#f8f5f2] rounded-2xl p-6 border border-[#c9a896]/20 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl font-black text-[#4a3f3a]">{toPersianDigits(gameRating.toFixed(1))}</div>
                      <div className="space-y-1">
                        <div className="flex text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Icon 
                              key={star} 
                              name="star" 
                              size={20} 
                              className={star <= Math.round(gameRating) ? "fill-current" : "text-slate-300"} 
                            />
                          ))}
                        </div>
                        <p className="text-sm text-[#4a3f3a]/60 font-medium">از مجموع {toPersianDigits(reviewCount)} نظر</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-6 py-3 bg-[#4a3f3a] text-white rounded-xl font-bold shadow-lg hover:bg-[#c9a896] transition-colors flex items-center gap-2"
                    >
                      <Icon name="edit" size={18} />
                      ثبت نظر جدید
                    </button>
                  </div>

                  <ReviewsList gameId={game.id} key={0} />
                  
                  <div id="review-form" className="pt-8 border-t border-slate-100">
                    <h3 className="text-xl font-bold text-[#4a3f3a] mb-6">نظر خود را بنویسید</h3>
                    <ReviewForm 
                      gameId={game.id} 
                      onSuccess={() => {
                        refetchRating();
                      }} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Sticky Purchase Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 bg-white rounded-3xl shadow-xl border border-[#c9a896]/20 p-6 space-y-6 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#4a3f3a] to-[#c9a896]" />
              
              {/* Price Section */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-[#4a3f3a]/60 font-medium">قیمت نهایی:</span>
                  {discountPercent > 0 ? (
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <span className="text-sm text-rose-500 line-through decoration-2 opacity-60">
                          {formatToman(basePrice)}
                        </span>
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600">
                          {toPersianDigits(discountPercent)}% تخفیف
                        </span>
                      </div>
                      <div className="text-3xl font-black text-[#4a3f3a]">
                        {formatToman(currentPrice)} <span className="text-sm font-medium text-[#4a3f3a]/60">تومان</span>
                      </div>
                      {savings > 0 && (
                        <div className="mt-2 flex items-center justify-end gap-1 text-sm font-bold text-emerald-600 animate-pulse">
                          <Icon name="trending-down" size={16} />
                          <span>سود شما از این خرید: {formatToman(savings)} تومان</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-3xl font-black text-[#4a3f3a]">
                      {formatToman(currentPrice)} <span className="text-sm font-medium text-[#4a3f3a]/60">تومان</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              {game.options && game.options.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  {game.options.map((option) => (
                    <div key={option.id} className="space-y-3">
                      <label className="text-sm font-bold text-[#4a3f3a] block">{option.name}</label>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => (
                          <button
                            key={value}
                            onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: value }))}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                              selectedOptions[option.name] === value
                                ? 'border-[#4a3f3a] bg-[#4a3f3a] text-white shadow-md transform scale-105'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-[#c9a896]'
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add to Cart */}
              <div className="pt-4 space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || (currentVariant ? currentVariant.stock <= 0 : game.inventory?.status === 'out_of_stock')}
                  className="w-full py-4 bg-[#4a3f3a] text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-[#c9a896] hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                >
                  {addingToCart ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>در حال افزودن...</span>
                    </>
                  ) : (currentVariant ? currentVariant.stock <= 0 : game.inventory?.status === 'out_of_stock') ? (
                    <>
                      <Icon name="lock" size={20} />
                      <span>ناموجود</span>
                    </>
                  ) : (
                    <>
                      <Icon name="shopping-bag" size={20} className="group-hover:animate-bounce" />
                      <span>افزودن به سبد خرید</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowPriceAlert(true)}
                  className="w-full py-3 bg-white border-2 border-[#c9a896]/30 text-[#4a3f3a] rounded-2xl font-bold hover:bg-[#f8f5f2] hover:border-[#c9a896] transition-all flex items-center justify-center gap-2"
                >
                  <Icon name="bell" size={18} />
                  <span>اطلاع از تغییر قیمت</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                <div className="flex flex-col items-center text-center gap-2 p-3 bg-[#f8f5f2] rounded-xl">
                  <Icon name="shield" size={24} className="text-[#c9a896]" />
                  <span className="text-xs font-bold text-[#4a3f3a]">ضمانت اصالت</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-3 bg-[#f8f5f2] rounded-xl">
                  <Icon name="truck" size={24} className="text-[#c9a896]" />
                  <span className="text-xs font-bold text-[#4a3f3a]">تحویل فوری</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-50 bg-white/10 p-2 rounded-full"
          >
            <Icon name="x" size={32} />
          </button>
          
          <div className="relative w-full h-full max-w-7xl flex flex-col items-center justify-center">
            <div className="relative w-full h-[80vh]">
              <Image
                src={allImages[selectedImageIndex]}
                alt="Full size"
                fill
                className="object-contain"
                priority
              />
            </div>
            
            {/* Thumbnails */}
            <div className="mt-6 flex gap-3 overflow-x-auto max-w-full pb-4 px-4 scrollbar-hide">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImageIndex === idx ? 'border-white scale-110 shadow-lg' : 'border-white/20 opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Price Alert Modal */}
      <PriceAlertModal
        isOpen={showPriceAlert}
        onClose={() => setShowPriceAlert(false)}
        gameId={game.id}
        gameTitle={game.title}
        currentPrice={currentPrice}
      />
    </div>
  );
}
