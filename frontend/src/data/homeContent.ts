export type HeroStat = {
  id: string;
  label: string;
  value: string;
};

export type HeroContent = {
  badge: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  stats: HeroStat[];
  image?: string; // Added image
};

export type Spotlight = {
  id: string;
  title: string;
  description: string;
  href: string;
  accent: 'emerald' | 'indigo' | 'slate' | string;
};

export type TrustSignal = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type Testimonial = {
  id: string;
  name: string;
  handle: string;
  text: string;
  avatar: string;
  highlight?: boolean;
};

export type HomeContent = {
  hero: HeroContent;
  heroSlides?: HeroContent[]; // Added heroSlides
  spotlights: Spotlight[];
  trustSignals: TrustSignal[];
  testimonials: Testimonial[];
};

export const defaultHomeContent: HomeContent = {
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
      primaryCta: { label: 'خرید سرویس', href: '/games?type=bedding' },
      secondaryCta: { label: 'مشاهده رنگ‌بندی', href: '#' },
      image: 'https://images.unsplash.com/photo-1522771753035-4a5046160e81?q=80&w=2535&auto=format&fit=crop',
      stats: [
        { id: 'material', label: 'جنس', value: 'ابریشم' },
        { id: 'pieces', label: 'تکه', value: '۶ تکه' },
      ]
    },
    {
      badge: 'پرفروش‌ترین',
      title: 'بالش طبی هوشمند',
      subtitle: 'خوابی راحت و بدون درد گردن با بالش‌های مموری فوم ارگونومیک.',
      primaryCta: { label: 'خرید بالش', href: '/games?type=pillow' },
      secondaryCta: { label: 'اطلاعات بیشتر', href: '#' },
      image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?q=80&w=2000&auto=format&fit=crop',
      stats: [
        { id: 'comfort', label: 'راحتی', value: 'عالی' },
        { id: 'warranty', label: 'گارانتی', value: '۵ سال' },
      ]
    },
    {
      badge: 'پیشنهاد ویژه',
      title: 'پتوهای بافت نرمینه',
      subtitle: 'گرما و نرمی بی‌نظیر برای شب‌های سرد زمستان. در طرح‌ها و رنگ‌های متنوع.',
      primaryCta: { label: 'خرید با تخفیف', href: '/games?type=blanket' },
      secondaryCta: { label: 'مشاهده طرح‌ها', href: '#' },
      image: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?q=80&w=2670&auto=format&fit=crop',
      stats: [
        { id: 'softness', label: 'نرمی', value: 'فوق‌العاده' },
        { id: 'washable', label: 'قابل شستشو', value: 'بله' },
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
      description: 'برای خریدهای بالای ۲ میلیون تومان، ارسال به سراسر کشور رایگان است.',
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
      avatar: 'https://i.pravatar.cc/100?img=9',
      highlight: false
    },
    {
      id: 'test-3',
      name: 'زهرا از مشهد',
      handle: '@zahra_life',
      text: 'بالش‌های طبی واقعاً کیفیت خوابم رو تغییر دادن. حتماً پیشنهاد می‌کنم.',
      avatar: 'https://i.pravatar.cc/100?img=10',
      highlight: false
    }
  ]
};
