"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCodeController = exports.validateCouponController = exports.deleteCouponController = exports.updateCouponController = exports.createCouponController = exports.getCouponController = exports.listCouponsController = void 0;
const validateResource_1 = require("../middleware/validateResource");
const coupon_schema_1 = require("../schemas/coupon.schema");
const coupon_service_1 = require("../services/coupon.service");
const listCouponsController = async (_req, res) => {
    try {
        const coupons = await (0, coupon_service_1.listCoupons)();
        res.json({ success: true, data: coupons });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'خطا در دریافت لیست کوپن‌ها'
        });
    }
};
exports.listCouponsController = listCouponsController;
exports.getCouponController = [
    (0, validateResource_1.validateResource)(coupon_schema_1.getCouponSchema),
    async (req, res) => {
        try {
            const coupon = await (0, coupon_service_1.getCouponById)(req.params.id);
            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    message: 'کوپن پیدا نشد'
                });
            }
            res.json({ success: true, data: coupon });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'خطا در دریافت کوپن'
            });
        }
    }
];
exports.createCouponController = [
    (0, validateResource_1.validateResource)(coupon_schema_1.createCouponSchema),
    async (req, res) => {
        try {
            const coupon = await (0, coupon_service_1.createCoupon)(req.body);
            res.status(201).json({
                success: true,
                data: coupon,
                message: 'کوپن با موفقیت ایجاد شد'
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'خطا در ایجاد کوپن'
            });
        }
    }
];
exports.updateCouponController = [
    (0, validateResource_1.validateResource)(coupon_schema_1.updateCouponSchema),
    async (req, res) => {
        try {
            const coupon = await (0, coupon_service_1.updateCoupon)(req.params.id, req.body);
            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    message: 'کوپن پیدا نشد'
                });
            }
            res.json({
                success: true,
                data: coupon,
                message: 'کوپن با موفقیت به‌روزرسانی شد'
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'خطا در به‌روزرسانی کوپن'
            });
        }
    }
];
exports.deleteCouponController = [
    (0, validateResource_1.validateResource)(coupon_schema_1.deleteCouponSchema),
    async (req, res) => {
        try {
            const coupon = await (0, coupon_service_1.deleteCoupon)(req.params.id);
            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    message: 'کوپن پیدا نشد'
                });
            }
            res.json({
                success: true,
                message: 'کوپن با موفقیت حذف شد'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'خطا در حذف کوپن'
            });
        }
    }
];
exports.validateCouponController = [
    (0, validateResource_1.validateResource)(coupon_schema_1.validateCouponSchema),
    async (req, res) => {
        try {
            // Extract userId from token if available
            const userId = req.user?.id;
            const validateInput = {
                ...req.body,
                userId: userId || req.body.userId
            };
            const result = await (0, coupon_service_1.validateCoupon)(validateInput);
            res.json({ success: result.valid, data: result });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'خطا در اعتبارسنجی کوپن'
            });
        }
    }
];
const generateCodeController = async (_req, res) => {
    try {
        const code = (0, coupon_service_1.generateCouponCode)(10);
        res.json({ success: true, data: { code } });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'خطا در تولید کد'
        });
    }
};
exports.generateCodeController = generateCodeController;
//# sourceMappingURL=coupon.controller.js.map