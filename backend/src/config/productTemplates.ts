/**
 * Product Templates Configuration
 * 
 * Defines templates for different product types with their specific fields,
 * validation rules, and display settings.
 */

export interface ProductFieldDefinition {
  name: string;
  label: string;
  labelEn?: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'textarea' | 'color' | 'image';
  required?: boolean;
  options?: string[];
  unit?: string;
  placeholder?: string;
  helpText?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ProductTemplate {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  description: string;
  fields: ProductFieldDefinition[];
  inventory: {
    trackInventory: boolean;
    required: boolean;
  };
  shipping: {
    requiresShipping: boolean;
    required: boolean;
  };
}

export const productTemplates: Record<string, ProductTemplate> = {
  // بازی دیجیتال (فعلی)
  digital_game: {
    id: 'digital_game',
    name: 'بازی دیجیتال',
    nameEn: 'Digital Game',
    icon: '🎮',
    color: 'emerald',
    description: 'بازی‌های دیجیتال برای کنسول‌ها و PC',
    fields: [
      {
        name: 'platform',
        label: 'پلتفرم',
        labelEn: 'Platform',
        type: 'select',
        required: true,
        options: ['PS4', 'PS5', 'Xbox Series X/S', 'Xbox One', 'PC', 'Nintendo Switch']
      },
      {
        name: 'region',
        label: 'ریجن',
        labelEn: 'Region',
        type: 'select',
        required: true,
        options: ['R1 (USA)', 'R2 (Europe/Middle East)', 'R3 (Asia)', 'Region Free']
      },
      {
        name: 'accountType',
        label: 'نوع اکانت',
        labelEn: 'Account Type',
        type: 'select',
        required: true,
        options: ['Primary', 'Secondary', 'Offline']
      },
      {
        name: 'deliveryMethod',
        label: 'روش تحویل',
        labelEn: 'Delivery Method',
        type: 'select',
        options: ['Instant', 'Email', 'Manual'],
        helpText: 'نحوه ارسال اطلاعات بازی به مشتری'
      }
    ],
    inventory: {
      trackInventory: false,
      required: false
    },
    shipping: {
      requiresShipping: false,
      required: false
    }
  },

  // اکشن فیگور
  action_figure: {
    id: 'action_figure',
    name: 'اکشن فیگور',
    nameEn: 'Action Figure',
    icon: '🦸',
    color: 'purple',
    description: 'فیگورهای اکشن و کلکسیونی',
    fields: [
      {
        name: 'brand',
        label: 'برند',
        labelEn: 'Brand',
        type: 'text',
        required: true,
        placeholder: 'مثلاً Hot Toys, Bandai, Hasbro'
      },
      {
        name: 'series',
        label: 'سری',
        labelEn: 'Series',
        type: 'text',
        required: true,
        placeholder: 'مثلاً Marvel Legends, Star Wars Black Series'
      },
      {
        name: 'character',
        label: 'شخصیت',
        labelEn: 'Character',
        type: 'text',
        required: true,
        placeholder: 'نام شخصیت'
      },
      {
        name: 'height',
        label: 'ارتفاع',
        labelEn: 'Height',
        type: 'number',
        unit: 'cm',
        validation: { min: 5, max: 100 }
      },
      {
        name: 'material',
        label: 'جنس',
        labelEn: 'Material',
        type: 'text',
        placeholder: 'مثلاً PVC, ABS, Die-cast'
      },
      {
        name: 'articulation',
        label: 'نقاط مفصلی',
        labelEn: 'Articulation Points',
        type: 'number',
        helpText: 'تعداد نقاط قابل حرکت'
      },
      {
        name: 'accessories',
        label: 'لوازم جانبی',
        labelEn: 'Accessories',
        type: 'textarea',
        placeholder: 'لیست لوازم جانبی که همراه محصول است'
      },
      {
        name: 'limited',
        label: 'نسخه محدود',
        labelEn: 'Limited Edition',
        type: 'boolean'
      },
      {
        name: 'edition',
        label: 'تعداد نسخه',
        labelEn: 'Edition Number',
        type: 'text',
        placeholder: 'مثلاً 1/500'
      }
    ],
    inventory: {
      trackInventory: true,
      required: true
    },
    shipping: {
      requiresShipping: true,
      required: true
    }
  },

  // کارت کلکسیونی
  collectible_card: {
    id: 'collectible_card',
    name: 'کارت کلکسیونی',
    nameEn: 'Collectible Card',
    icon: '🃏',
    color: 'blue',
    description: 'کارت‌های کلکسیونی بازی‌ها',
    fields: [
      {
        name: 'game',
        label: 'بازی',
        labelEn: 'Game',
        type: 'select',
        required: true,
        options: ['Pokemon', 'Yu-Gi-Oh!', 'Magic: The Gathering', 'One Piece', 'Digimon']
      },
      {
        name: 'set',
        label: 'ست',
        labelEn: 'Set',
        type: 'text',
        required: true,
        placeholder: 'نام ست یا expansion'
      },
      {
        name: 'cardNumber',
        label: 'شماره کارت',
        labelEn: 'Card Number',
        type: 'text',
        placeholder: 'مثلاً 001/100'
      },
      {
        name: 'rarity',
        label: 'کمیابی',
        labelEn: 'Rarity',
        type: 'select',
        required: true,
        options: ['Common', 'Uncommon', 'Rare', 'Ultra Rare', 'Secret Rare', 'Promo']
      },
      {
        name: 'condition',
        label: 'وضعیت',
        labelEn: 'Condition',
        type: 'select',
        required: true,
        options: ['Mint (M)', 'Near Mint (NM)', 'Excellent (EX)', 'Good (GD)', 'Poor (P)']
      },
      {
        name: 'graded',
        label: 'گرید شده',
        labelEn: 'Graded',
        type: 'boolean'
      },
      {
        name: 'gradeCompany',
        label: 'شرکت گریدینگ',
        labelEn: 'Grading Company',
        type: 'select',
        options: ['PSA', 'BGS', 'CGC', 'Other']
      },
      {
        name: 'gradeScore',
        label: 'نمره گرید',
        labelEn: 'Grade Score',
        type: 'number',
        validation: { min: 1, max: 10 }
      },
      {
        name: 'language',
        label: 'زبان',
        labelEn: 'Language',
        type: 'select',
        options: ['English', 'Japanese', 'Korean', 'Chinese']
      },
      {
        name: 'foil',
        label: 'فویل/هولوگرافیک',
        labelEn: 'Foil/Holographic',
        type: 'boolean'
      }
    ],
    inventory: {
      trackInventory: true,
      required: true
    },
    shipping: {
      requiresShipping: true,
      required: true
    }
  },

  // تجهیزات گیمینگ
  gaming_gear: {
    id: 'gaming_gear',
    name: 'تجهیزات گیمینگ',
    nameEn: 'Gaming Gear',
    icon: '🎧',
    color: 'indigo',
    description: 'هدست، ماوس، کیبورد و لوازم جانبی',
    fields: [
      {
        name: 'productType',
        label: 'نوع محصول',
        labelEn: 'Product Type',
        type: 'select',
        required: true,
        options: ['Headset', 'Mouse', 'Keyboard', 'Controller', 'Mousepad', 'Chair', 'Monitor', 'Webcam']
      },
      {
        name: 'brand',
        label: 'برند',
        labelEn: 'Brand',
        type: 'text',
        required: true,
        placeholder: 'مثلاً Razer, Logitech, SteelSeries'
      },
      {
        name: 'model',
        label: 'مدل',
        labelEn: 'Model',
        type: 'text',
        required: true
      },
      {
        name: 'connectivity',
        label: 'نوع اتصال',
        labelEn: 'Connectivity',
        type: 'select',
        options: ['Wired', 'Wireless', 'Bluetooth', 'Wired + Wireless']
      },
      {
        name: 'compatibility',
        label: 'سازگاری',
        labelEn: 'Compatibility',
        type: 'multiselect',
        options: ['PS5', 'PS4', 'Xbox Series X/S', 'Xbox One', 'PC', 'Nintendo Switch', 'Mobile']
      },
      {
        name: 'rgb',
        label: 'نورپردازی RGB',
        labelEn: 'RGB Lighting',
        type: 'boolean'
      },
      {
        name: 'warranty',
        label: 'گارانتی',
        labelEn: 'Warranty',
        type: 'text',
        placeholder: 'مثلاً 2 سال گارانتی شرکتی'
      },
      {
        name: 'color',
        label: 'رنگ',
        labelEn: 'Color',
        type: 'select',
        options: ['Black', 'White', 'Red', 'Blue', 'Pink', 'RGB']
      }
    ],
    inventory: {
      trackInventory: true,
      required: true
    },
    shipping: {
      requiresShipping: true,
      required: true
    }
  },

  // لباس و مرچ
  apparel: {
    id: 'apparel',
    name: 'لباس و مرچ',
    nameEn: 'Apparel & Merch',
    icon: '👕',
    color: 'pink',
    description: 'تی‌شرت، هودی، کلاه و لوازم',
    fields: [
      {
        name: 'itemType',
        label: 'نوع محصول',
        labelEn: 'Item Type',
        type: 'select',
        required: true,
        options: ['T-Shirt', 'Hoodie', 'Cap', 'Jacket', 'Socks', 'Bag', 'Keychain', 'Sticker', 'Poster']
      },
      {
        name: 'design',
        label: 'طرح',
        labelEn: 'Design',
        type: 'text',
        required: true,
        placeholder: 'نام بازی یا شخصیت'
      },
      {
        name: 'size',
        label: 'سایز',
        labelEn: 'Size',
        type: 'select',
        options: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'One Size']
      },
      {
        name: 'color',
        label: 'رنگ',
        labelEn: 'Color',
        type: 'select',
        options: ['Black', 'White', 'Gray', 'Navy', 'Red', 'Blue', 'Green']
      },
      {
        name: 'material',
        label: 'جنس',
        labelEn: 'Material',
        type: 'text',
        placeholder: 'مثلاً 100% Cotton'
      },
      {
        name: 'official',
        label: 'رسمی/لایسنس دار',
        labelEn: 'Official Licensed',
        type: 'boolean'
      }
    ],
    inventory: {
      trackInventory: true,
      required: true
    },
    shipping: {
      requiresShipping: true,
      required: true
    }
  },

