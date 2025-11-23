import { z } from 'zod';

const empty = z.object({}).optional().transform(() => ({}));

const bannerElementSchema = z.object({
  type: z.enum(['text', 'image', 'icon', 'button', 'badge', 'stats', 'video']),
  content: z.string(),
  style: z.object({
    fontSize: z.string().optional(),
    fontWeight: z.string().optional(),
    color: z.string().optional(),
    backgroundColor: z.string().optional(),
    padding: z.string().optional(),
    margin: z.string().optional(),
    borderRadius: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    position: z.enum(['absolute', 'relative', 'fixed']).optional(),
    top: z.string().optional(),
    left: z.string().optional(),
    right: z.string().optional(),
    bottom: z.string().optional(),
    zIndex: z.number().optional(),
    opacity: z.number().optional(),
    transform: z.string().optional(),
    animation: z.string().optional(),
    animationDuration: z.string().optional(),
    animationDelay: z.string().optional()
  }).optional(),
  imageUrl: z.string().url().optional(),
  iconName: z.string().optional(),
  href: z.string().optional(),
  target: z.enum(['_blank', '_self']).optional(),
  order: z.number().optional()
});

const backgroundSchema = z.object({
  type: z.enum(['gradient', 'solid', 'image', 'video']),
  color: z.string().optional(),
  gradientColors: z.array(z.string()).optional(),
  gradientDirection: z.enum(['to-r', 'to-l', 'to-b', 'to-t', 'to-br', 'to-bl', 'to-tr', 'to-tl']).optional(),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  overlay: z.boolean().optional(),
  overlayColor: z.string().optional(),
  overlayOpacity: z.number().optional()
});

export const createBannerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'نام بنر الزامی است'),
    type: z.enum(['hero', 'promotional', 'announcement', 'cta', 'testimonial', 'custom']),
    layout: z.enum(['centered', 'split', 'overlay', 'card', 'full-width', 'floating']),
    active: z.boolean().optional(),
    priority: z.number().optional(),
    displayOn: z.array(z.string()).optional(),
    background: backgroundSchema,
    elements: z.array(bannerElementSchema),
    containerStyle: z.object({
      padding: z.string().optional(),
      margin: z.string().optional(),
      borderRadius: z.string().optional(),
      maxWidth: z.string().optional(),
      minHeight: z.string().optional(),
      boxShadow: z.string().optional()
    }).optional(),
    entranceAnimation: z.string().optional(),
    exitAnimation: z.string().optional(),
    hoverEffects: z.object({
      scale: z.number().optional(),
      rotate: z.number().optional(),
      glow: z.boolean().optional(),
      shadow: z.boolean().optional()
    }).optional(),
    mobileSettings: z.object({
      hideOnMobile: z.boolean().optional(),
      mobileLayout: z.string().optional(),
      mobileElements: z.array(bannerElementSchema).optional()
    }).optional(),
    displayRules: z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      showToUsers: z.array(z.string()).optional(),
      showToRoles: z.array(z.string()).optional(),
      maxViews: z.number().optional(),
      maxClicks: z.number().optional()
    }).optional()
  }),
  query: empty,
  params: empty
});

export const getAllBannersSchema = z.object({
  body: empty,
  query: z.object({
    active: z.string().optional()
  }),
  params: empty
});

export const getBannersForPageSchema = z.object({
  body: empty,
  query: empty,
  params: z.object({
    page: z.string().min(1)
  })
});

export const getBannerByIdSchema = z.object({
  body: empty,
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const updateBannerSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    type: z.enum(['hero', 'promotional', 'announcement', 'cta', 'testimonial', 'custom']).optional(),
    layout: z.enum(['centered', 'split', 'overlay', 'card', 'full-width', 'floating']).optional(),
    active: z.boolean().optional(),
    priority: z.number().optional(),
    displayOn: z.array(z.string()).optional(),
    background: backgroundSchema.optional(),
    elements: z.array(bannerElementSchema).optional(),
    containerStyle: z.object({
      padding: z.string().optional(),
      margin: z.string().optional(),
      borderRadius: z.string().optional(),
      maxWidth: z.string().optional(),
      minHeight: z.string().optional(),
      boxShadow: z.string().optional()
    }).optional(),
    entranceAnimation: z.string().optional(),
    exitAnimation: z.string().optional(),
    hoverEffects: z.object({
      scale: z.number().optional(),
      rotate: z.number().optional(),
      glow: z.boolean().optional(),
      shadow: z.boolean().optional()
    }).optional(),
    mobileSettings: z.object({
      hideOnMobile: z.boolean().optional(),
      mobileLayout: z.string().optional(),
      mobileElements: z.array(bannerElementSchema).optional()
    }).optional(),
    displayRules: z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      showToUsers: z.array(z.string()).optional(),
      showToRoles: z.array(z.string()).optional(),
      maxViews: z.number().optional(),
      maxClicks: z.number().optional()
    }).optional()
  }),
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const deleteBannerSchema = z.object({
  body: empty,
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const trackBannerViewSchema = z.object({
  body: empty,
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const trackBannerClickSchema = z.object({
  body: empty,
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

