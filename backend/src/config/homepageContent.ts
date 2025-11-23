export interface HeroStat {
  id: string;
  label: string;
  value: string;
}

export interface HeroCTA {
  label: string;
  href: string;
}

export interface HeroContent {
  badge: string;
  title: string;
  subtitle: string;
  primaryCta: HeroCTA;
  secondaryCta: HeroCTA;
  stats: HeroStat[];
  image?: string;
}

export interface SpotlightCard {
  id: string;
  title: string;
  description: string;
  href: string;
  accent: string;
}

export interface TrustSignal {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Testimonial {
  id: string;
  name: string;
  handle: string;
  text: string;
  avatar: string;
  highlight?: boolean;
}

export interface ShippingMethodContent {
  id: string;
  name: string;
  description: string;
  eta: string;
  price: number;
  badge?: string;
  icon?: string;
  freeThreshold?: number;
  perks?: string[];
  highlight?: boolean;
  priceLabel?: string;
}

export interface BannerContent {
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  perks: string[];
  priceLabel: string;
  priceValue: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface HomeContent {
  hero: HeroContent;
  heroSlides: HeroContent[];
  spotlights: SpotlightCard[];
  trustSignals: TrustSignal[];
  testimonials: Testimonial[];
  creativeBanner: BannerContent;
  shippingMethods: ShippingMethodContent[];
}

export const DEFAULT_HOME_CONTENT: HomeContent = {
  hero: {
    badge: 'کیفیت خواب برتر',
    title: 'با نرمینه خواب، رویایی بخوابید',
    subtitle: 'تنوع بی‌نظیر روتختی، بالش و ملزومات خواب با بهترین کیفیت و قیمت',
    primaryCta: { label: 'مشاهده محصولات', href: '/products' },
    secondaryCta: { label: 'درباره ما', href: '/about' },
    stats: [
      { id: 'orders', label: 'مشتری راضی', value: '۵۰۰۰+' },
      { id: 'delivery', label: 'ارسال', value: 'فوری' },
      { id: 'guarantee', label: 'ضمانت کیفیت', value: '۱۰۰٪' },
      { id: 'material', label: 'الیاف', value: 'طبیعی' }
    ]
  },
  heroSlides: [
    {
      badge: 'کالکشن جدید',
      title: 'سرویس روتختی ابریشم',
      subtitle: 'لطافت و زیبایی خیره‌کننده برای اتاق خواب شما. ضد حساسیت و با دوام بالا.',
      primaryCta: { label: 'خرید سرویس', href: '/products?collection=satin' },
      secondaryCta: { label: 'مشاهده رنگ‌بندی', href: '#' },
      image: 'https://images.unsplash.com/photo-1522771753035-4a5046160e81?q=80&w=1200&auto=format&fit=crop',
      stats: [
        { id: 'material', label: 'جنس', value: 'ابریشم' },
        { id: 'pieces', label: 'تعداد تکه', value: '۶ تکه' }
      ]
    },
    {
      badge: 'پرفروش‌ترین',
      title: 'بالش طبی هوشمند',
      subtitle: 'خوابی راحت و بدون درد گردن با بالش‌های مموری فوم ارگونومیک.',
      primaryCta: { label: 'خرید بالش', href: '/products?collection=pillow' },
      secondaryCta: { label: 'اطلاعات بیشتر', href: '#' },
      image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?q=80&w=1200&auto=format&fit=crop',
      stats: [
        { id: 'comfort', label: 'راحتی', value: 'عالی' },
        { id: 'warranty', label: 'گارانتی', value: '۵ سال' }
      ]
    }
  ],
  spotlights: [
    {
      id: 'cta-1',
      title: 'مشاوره دکوراسیون',
      description: 'برای انتخاب بهترین رنگ و طرح با مشاوران ما تماس بگیرید.',
      href: '/contact',
      accent: 'emerald'
    },
    {
      id: 'cta-2',
      title: 'باشگاه مشتریان نرمینه',
      description: 'با هر خرید امتیاز بگیرید و در خریدهای بعدی تخفیف ویژه دریافت کنید.',
      href: '/account',
      accent: 'indigo'
    },
    {
      id: 'cta-3',
      title: 'ارسال رایگان',
      description: 'برای خریدهای بالای ۲ میلیون تومان ارسال رایگان است.',
      href: '/shipping',
      accent: 'slate'
    }
  ],
  trustSignals: [
    { id: 'trust-1', title: 'ضمانت بازگشت', description: 'تا ۷ روز در صورت عدم رضایت کالا را مرجوع کنید.', icon: '🛡️' },
    { id: 'trust-2', title: 'کیفیت تضمینی', description: 'استفاده از بهترین الیاف و پارچه‌های ضد حساسیت.', icon: '✅' },
    { id: 'trust-3', title: 'ارسال سریع', description: 'تحویل سفارشات تهران در کمتر از ۲۴ ساعت.', icon: '⚡' },
    { id: 'trust-4', title: 'پشتیبانی آنلاین', description: 'پاسخگویی به سوالات شما در تمام روزهای هفته.', icon: '💬' }
  ],
  testimonials: [
    {
      id: 'test-1',
      name: 'سارا از تهران',
      handle: '@sara_home',
      text: 'روتختی که سفارش دادم دقیقاً همون چیزی بود که می‌خواستم. جنسش عالیه!',
      avatar: 'https://i.pravatar.cc/100?img=5',
      highlight: true
    },
    {
      id: 'test-2',
      name: 'مریم از اصفهان',
      handle: '@maryam.design',
      text: 'بسته‌بندی خیلی شیک و تمیز بود. ممنون از سلیقه خوبتون.',
      avatar: 'https://i.pravatar.cc/100?img=9'
    },
    {
      id: 'test-3',
      name: 'زهرا از مشهد',
      handle: '@zahra_life',
      text: 'بالش‌های طبی واقعاً کیفیت خوابم رو تغییر دادن. حتماً پیشنهاد می‌کنم.',
      avatar: 'https://i.pravatar.cc/100?img=10'
    }
  ],
  creativeBanner: {
    title: 'جشنواره خواب رویایی',
    subtitle: 'تخفیف‌های ویژه هفته آرامش',
    badge: 'مدت محدود',
    description: 'با خرید از جشنواره نرمینه خواب علاوه بر تخفیف‌های ویژه، هدایای خاص دریافت کنید.',
    perks: ['ارسال رایگان', 'ضمانت تعویض', 'هدایای ویژه'],
    priceLabel: 'شروع قیمت از',
    priceValue: '۲۹۹ هزار تومان',
    ctaLabel: 'مشاهده جشنواره',
    ctaHref: '/products'
  },
  shippingMethods: [
    {
      id: 'standard',
      name: 'ارسال کلاسیک نرمینه',
      description: 'تحویل مطمئن در سراسر کشور با بسته‌بندی محافظ و پیگیری آنلاین.',
      eta: '۲ تا ۳ روز کاری',
      price: 0,
      priceLabel: 'رایگان',
      badge: 'اقتصادی',
      icon: '🚚',
      freeThreshold: 500000,
      perks: ['پیگیری آنلاین مسیر ارسال', 'بسته‌بندی دوست‌دار محیط زیست'],
      highlight: false
    },
    {
      id: 'express',
      name: 'ارسال اکسپرس طلایی',
      description: 'پیک ویژه تهران و شهرهای بزرگ با تحویل همان‌روز و هماهنگی تلفنی.',
      eta: 'تحویل همان‌روز',
      price: 150000,
      badge: 'سریع‌ترین',
      icon: '⚡',
      perks: ['پشتیبانی اختصاصی', 'بیمه خسارت کامل'],
      highlight: true
    },
    {
      id: 'white-glove',
      name: 'خدمت VIP نرمینه',
      description: 'تحویل تشریفاتی به همراه نصب و چیدمان سرویس خواب در محل شما.',
      eta: '۴۸ ساعت',
      price: 250000,
      badge: 'ویژه لوکس',
      icon: '🤍',
      perks: ['نصب و چیدمان کامل', 'جمع‌آوری بسته‌ب‌بندی‌ها'],
      highlight: false
    }
  ]
};
