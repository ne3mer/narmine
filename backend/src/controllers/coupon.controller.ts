import type { Request, Response } from 'express';
import { validateResource } from '../middleware/validateResource';
import {
  createCouponSchema,
  updateCouponSchema,
  getCouponSchema,
  deleteCouponSchema,
  validateCouponSchema
} from '../schemas/coupon.schema';
import {
  listCoupons,
  createCoupon,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  generateCouponCode
} from '../services/coupon.service';

export const listCouponsController = async (_req: Request, res: Response) => {
  try {
    const coupons = await listCoupons();
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'خطا در دریافت لیست کوپن‌ها'
    });
  }
};

export const getCouponController = [
  validateResource(getCouponSchema),
  async (req: Request, res: Response) => {
    try {
      const coupon = await getCouponById(req.params.id);
      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'کوپن پیدا نشد'
        });
      }
      res.json({ success: true, data: coupon });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'خطا در دریافت کوپن'
      });
    }
  }
];

export const createCouponController = [
  validateResource(createCouponSchema),
  async (req: Request, res: Response) => {
    try {
      const coupon = await createCoupon(req.body);
      res.status(201).json({
        success: true,
        data: coupon,
        message: 'کوپن با موفقیت ایجاد شد'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'خطا در ایجاد کوپن'
      });
    }
  }
];

export const updateCouponController = [
  validateResource(updateCouponSchema),
  async (req: Request, res: Response) => {
    try {
      const coupon = await updateCoupon(req.params.id, req.body);
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
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'خطا در به‌روزرسانی کوپن'
      });
    }
  }
];

export const deleteCouponController = [
  validateResource(deleteCouponSchema),
  async (req: Request, res: Response) => {
    try {
      const coupon = await deleteCoupon(req.params.id);
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'خطا در حذف کوپن'
      });
    }
  }
];

export const validateCouponController = [
  validateResource(validateCouponSchema),
  async (req: Request, res: Response) => {
    try {
      // Extract userId from token if available
      const userId = (req as any).user?.id;
      const validateInput = {
        ...req.body,
        userId: userId || req.body.userId
      };
      
      const result = await validateCoupon(validateInput);
      res.json({ success: result.valid, data: result });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'خطا در اعتبارسنجی کوپن'
      });
    }
  }
];

export const generateCodeController = async (_req: Request, res: Response) => {
  try {
    const code = generateCouponCode(10);
    res.json({ success: true, data: { code } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'خطا در تولید کد'
    });
  }
};

