"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const game_model_1 = require("../models/game.model");
const category_model_1 = require("../models/category.model");
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gameclub';
const beddingProducts = [
    {
        title: 'سرویس روتختی دونفره ابریشم',
        slug: 'silk-bedding-set-double',
        description: 'سرویس روتختی ۶ تکه شامل لحاف، ملحفه تشک و ۴ عدد روبالشی. تهیه شده از ابریشم خالص با لطافت بی‌نظیر.',
        basePrice: 4500000,
        coverUrl: 'https://images.unsplash.com/photo-1522771753035-4a5046160e81?q=80&w=2535&auto=format&fit=crop',
        productType: 'physical_product',
        inventory: { trackInventory: true, quantity: 10 },
        shipping: { requiresShipping: true, weight: 2500 },
        options: [
            { id: 'color', name: 'رنگ', values: ['سفید', 'صورتی', 'طلایی'] }
        ],
        variants: [
            { id: 'v1', selectedOptions: { color: 'سفید' }, price: 4500000, stock: 5 },
            { id: 'v2', selectedOptions: { color: 'صورتی' }, price: 4500000, stock: 3 },
            { id: 'v3', selectedOptions: { color: 'طلایی' }, price: 4800000, stock: 2 }
        ],
        categorySlug: 'bedding'
    },
    {
        title: 'بالش طبی هوشمند مموری فوم',
        slug: 'smart-memory-foam-pillow',
        description: 'بالش طبی با طراحی ارگونومیک برای حمایت از گردن و ستون فقرات. دارای روکش قابل شستشو.',
        basePrice: 850000,
        coverUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?q=80&w=2000&auto=format&fit=crop',
        productType: 'physical_product',
        inventory: { trackInventory: true, quantity: 50 },
        shipping: { requiresShipping: true, weight: 800 },
        options: [],
        variants: [
            { id: 'v1', selectedOptions: {}, price: 850000, stock: 50 }
        ],
        categorySlug: 'pillow'
    },
    {
        title: 'پتو گلبافت نرمینه طرح گل',
        slug: 'golbaft-blanket-floral',
        description: 'پتوی نرم و گرم با طرح گل‌های برجسته. ضد حساسیت و مناسب برای فصل سرما.',
        basePrice: 1200000,
        coverUrl: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?q=80&w=2670&auto=format&fit=crop',
        productType: 'physical_product',
        inventory: { trackInventory: true, quantity: 20 },
        shipping: { requiresShipping: true, weight: 1500 },
        options: [
            { id: 'size', name: 'سایز', values: ['یک نفره', 'دو نفره'] }
        ],
        variants: [
            { id: 'v1', selectedOptions: { size: 'یک نفره' }, price: 1200000, stock: 10 },
            { id: 'v2', selectedOptions: { size: 'دو نفره' }, price: 1800000, stock: 10 }
        ],
        categorySlug: 'blanket'
    }
];
const categories = [
    { name: 'سرویس روتختی', nameEn: 'Bedding Sets', slug: 'bedding', icon: '🛏️', color: 'pink' },
    { name: 'بالش', nameEn: 'Pillows', slug: 'pillow', icon: '☁️', color: 'blue' },
    { name: 'پتو', nameEn: 'Blankets', slug: 'blanket', icon: '🧶', color: 'orange' },
    { name: 'حوله‌', nameEn: 'Towels', slug: 'towel', icon: '🚿', color: 'teal' }
];
async function seed() {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        // Clear existing data
        await game_model_1.GameModel.deleteMany({});
        await category_model_1.CategoryModel.deleteMany({});
        console.log('Cleared existing products and categories');
        // Insert Categories
        const categoryMap = new Map();
        for (const cat of categories) {
            const newCat = await category_model_1.CategoryModel.create({
                name: cat.name,
                nameEn: cat.nameEn,
                slug: cat.slug,
                icon: cat.icon,
                color: cat.color,
                isActive: true
            });
            categoryMap.set(cat.slug, newCat._id);
        }
        console.log('Inserted categories');
        // Insert Products
        for (const product of beddingProducts) {
            const categoryId = categoryMap.get(product.categorySlug);
            await game_model_1.GameModel.create({
                ...product,
                categories: categoryId ? [categoryId] : [],
                genre: [], // Required by schema but empty for physical
                platform: 'N/A', // Required by schema but N/A
                regionOptions: [], // Required by schema but empty
                tags: ['bedding', 'home', 'sleep']
            });
        }
        console.log('Inserted products');
        console.log('Seeding completed successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seed.js.map