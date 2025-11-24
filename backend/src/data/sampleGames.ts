import type { CreateGameInput } from '../services/game.service';

export const sampleGames: CreateGameInput[] = [
  {
    title: 'سرویس خواب دو نفره مدل رویال',
    slug: 'royal-double-bedding-set',
    description:
      'سرویس خواب دو نفره تمام چوب با طراحی کلاسیک و پارچه ضد لک، شامل تخت، دو پاتختی و میز آرایش.',
    genre: ['کلاسیک', 'چوبی'],
    platform: 'Bedding',
    regionOptions: ['IR'],
    basePrice: 25000000,
    safeAccountAvailable: false,
    coverUrl: '/uploads/sample-bed-1.jpg',
    tags: ['ضمانت ۵ ساله', 'چوب راش'],
    options: [],
    variants: [],
    releaseDate: new Date(),
    featured: true,
    onSale: false,
    productType: 'physical_product',
    inventory: {
      trackInventory: true,
      quantity: 5,
      lowStockThreshold: 2,
      sku: 'BED-ROYAL-001'
    },
    shipping: {
      requiresShipping: true,
      weight: 50000,
      dimensions: {
        length: 200,
        width: 180,
        height: 40
      },
      shippingCost: 500000,
      freeShippingThreshold: 30000000
    }
  },
  {
    title: 'تشک طبی فنری رویال',
    slug: 'royal-medical-mattress',
    description:
      'تشک طبی فنری با الیاف ضد حساسیت و پارچه گردبافت، مناسب برای افرادی که کمردرد دارند.',
    genre: ['طبی', 'فنری'],
    platform: 'Mattress',
    regionOptions: ['IR'],
    basePrice: 8500000,
    safeAccountAvailable: false,
    coverUrl: '/uploads/sample-mattress-1.jpg',
    tags: ['طبی', 'ضد حساسیت'],
    options: [],
    variants: [],
    releaseDate: new Date(),
    featured: false,
    onSale: true,
    salePrice: 7900000,
    productType: 'physical_product',
    inventory: {
      trackInventory: true,
      quantity: 20,
      lowStockThreshold: 5,
      sku: 'MAT-ROYAL-002'
    },
    shipping: {
      requiresShipping: true,
      weight: 15000,
      dimensions: {
        length: 200,
        width: 160,
        height: 25
      },
      shippingCost: 200000,
      freeShippingThreshold: 10000000
    }
  },
  {
    title: 'بالش پر قو',
    slug: 'goose-down-pillow',
    description:
      'بالش بسیار نرم و راحت پر شده با پر قو، با روکش نخی ضد تعریق.',
    genre: ['بالش', 'پر'],
    platform: 'Pillow',
    regionOptions: ['IR'],
    basePrice: 1200000,
    safeAccountAvailable: false,
    coverUrl: '/uploads/sample-pillow-1.jpg',
    tags: ['نرم', 'لوکس'],
    options: [],
    variants: [],
    releaseDate: new Date(),
    featured: false,
    onSale: false,
    productType: 'physical_product',
    inventory: {
      trackInventory: true,
      quantity: 50,
      lowStockThreshold: 10,
      sku: 'PIL-GOOSE-003'
    },
    shipping: {
      requiresShipping: true,
      weight: 1000,
      dimensions: {
        length: 70,
        width: 50,
        height: 15
      },
      shippingCost: 50000,
      freeShippingThreshold: 2000000
    }
  },
  {
    title: 'روتختی دو نفره ترک',
    slug: 'turkish-duvet-cover',
    description:
      'ست روتختی ۶ تکه شامل کاور لحاف، ملحفه و ۴ روبالشی، جنس ساتن پنبه.',
    genre: ['روتختی', 'ترک'],
    platform: 'Bedding',
    regionOptions: ['TR'],
    basePrice: 3800000,
    safeAccountAvailable: false,
    coverUrl: '/uploads/sample-duvet-1.jpg',
    tags: ['ساتن', 'وارداتی'],
    options: [],
    variants: [],
    releaseDate: new Date(),
    featured: true,
    onSale: false,
    productType: 'physical_product',
    inventory: {
      trackInventory: true,
      quantity: 15,
      lowStockThreshold: 3,
      sku: 'DUV-TURK-004'
    },
    shipping: {
      requiresShipping: true,
      weight: 2000,
      dimensions: {
        length: 40,
        width: 30,
        height: 10
      },
      shippingCost: 80000,
      freeShippingThreshold: 5000000
    }
  }
];