  // محتوای دیجیتال
  digital_content: {
    id: 'digital_content',
    name: 'محتوای دیجیتال',
    nameEn: 'Digital Content',
    icon: '📚',
    color: 'cyan',
    description: 'کتاب، موسیقی، ویدیو و محتوای دیجیتال',
    fields: [
      {
        name: 'contentType',
        label: 'نوع محتوا',
        labelEn: 'Content Type',
        type: 'select',
        required: true,
        options: ['E-Book', 'Artbook', 'Soundtrack', 'DLC', 'Season Pass', 'Guide', 'Wallpaper Pack']
      },
      {
        name: 'format',
        label: 'فرمت',
        labelEn: 'Format',
        type: 'select',
        options: ['PDF', 'EPUB', 'MP3', 'FLAC', 'MP4', 'PNG', 'JPG']
      },
      {
        name: 'fileSize',
        label: 'حجم فایل',
        labelEn: 'File Size',
        type: 'text',
        placeholder: 'مثلاً 50MB'
      },
      {
        name: 'pages',
        label: 'تعداد صفحات',
        labelEn: 'Number of Pages',
        type: 'number'
      },
      {
        name: 'language',
        label: 'زبان',
        labelEn: 'Language',
        type: 'select',
        options: ['English', 'Persian', 'Japanese', 'Korean', 'Multi-language']
      }
    ],
    inventory: {
      trackInventory: false,
      required: false
    },
    shipping: {
      requiresShipping: false,
      required: false
    }
  }
};

// Helper function to get template by ID
export function getProductTemplate(productType: string): ProductTemplate | null {
  return productTemplates[productType] || null;
}

// Get all templates as array
export function getAllProductTemplates(): ProductTemplate[] {
  return Object.values(productTemplates);
}

// Get template field by name
export function getTemplateField(productType: string, fieldName: string): ProductFieldDefinition | null {
  const template = getProductTemplate(productType);
  if (!template) return null;
  return template.fields.find(f => f.name === fieldName) || null;
}
