"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderCategories = exports.removeGameFromCategory = exports.addGameToCategory = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryGames = exports.getCategoryBySlug = exports.getAllCategories = void 0;
const category_model_1 = require("../models/category.model");
const game_model_1 = require("../models/game.model");
const slugify = (value) => value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
// Get all categories (public)
const getAllCategories = async (req, res) => {
    try {
        const { active } = req.query;
        const filter = {};
        if (active === 'true') {
            filter.isActive = true;
        }
        const categories = await category_model_1.CategoryModel.find(filter)
            .sort({ order: 1, name: 1 });
        res.json({
            success: true,
            data: categories
        });
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در دریافت دسته‌بندی‌ها'
        });
    }
};
exports.getAllCategories = getAllCategories;
// Get category by slug (public)
const getCategoryBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const category = await category_model_1.CategoryModel.findOne({ slug, isActive: true });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'دسته‌بندی یافت نشد'
            });
        }
        res.json({
            success: true,
            data: category
        });
    }
    catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در دریافت دسته‌بندی'
        });
    }
};
exports.getCategoryBySlug = getCategoryBySlug;
// Get games in a category (public)
const getCategoryGames = async (req, res) => {
    try {
        const { slug } = req.params;
        const { page = 1, limit = 20, sort = '-createdAt' } = req.query;
        const category = await category_model_1.CategoryModel.findOne({ slug, isActive: true });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'دسته‌بندی یافت نشد'
            });
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [games, total] = await Promise.all([
            game_model_1.GameModel.find({
                categories: category._id,
                isActive: true
            })
                .sort(sort)
                .skip(skip)
                .limit(Number(limit)),
            game_model_1.GameModel.countDocuments({
                categories: category._id,
                isActive: true
            })
        ]);
        res.json({
            success: true,
            data: {
                category,
                games,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching category games:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در دریافت محصولات'
        });
    }
};
exports.getCategoryGames = getCategoryGames;
// Create category (admin)
const createCategory = async (req, res) => {
    try {
        const { name, nameEn, slug, description, seoDescription, seoKeywords, imageUrl, icon, order, isActive, parentCategory, showOnHome } = req.body;
        const generatedSlugSource = slug?.trim() || nameEn?.trim() || name?.trim();
        if (!generatedSlugSource) {
            return res.status(400).json({
                success: false,
                message: 'نام یا اسلاگ دسته‌بندی الزامی است.'
            });
        }
        const finalSlug = slugify(generatedSlugSource);
        // Check if slug already exists
        const existing = await category_model_1.CategoryModel.findOne({ slug: finalSlug });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'این اسلاگ قبلاً استفاده شده است'
            });
        }
        const category = new category_model_1.CategoryModel({
            name,
            nameEn,
            slug: finalSlug,
            description,
            seoDescription,
            seoKeywords: Array.isArray(seoKeywords) ? seoKeywords : [],
            imageUrl,
            icon,
            order: order || 0,
            isActive: isActive !== undefined ? isActive : true,
            parentCategory: parentCategory || null,
            showOnHome: showOnHome ?? false
        });
        await category.save();
        res.status(201).json({
            success: true,
            data: category,
            message: 'دسته‌بندی با موفقیت ایجاد شد'
        });
    }
    catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'خطا در ایجاد دسته‌بندی'
        });
    }
};
exports.createCategory = createCategory;
// Update category (admin)
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        if (typeof updateData.slug === 'string') {
            const trimmed = updateData.slug.trim();
            updateData.slug = trimmed ? slugify(trimmed) : undefined;
        }
        if (!updateData.slug && (updateData.nameEn || updateData.name)) {
            updateData.slug = slugify(updateData.slug || updateData.nameEn || updateData.name);
        }
        // If slug is being updated, check uniqueness
        if (updateData.slug) {
            const existing = await category_model_1.CategoryModel.findOne({
                slug: updateData.slug,
                _id: { $ne: id }
            });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'این اسلاگ قبلاً استفاده شده است'
                });
            }
        }
        const category = await category_model_1.CategoryModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'دسته‌بندی یافت نشد'
            });
        }
        res.json({
            success: true,
            data: category,
            message: 'دسته‌بندی با موفقیت به‌روزرسانی شد'
        });
    }
    catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در به‌روزرسانی دسته‌بندی'
        });
    }
};
exports.updateCategory = updateCategory;
// Delete category (admin)
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await category_model_1.CategoryModel.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'دسته‌بندی یافت نشد'
            });
        }
        // Remove category from all games
        await game_model_1.GameModel.updateMany({ categories: id }, { $pull: { categories: id } });
        await category.deleteOne();
        res.json({
            success: true,
            message: 'دسته‌بندی با موفقیت حذف شد'
        });
    }
    catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در حذف دسته‌بندی'
        });
    }
};
exports.deleteCategory = deleteCategory;
// Add game to category (admin)
const addGameToCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { gameId } = req.body;
        const [category, game] = await Promise.all([
            category_model_1.CategoryModel.findById(id),
            game_model_1.GameModel.findById(gameId)
        ]);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'دسته‌بندی یافت نشد'
            });
        }
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'بازی یافت نشد'
            });
        }
        // Add category to game if not already added
        // Note: We need to cast to unknown first because TypeScript doesn't know about the categories field yet
        // We will update the Game model shortly
        const gameAny = game;
        if (!gameAny.categories) {
            gameAny.categories = [];
        }
        if (!gameAny.categories.includes(id)) {
            gameAny.categories.push(id);
            await game.save();
            // Update product count
            await category.updateProductCount();
        }
        res.json({
            success: true,
            message: 'بازی به دسته‌بندی اضافه شد'
        });
    }
    catch (error) {
        console.error('Error adding game to category:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در اضافه کردن بازی'
        });
    }
};
exports.addGameToCategory = addGameToCategory;
// Remove game from category (admin)
const removeGameFromCategory = async (req, res) => {
    try {
        const { id, gameId } = req.params;
        const [category, game] = await Promise.all([
            category_model_1.CategoryModel.findById(id),
            game_model_1.GameModel.findById(gameId)
        ]);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'دسته‌بندی یافت نشد'
            });
        }
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'بازی یافت نشد'
            });
        }
        // Remove category from game
        const gameAny = game;
        if (gameAny.categories) {
            gameAny.categories = gameAny.categories.filter((catId) => catId.toString() !== id);
            await game.save();
            // Update product count
            await category.updateProductCount();
        }
        res.json({
            success: true,
            message: 'بازی از دسته‌بندی حذف شد'
        });
    }
    catch (error) {
        console.error('Error removing game from category:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در حذف بازی'
        });
    }
};
exports.removeGameFromCategory = removeGameFromCategory;
// Reorder categories (admin)
const reorderCategories = async (req, res) => {
    try {
        const { categories } = req.body; // Array of { id, order }
        if (!Array.isArray(categories)) {
            return res.status(400).json({
                success: false,
                message: 'فرمت داده نامعتبر است'
            });
        }
        const updatePromises = categories.map(({ id, order }) => category_model_1.CategoryModel.findByIdAndUpdate(id, { order }));
        await Promise.all(updatePromises);
        res.json({
            success: true,
            message: 'ترتیب دسته‌بندی‌ها به‌روزرسانی شد'
        });
    }
    catch (error) {
        console.error('Error reordering categories:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در تغییر ترتیب'
        });
    }
};
exports.reorderCategories = reorderCategories;
//# sourceMappingURL=category.controller.js.map