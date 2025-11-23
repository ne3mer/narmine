export type BannerContent = {
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  perks: string[];
  priceLabel: string;
  priceValue: string;
  ctaLabel: string;
  ctaHref: string;
};

export const defaultBannerContent: BannerContent = {
  title: 'جشنواره فروش ویژه',
  subtitle: 'تخفیف‌های رویایی',
  badge: 'مدت محدود',
  description:
    'با خرید از جشنواره نرمینه خواب، علاوه بر تخفیف‌های ویژه، شانس برنده شدن در قرعه‌کشی سفر به کیش را داشته باشید. بهترین زمان برای نو کردن دکوراسیون اتاق خواب.',
  perks: ['ارسال رایگان', 'ضمانت تعویض', 'هدایای ویژه'],
  priceLabel: 'شروع قیمت از',
  priceValue: '۲۹۹ هزار تومان',
  ctaLabel: 'مشاهده تخفیف‌ها',
  ctaHref: '/products'
};
