import { Request, Response } from 'express';
import { PaymentMethodModel } from '../models/payment-method.model';

export const getAllPaymentMethods = async (req: Request, res: Response) => {
  try {
    const { active } = req.query;
    const query = active === 'true' ? { isActive: true } : {};
    
    const methods = await PaymentMethodModel.find(query).sort({ order: 1 });
    
    res.json({
      success: true,
      data: methods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment methods',
      error
    });
  }
};

export const createPaymentMethod = async (req: Request, res: Response) => {
  try {
    const method = await PaymentMethodModel.create(req.body);
    
    res.status(201).json({
      success: true,
      data: method,
      message: 'Payment method created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating payment method',
      error
    });
  }
};

export const updatePaymentMethod = async (req: Request, res: Response) => {
  try {
    const method = await PaymentMethodModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!method) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    res.json({
      success: true,
      data: method,
      message: 'Payment method updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating payment method',
      error
    });
  }
};

export const deletePaymentMethod = async (req: Request, res: Response) => {
  try {
    const method = await PaymentMethodModel.findByIdAndDelete(req.params.id);

    if (!method) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting payment method',
      error
    });
  }
};

export const reorderPaymentMethods = async (req: Request, res: Response) => {
  try {
    const { methods } = req.body; // Array of { id, order }

    await Promise.all(
      methods.map((item: { id: string; order: number }) =>
        PaymentMethodModel.findByIdAndUpdate(item.id, { order: item.order })
      )
    );

    res.json({
      success: true,
      message: 'Payment methods reordered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reordering payment methods',
      error
    });
  }
};
