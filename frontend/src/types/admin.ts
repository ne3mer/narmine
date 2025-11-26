export type ProductRow = {
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
  // SEO & Marketing
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  onSale?: boolean;
  salePrice?: number;
  categories?: string[];
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
};

export type NewProductState = {
  title: string;
  slug: string;
  description: string;
  detailedDescription?: string;
  genre: string;
  platform: string;
  regionOptions: string;
  basePrice: string;

  coverUrl: string;
  gallery: string[];
  tags: string;
  // Media fields
  trailerUrl: string;
  gameplayVideoUrl: string;
  screenshots: string;
  // Enhanced metadata
  rating: string;
  releaseDate: string;
  developer: string;
  publisher: string;
  ageRating: string;
  features: string;
  systemRequirementsMinimum: string;
  systemRequirementsRecommended: string;
  // SEO & Marketing
  metaTitle: string;
  metaDescription: string;
  featured: boolean;
  onSale: boolean;
  salePrice: string;
  categories: string[];
  options: {
    id: string;
    name: string;
    values: string;
  }[];
  variants: {
    id: string;
    selectedOptions: Record<string, string>;
    price: number;
    salePrice?: number;
    onSale?: boolean;
    stock: number;
  }[];
};

export const initialNewProduct: NewProductState = {
  title: '',
  slug: '',
  description: '',
  detailedDescription: '',
  genre: 'اکشن',
  platform: 'PS5',
  regionOptions: 'R2',
  basePrice: '1500000',

  coverUrl: '',
  gallery: [],
  tags: 'حماسی,Safe',
  categories: [],
  // Media fields
  trailerUrl: '',
  gameplayVideoUrl: '',
  screenshots: '',
  // Enhanced metadata
  rating: '',
  releaseDate: '',
  developer: '',
  publisher: '',
  ageRating: '',
  features: '',
  systemRequirementsMinimum: '',
  systemRequirementsRecommended: '',
  // SEO & Marketing
  metaTitle: '',
  metaDescription: '',
  featured: false,
  onSale: false,
  salePrice: '',
  options: [],
  variants: []
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  customerInfo: {
    name?: string;
    email: string;
    phone: string;
  };
  paymentStatus: 'pending' | 'paid' | 'failed';
  fulfillmentStatus: 'pending' | 'assigned' | 'delivered' | 'refunded';
  totalAmount: number;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    gameTitle: string;
    productType?: string;
    variantId?: string;
    selectedOptions?: Record<string, string>;
    quantity: number;
    pricePaid: number;
    warranty?: {
      status: 'active' | 'expired' | 'voided';
      startDate?: string;
      endDate?: string;
      description?: string;
    };
  }>;
  deliveryInfo?: {
    message?: string;
    credentials?: string;
    deliveredAt?: string;
  };
  customerAcknowledgement?: {
    acknowledged: boolean;
    acknowledgedAt?: string;
  };
  shippingMethod?: {
    name: string;
    price: number;
    eta?: string;
  };
};

export type HomeHeroContent = {
  badge: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  stats: { id: string; label: string; value: string }[];
  image?: string;
};

export type HomeSpotlight = {
  id: string;
  title: string;
  description: string;
  href: string;
  accent: string;
};

export type HomeTrustSignal = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type HomeTestimonial = {
  id: string;
  name: string;
  handle: string;
  text: string;
  avatar: string;
  highlight?: boolean;
};

export type HomeShippingMethod = {
  id: string;
  name: string;
  description: string;
  eta: string;
  price: number;
  priceLabel?: string;
  badge?: string;
  icon?: string;
  freeThreshold?: number;
  perks?: string[];
  highlight?: boolean;
};

export type HomeContentState = {
  hero: HomeHeroContent;
  heroSlides: HomeHeroContent[];
  spotlights: HomeSpotlight[];
  trustSignals: HomeTrustSignal[];
  testimonials: HomeTestimonial[];
  shippingMethods: HomeShippingMethod[];
};

export type UserInsights = {
  user: {
    id: string;
    name?: string;
    email: string;
    phone?: string;
    telegram?: string;
    role: 'user' | 'admin';
    createdAt: string;
    updatedAt: string;
  };
  orders: {
    totalOrders: number;
    paidOrders: number;
    pendingOrders: number;
    failedOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderAt?: string;
    history: Array<{
      id: string;
      orderNumber: string;
      totalAmount: number;
      paymentStatus: string;
      fulfillmentStatus: string;
      createdAt: string;
    }>;
  };
  purchases: {
    topCategories: Array<{ id: string; name: string; count: number }>;
    topGames: Array<{ title: string; count: number }>;
    platforms: Array<{ name: string; count: number }>;
  };
  analytics: {
    pageViews: number;
    clicks: number;
    events: number;
    lastVisitAt?: string;
    topPages: Array<{ path: string; count: number }>;
  };
  alerts: {
    priceAlerts: number;
    unreadNotifications: number;
  };
};

export type CompactProduct = {
  id: string;
  _id?: string;
  title: string;
  coverUrl?: string;
  basePrice: number;
  onSale?: boolean;
  salePrice?: number;
  rating?: number;
  slug: string;
  minPrice?: number;
  hasMultiplePrices?: boolean;
};
