/**
 * Product Templates - Frontend copy of backend templates
 * Used for rendering dynamic forms in admin panel
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
  baseFieldConfig?: {
    platform?: { show: boolean; required: boolean };
    region?: { show: boolean; required: boolean };
    releaseDate?: { show: boolean; required: boolean };
    developer?: { show: boolean; required: boolean };
    publisher?: { show: boolean; required: boolean };
    ageRating?: { show: boolean; required: boolean };
  };
}

export const PRODUCT_TEMPLATES: Record<string, ProductTemplate> = {
  physical_product: {
    id: 'physical_product',
    name: 'محصول فیزیکی',
    nameEn: 'Physical Product',
    icon: '📦',
    color: 'emerald',
    description: 'کالای خواب و محصولات فیزیکی',
    fields: [
      { name: 'material', label: 'جنس', type: 'text', required: true, placeholder: 'مثلاً کتان، ابریشم' },
      { name: 'dimensions', label: 'ابعاد', type: 'text', placeholder: 'مثلاً 200x220 cm' },
      { name: 'careInstructions', label: 'دستورالعمل شستشو', type: 'textarea' },
      { name: 'brand', label: 'برند', type: 'text' }
    ],
    inventory: { trackInventory: true, required: true },
    shipping: { requiresShipping: true, required: true },
    baseFieldConfig: {
      platform: { show: false, required: false },
      region: { show: false, required: false },
      releaseDate: { show: false, required: false },
      developer: { show: false, required: false },
      publisher: { show: false, required: false },
      ageRating: { show: false, required: false }
    }
  }
};

export function getProductTemplate(type: string): ProductTemplate | null {
  return PRODUCT_TEMPLATES[type] || null;
}

export function getAllProductTemplates(): ProductTemplate[] {
  return Object.values(PRODUCT_TEMPLATES);
}
