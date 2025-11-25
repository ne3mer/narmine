export type ProductCardContent = {
  id: string;
  slug?: string;
  title: string;
  platform?: string;
  price: number;
  region?: string;
  safe?: boolean;
  monthlyPrice?: number;
  category: string;
  rating: number;
  cover: string;
  description?: string;
  tags?: string[];
  
  // Multi-product fields
  productType?: 'digital_game' | 'physical_product' | 'digital_content' | 'gaming_gear' | 'collectible' | 'bundle' | 'action_figure' | 'collectible_card';
  inventory?: {
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    quantity: number;
  };
  shipping?: {
    requiresShipping: boolean;
    freeShipping: boolean;
  };
  
  // New standardized fields
  basePrice: number;
  finalPrice: number;
  onSale?: boolean;
  salePrice?: number;
  coverUrl?: string;
  customFields?: Record<string, any>;
};

export type GameCardContent = ProductCardContent; // Alias for backward compatibility

export const popularGames: GameCardContent[] = [
  {
    id: 'satin-sheets',
    title: 'روبالشی ساتن ابریشم',
    platform: 'Silk',
    price: 450000,
    basePrice: 450000,
    finalPrice: 450000,
    monthlyPrice: 0,
    region: 'TR',
    safe: true,
    category: 'bedding',
    rating: 4.9,
    cover: '/images/products/satin-pillow.jpg',
    coverUrl: '/images/products/satin-pillow.jpg'
  },
  {
    id: 'ortho-pillow',
    title: 'بالش طبی کلاسیک',
    platform: 'Memory Foam',
    price: 890000,
    basePrice: 890000,
    finalPrice: 890000,
    monthlyPrice: 0,
    region: 'IR',
    safe: true,
    category: 'pillow',
    rating: 4.7,
    cover: '/images/products/pillow-classic.jpg',
    coverUrl: '/images/products/pillow-classic.jpg'
  },
  {
    id: 'cotton-blanket',
    title: 'پتو پنبه‌ای بافت',
    platform: 'Cotton',
    price: 1250000,
    basePrice: 1250000,
    finalPrice: 1250000,
    monthlyPrice: 0,
    region: 'IR',
    safe: true,
    category: 'blanket',
    rating: 4.8,
    cover: '/images/products/blanket-knit.jpg',
    coverUrl: '/images/products/blanket-knit.jpg'
  },
  {
    id: 'duvet-set',
    title: 'ست کاور لحاف دو نفره',
    platform: 'Cotton Satin',
    price: 2800000,
    basePrice: 2800000,
    finalPrice: 2800000,
    monthlyPrice: 0,
    region: 'TR',
    safe: true,
    category: 'bedding',
    rating: 4.6,
    cover: '/images/products/duvet-set.jpg',
    coverUrl: '/images/products/duvet-set.jpg'
  }
];

export const categories = [
  { id: 'bedding', name: 'روبالشی و ملحفه', slug: 'bedding', description: 'انواع ست‌های روتختی و روبالشی ساتن و پنبه‌ای.', icon: '🛏️', color: 'purple' },
  { id: 'pillow', name: 'بالش طبی', slug: 'pillow', description: 'بالش‌های مموری فوم و طبی برای خواب راحت.', icon: '😴', color: 'blue' },
  { id: 'blanket', name: 'پتو و روتختی', slug: 'blanket', description: 'پتوهای چهار فصل و روتختی‌های شیک.', icon: '🧶', color: 'orange' },
  { id: 'towel', name: 'حوله و تن‌پوش', slug: 'towel', description: 'حوله‌های نرم و با کیفیت عالی.', icon: '🛁', color: 'cyan' },
  { id: 'accessory', name: 'اکسسوری خواب', slug: 'accessory', description: 'چشم‌بند، اسانس و لوازم جانبی خواب.', icon: '✨', color: 'pink' }
];

export const trustSignals = [
  { icon: '✅', title: 'ضمانت کیفیت', description: 'تضمین اصالت و کیفیت پارچه و دوخت.' },
  { icon: '🛡️', title: 'ضد حساسیت', description: 'استفاده از مواد اولیه استاندارد و ضد آلرژی.' },
  { icon: '⚡', title: 'ارسال سریع', description: 'ارسال به سراسر کشور در کمترین زمان.' },
  { icon: '💬', title: 'مشاوره رایگان', description: 'راهنمایی برای انتخاب بهترین کالای خواب.' }
];

export const testimonials = [
  {
    id: 1,
    name: 'سارا از تهران',
    handle: '@sara.home',
    text: 'روبالشی‌های ساتن واقعا کیفیت خوبی دارن و برای مو عالی هستن.',
    avatar: 'https://i.pravatar.cc/100?img=5'
  },
  {
    id: 2,
    name: 'مریم از اصفهان',
    handle: '@maryam.style',
    text: 'بالش طبی که گرفتم گردن دردم رو خیلی بهتر کرده. ممنون.',
    avatar: 'https://i.pravatar.cc/100?img=9'
  },
  {
    id: 3,
    name: 'علی از مشهد',
    handle: '@ali.reza',
    text: 'بسته‌بندی خیلی تمیز و شیک بود، برای هدیه عالیه.',
    avatar: 'https://i.pravatar.cc/100?img=12'
  }
];
