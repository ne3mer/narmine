export const defaultHomeContent = {
  hero: {
    badge: 'GameClub Exclusive',
    title: 'با GameClub هر ماه بازی پریمیوم داشته باش',
    subtitle: 'خرید اکانت Safe و استاندارد با تحویل لحظه‌ای، گارانتی تعویض و پشتیبانی تلگرام',
    primaryCta: { label: 'مشاهده بازی‌ها', href: '/games' },
    secondaryCta: { label: 'عضویت GameClub', href: '/account' },
    stats: [
      { id: 'orders', label: 'سفارش موفق', value: '۴۵۰۰+' },
      { id: 'delivery', label: 'زمان تحویل', value: '< ۳۰ ثانیه' },
      { id: 'guarantee', label: 'گارانتی تعویض', value: '۷ روز' },
      { id: 'mode', label: 'حالت اکانت', value: 'Safe & استاندارد' }
    ]
  },
  heroSlides: [
    {
      badge: 'ویژه پلی‌استیشن ۵',
      title: 'God of War Ragnarök',
      subtitle: 'حماسه نورس را با کیفیت 4K و نرخ فریم بالا تجربه کنید. اکانت قانونی و گارانتی مادام‌العمر.',
      primaryCta: { label: 'خرید اکانت قانونی', href: '/games/god-of-war-ragnarok' },
      secondaryCta: { label: 'مشاهده تریلر', href: '#' },
      image: 'https://images.igdb.com/igdb/image/upload/t_1080p/co5s5v.jpg',
      stats: [
        { id: 'metacritic', label: 'Metacritic', value: '94' },
        { id: 'delivery', label: 'تحویل', value: 'آنی' }
      ]
    },
    {
      badge: 'پرفروش‌ترین هفته',
      title: 'EA Sports FC 25',
      subtitle: 'هیجان فوتبال واقعی را با دوستان خود تجربه کنید. بهترین قیمت در ایران.',
      primaryCta: { label: 'خرید بازی', href: '/games/ea-sports-fc-25' },
      secondaryCta: { label: 'اطلاعات بیشتر', href: '#' },
      image: 'https://images.igdb.com/igdb/image/upload/t_1080p/co89cq.jpg',
      stats: [
        { id: 'players', label: 'بازیکنان', value: '۱۰M+' },
        { id: 'price', label: 'شروع از', value: '۱.۲۰۰' }
      ]
    },
    {
      badge: 'پیشنهاد ویژه',
      title: 'Spider-Man 2',
      subtitle: 'در نقش پیتر پارکر و مایلز مورالز، نیویورک را از چنگال ونوم نجات دهید.',
      primaryCta: { label: 'خرید با تخفیف', href: '/games/marvels-spider-man-2' },
      secondaryCta: { label: 'نقد و بررسی', href: '#' },
      image: 'https://images.igdb.com/igdb/image/upload/t_1080p/co670h.jpg',
      stats: [
        { id: 'rating', label: 'امتیاز کاربران', value: '۴.۹/۵' },
        { id: 'genre', label: 'ژانر', value: 'اکشن' }
      ]
    }
  ],
  spotlights: [
    {
      id: 'cta-1',
      title: 'ربات تلگرام تحویل آنی',
      description: 'سفارش دهید و اطلاعات اکانت را زیر ۳۰ ثانیه تحویل بگیرید.',
      href: 'https://t.me/GameClubSupportBot',
      accent: 'emerald'
    },
    {
      id: 'cta-2',
      title: 'پلن وفاداری GameClub',
      description: 'با هر خرید ۱۰٪ شارژ وفاداری و تخفیف Safe دریافت کنید.',
      href: '/account',
      accent: 'indigo'
    },
    {
      id: 'cta-3',
      title: 'پشتیبانی تخصصی PS5',
      description: 'تیم فارسی‌زبان برای نصب، فعال‌سازی و رفع مسدودیت کنار شماست.',
      href: '/support',
      accent: 'slate'
    }
  ],
  trustSignals: [
    { id: 'trust-1', title: 'گارانتی ۷ روزه', description: 'در صورت هرگونه مشکل، حساب جدید دریافت می‌کنید.', icon: '🛡️' },
    { id: 'trust-2', title: '۱۰۰٪ قانونی', description: 'تمامی اکانت‌ها از منابع معتبر و سازگار با قوانین PSN تهیه می‌شوند.', icon: '✅' },
    { id: 'trust-3', title: 'تحویل لحظه‌ای', description: 'اتوماسیون GameClub سفارش را مستقیماً به تلگرام شما ارسال می‌کند.', icon: '⚡' },
    { id: 'trust-4', title: 'پشتیبانی ۲۴/۷', description: 'در هر ساعت از شبانه‌روز با تلگرام یا ایمیل ما در تماس باشید.', icon: '💬' }
  ],
  testimonials: [
    {
      id: 'test-1',
      name: 'عرفان از شیراز',
      handle: '@erfanplays',
      text: 'کمتر از ۵ دقیقه فعال‌سازی انجام شد و تیم پشتیبانی تمام مراحل کنارم بود.',
      avatar: 'https://i.pravatar.cc/100?img=15',
      highlight: true
    },
    {
      id: 'test-2',
      name: 'فاطمه از تهران',
      handle: '@fatima.gg',
      text: 'گارانتی تعویض واقعاً عملیه؛ برای دوستانم هم سفارش دادم و همه راضی بودند.',
      avatar: 'https://i.pravatar.cc/100?img=45',
      highlight: false
    },
    {
      id: 'test-3',
      name: 'امیرحسین از تبریز',
      handle: '@amirplays',
      text: 'قیمت‌ها از همه جا پایین‌تر بود و راهنمای ضد بن باعث شد کاملاً مطمئن باشم.',
      avatar: 'https://i.pravatar.cc/100?img=12',
      highlight: false
    }
  ]
};
