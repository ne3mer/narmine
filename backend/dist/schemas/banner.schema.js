"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackBannerClickSchema = exports.trackBannerViewSchema = exports.deleteBannerSchema = exports.updateBannerSchema = exports.getBannerByIdSchema = exports.getBannersForPageSchema = exports.getAllBannersSchema = exports.createBannerSchema = void 0;
const zod_1 = require("zod");
const empty = zod_1.z.object({}).optional().transform(() => ({}));
const bannerElementSchema = zod_1.z.object({
    type: zod_1.z.enum(['text', 'image', 'icon', 'button', 'badge', 'stats', 'video']),
    content: zod_1.z.string(),
    style: zod_1.z.object({
        fontSize: zod_1.z.string().optional(),
        fontWeight: zod_1.z.string().optional(),
        color: zod_1.z.string().optional(),
        backgroundColor: zod_1.z.string().optional(),
        padding: zod_1.z.string().optional(),
        margin: zod_1.z.string().optional(),
        borderRadius: zod_1.z.string().optional(),
        width: zod_1.z.string().optional(),
        height: zod_1.z.string().optional(),
        position: zod_1.z.enum(['absolute', 'relative', 'fixed']).optional(),
        top: zod_1.z.string().optional(),
        left: zod_1.z.string().optional(),
        right: zod_1.z.string().optional(),
        bottom: zod_1.z.string().optional(),
        zIndex: zod_1.z.number().optional(),
        opacity: zod_1.z.number().optional(),
        transform: zod_1.z.string().optional(),
        animation: zod_1.z.string().optional(),
        animationDuration: zod_1.z.string().optional(),
        animationDelay: zod_1.z.string().optional()
    }).optional(),
    imageUrl: zod_1.z.string().url().optional(),
    iconName: zod_1.z.string().optional(),
    href: zod_1.z.string().optional(),
    target: zod_1.z.enum(['_blank', '_self']).optional(),
    order: zod_1.z.number().optional()
});
const backgroundSchema = zod_1.z.object({
    type: zod_1.z.enum(['gradient', 'solid', 'image', 'video']),
    color: zod_1.z.string().optional(),
    gradientColors: zod_1.z.array(zod_1.z.string()).optional(),
    gradientDirection: zod_1.z.enum(['to-r', 'to-l', 'to-b', 'to-t', 'to-br', 'to-bl', 'to-tr', 'to-tl']).optional(),
    imageUrl: zod_1.z.string().url().optional(),
    videoUrl: zod_1.z.string().url().optional(),
    overlay: zod_1.z.boolean().optional(),
    overlayColor: zod_1.z.string().optional(),
    overlayOpacity: zod_1.z.number().optional()
});
exports.createBannerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'نام بنر الزامی است'),
        type: zod_1.z.enum(['hero', 'promotional', 'announcement', 'cta', 'testimonial', 'custom']),
        layout: zod_1.z.enum(['centered', 'split', 'overlay', 'card', 'full-width', 'floating']),
        active: zod_1.z.boolean().optional(),
        priority: zod_1.z.number().optional(),
        displayOn: zod_1.z.array(zod_1.z.string()).optional(),
        background: backgroundSchema,
        elements: zod_1.z.array(bannerElementSchema),
        containerStyle: zod_1.z.object({
            padding: zod_1.z.string().optional(),
            margin: zod_1.z.string().optional(),
            borderRadius: zod_1.z.string().optional(),
            maxWidth: zod_1.z.string().optional(),
            minHeight: zod_1.z.string().optional(),
            boxShadow: zod_1.z.string().optional()
        }).optional(),
        entranceAnimation: zod_1.z.string().optional(),
        exitAnimation: zod_1.z.string().optional(),
        hoverEffects: zod_1.z.object({
            scale: zod_1.z.number().optional(),
            rotate: zod_1.z.number().optional(),
            glow: zod_1.z.boolean().optional(),
            shadow: zod_1.z.boolean().optional()
        }).optional(),
        mobileSettings: zod_1.z.object({
            hideOnMobile: zod_1.z.boolean().optional(),
            mobileLayout: zod_1.z.string().optional(),
            mobileElements: zod_1.z.array(bannerElementSchema).optional()
        }).optional(),
        displayRules: zod_1.z.object({
            startDate: zod_1.z.string().datetime().optional(),
            endDate: zod_1.z.string().datetime().optional(),
            showToUsers: zod_1.z.array(zod_1.z.string()).optional(),
            showToRoles: zod_1.z.array(zod_1.z.string()).optional(),
            maxViews: zod_1.z.number().optional(),
            maxClicks: zod_1.z.number().optional()
        }).optional()
    }),
    query: empty,
    params: empty
});
exports.getAllBannersSchema = zod_1.z.object({
    body: empty,
    query: zod_1.z.object({
        active: zod_1.z.string().optional()
    }),
    params: empty
});
exports.getBannersForPageSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: zod_1.z.object({
        page: zod_1.z.string().min(1)
    })
});
exports.getBannerByIdSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.updateBannerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        type: zod_1.z.enum(['hero', 'promotional', 'announcement', 'cta', 'testimonial', 'custom']).optional(),
        layout: zod_1.z.enum(['centered', 'split', 'overlay', 'card', 'full-width', 'floating']).optional(),
        active: zod_1.z.boolean().optional(),
        priority: zod_1.z.number().optional(),
        displayOn: zod_1.z.array(zod_1.z.string()).optional(),
        background: backgroundSchema.optional(),
        elements: zod_1.z.array(bannerElementSchema).optional(),
        containerStyle: zod_1.z.object({
            padding: zod_1.z.string().optional(),
            margin: zod_1.z.string().optional(),
            borderRadius: zod_1.z.string().optional(),
            maxWidth: zod_1.z.string().optional(),
            minHeight: zod_1.z.string().optional(),
            boxShadow: zod_1.z.string().optional()
        }).optional(),
        entranceAnimation: zod_1.z.string().optional(),
        exitAnimation: zod_1.z.string().optional(),
        hoverEffects: zod_1.z.object({
            scale: zod_1.z.number().optional(),
            rotate: zod_1.z.number().optional(),
            glow: zod_1.z.boolean().optional(),
            shadow: zod_1.z.boolean().optional()
        }).optional(),
        mobileSettings: zod_1.z.object({
            hideOnMobile: zod_1.z.boolean().optional(),
            mobileLayout: zod_1.z.string().optional(),
            mobileElements: zod_1.z.array(bannerElementSchema).optional()
        }).optional(),
        displayRules: zod_1.z.object({
            startDate: zod_1.z.string().datetime().optional(),
            endDate: zod_1.z.string().datetime().optional(),
            showToUsers: zod_1.z.array(zod_1.z.string()).optional(),
            showToRoles: zod_1.z.array(zod_1.z.string()).optional(),
            maxViews: zod_1.z.number().optional(),
            maxClicks: zod_1.z.number().optional()
        }).optional()
    }),
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.deleteBannerSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.trackBannerViewSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.trackBannerClickSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
//# sourceMappingURL=banner.schema.js.map