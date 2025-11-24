export const defaultMarketingSettings = {
  bannerContent: {
    title: 'Game Club Banner 1403',
    subtitle: 'Creative Drop',
    badge: 'تحویل ۳۰ ثانیه‌ای',
    description:
      'با عضویت در Game Club می‌توانید هر ماه ۳ اکانت Safe را با قیمت ویژه دریافت کنید و در اولویت پشتیبانی تلگرام قرار بگیرید. این بنر تعاملی وسط صفحات کاتالوگ/اکانت طراحی شده تا تبدیل را افزایش دهد.',
    perks: ['تحویل ۳۰ ثانیه‌ای', '۴ بازی پریمیوم در ماه', 'پشتیبانی ۲۴/۷'],
    priceLabel: 'Game Club Plan',
    priceValue: '۴۹۹ هزار تومان',
    ctaLabel: 'فعالسازی اشتراک',
    ctaHref: '/account'
  },
  campaigns: [
    {
      id: 'cmp-hero',
      name: 'لانچ PS5 HDR Drop',
      channel: 'تلگرام',
      status: 'active',
      budget: 48,
      ctr: 5.1,
      cvr: 2.4,
      startDate: '1403/10/01',
      endDate: '1403/10/15'
    },
    {
      id: 'cmp-instagram',
      name: 'کاروسل اینستاگرام Winter',
      channel: 'اینستاگرام',
      status: 'paused',
      budget: 32,
      ctr: 3.2,
      cvr: 1.4,
      startDate: '1403/09/15',
      endDate: '1403/09/30'
    }
  ],
  utmBuilder: {
    baseUrl: 'https://gameclub.ir',
    source: 'telegram',
    medium: 'social',
    campaign: 'ps5-q4-drop',
    term: '',
    content: 'hero-banner'
  },
  experimentSplit: 60
};
