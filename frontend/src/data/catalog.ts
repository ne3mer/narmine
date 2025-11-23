export type GameDetail = {
  id: string;
  slug: string;
  title: string;
  platform: string;
  price: number;
  safePrice?: number;
  region: string;
  isSafe: boolean;
  rating: number;
  genre: string;
  description: string;
  tags: string[];
  features: string[];
  approxPlaytime: string;
  offline: boolean;
  online: boolean;
  sharedType: 'اصلی' | 'اشتراکی';
  cover: string;
  gallery: string[];
  guarantee: string[];
  activationSteps: string[];
};

export type Review = {
  id: number;
  user: string;
  handle: string;
  rating: number;
  text: string;
  avatar: string;
};

export const catalogGames: GameDetail[] = [
  {
    id: 'satin-sheets-double',
    slug: 'satin-sheets-double',
    title: 'روبالشی و ملحفه ساتن ابریشم (دو نفره)',
    platform: 'Silk',
    price: 1850000,
    safePrice: 2100000,
    region: 'TR',
    isSafe: true,
    rating: 4.9,
    genre: 'bedding',
    description:
      'ست کامل روتختی و روبالشی ساتن ابریشم خالص، ضد حساسیت و مناسب برای پوست و مو. خوابی راحت و لوکس را تجربه کنید.',
    tags: ['ضد حساسیت', 'لوکس', 'ساتن'],
    features: ['پارچه ساتن ابریشم درجه یک', 'دوخت صنعتی دقیق', 'رنگ ثابت'],
    approxPlaytime: 'نامحدود',
    offline: true,
    online: false,
    sharedType: 'اصلی',
    cover: '/images/products/satin-sheets.jpg',
    gallery: [
      '/images/products/satin-sheets-1.jpg',
      '/images/products/satin-sheets-2.jpg'
    ],
    guarantee: ['ضمانت ۷ روزه بازگشت', 'تضمین اصالت پارچه', 'ارسال رایگان'],
    activationSteps: [
      'انتخاب رنگ و سایز',
      'افزودن به سبد خرید',
      'دریافت درب منزل'
    ]
  },
  {
    id: 'orthopedic-pillow',
    slug: 'orthopedic-pillow',
    title: 'بالش طبی هوشمند (مموری فوم)',
    platform: 'Memory Foam',
    price: 980000,
    safePrice: 1200000,
    region: 'IR',
    isSafe: true,
    rating: 4.8,
    genre: 'pillow',
    description:
      'بالش طبی با فوم هوشمند که فرم گردن و سر را می‌گیرد و از دردهای عضلانی جلوگیری می‌کند. مناسب برای کسانی که دیسک گردن دارند.',
    tags: ['طبی', 'ارگونومیک', 'خواب راحت'],
    features: ['فوم هوشمند با دانسیته بالا', 'روکش قابل شستشو', 'گارانتی تعویض'],
    approxPlaytime: '۵ سال',
    offline: true,
    online: false,
    sharedType: 'اصلی',
    cover: '/images/products/pillow-ortho.jpg',
    gallery: [
      '/images/products/pillow-ortho-1.jpg',
      '/images/products/pillow-ortho-2.jpg'
    ],
    guarantee: ['گارانتی ۵ ساله فوم', 'ضمانت برگشت وجه', 'مشاوره رایگان'],
    activationSteps: ['باز کردن بسته‌بندی', 'استفاده از بالش', 'لذت بردن از خواب']
  },
  {
    id: 'cotton-blanket-king',
    slug: 'cotton-blanket-king',
    title: 'پتو پنبه‌ای چهار فصل (کینگ)',
    platform: 'Cotton',
    price: 1450000,
    safePrice: 1650000,
    region: 'IR',
    isSafe: true,
    rating: 4.7,
    genre: 'blanket',
    description:
      'پتوی پنبه‌ای سبک و نرم، مناسب برای تمام فصول سال. با بافت تنفسی که از تعریق جلوگیری می‌کند.',
    tags: ['پنبه‌ای', 'چهار فصل', 'ضد حساسیت'],
    features: ['۱۰۰٪ پنبه ارگانیک', 'قابل شستشو در ماشین', 'بدون پرز دهی'],
    approxPlaytime: '۱۰ سال',
    offline: true,
    online: false,
    sharedType: 'اصلی',
    cover: '/images/products/blanket-cotton.jpg',
    gallery: [
      '/images/products/blanket-cotton-1.jpg',
      '/images/products/blanket-cotton-2.jpg'
    ],
    guarantee: ['ضمانت ثبات رنگ', 'تضمین کیفیت بافت', 'ارسال سریع'],
    activationSteps: ['شستشو قبل از مصرف (اختیاری)', 'استفاده روی تخت', 'خواب راحت']
  }
];

export const sampleReviews: Review[] = [
  {
    id: 1,
    user: 'سارا محمدی',
    handle: '@sara.m',
    rating: 5,
    text: 'کیفیت پارچه‌ها عالی بود، دقیقا همون چیزی که توی عکس بود.',
    avatar: 'https://i.pravatar.cc/100?img=5'
  },
  {
    id: 2,
    user: 'رضا کریمی',
    handle: '@reza.k',
    rating: 4,
    text: 'بالش طبی واقعا گردن دردم رو کم کرد. ممنون از مشاوره خوبتون.',
    avatar: 'https://i.pravatar.cc/100?img=11'
  },
  {
    id: 3,
    user: 'زهرا حسینی',
    handle: '@zahra.h',
    rating: 5,
    text: 'بسته‌بندی خیلی شیک بود و سریع به دستم رسید.',
    avatar: 'https://i.pravatar.cc/100?img=9'
  }
];

export const cartItems = [
  { id: 'cart-1', title: 'روبالشی و ملحفه ساتن ابریشم', type: 'Standard', price: 1850000, region: 'TR', quantity: 1 },
  { id: 'cart-2', title: 'بالش طبی هوشمند', type: 'Standard', price: 980000, region: 'IR', quantity: 2 }
];

export const dashboardData = {
  ordersToday: 15,
  revenueToday: 45_500_000,
  newUsers: 8,
  stockAlerts: 2,
  topGames: [
    { title: 'روبالشی ساتن', sales: 25 },
    { title: 'بالش طبی', sales: 18 },
    { title: 'پتو پنبه‌ای', sales: 12 }
  ]
};

export const userOrders = [
  {
    id: 'ORD-98132',
    status: 'assigned',
    date: '۱۴۰۳/۱۰/۰۱',
    amount: 1850000,
    game: 'روبالشی و ملحفه ساتن ابریشم',
    accountMasked: 'ارسال شده'
  },
  {
    id: 'ORD-97102',
    status: 'pending',
    date: '۱۴۰۳/۰۹/۲۵',
    amount: 980000,
    game: 'بالش طبی هوشمند',
    accountMasked: 'در حال پردازش'
  }
];

export const priceAlerts = [
  { id: 1, game: 'روبالشی ساتن ابریشم', target: 1500000, channel: 'تلگرام', active: true },
  { id: 2, game: 'پتو پنبه‌ای', target: 1200000, channel: 'ایمیل', active: true }
];
