import { Request, Response } from 'express';
import { ShippingMethodModel } from '../models/shipping-method.model';

export const getAllShippingMethods = async (req: Request, res: Response) => {
  try {
    const { active } = req.query;
    const query = active === 'true' ? { isActive: true } : {};
    
    const methods = await ShippingMethodModel.find(query).sort({ order: 1 });
    
    res.json({
      success: true,
      data: methods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shipping methods',
      error
    });
  }
};

export const getShippingMethodById = async (req: Request, res: Response) => {
  try {
    const method = await ShippingMethodModel.findById(req.params.id);
    
    if (!method) {
      return res.status(404).json({
        success: false,
        message: 'Shipping method not found'
      });
    }

    res.json({
      success: true,
      data: method
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shipping method',
      error
    });
  }
};

export const createShippingMethod = async (req: Request, res: Response) => {
  try {
    const method = await ShippingMethodModel.create(req.body);
    
    res.status(201).json({
      success: true,
      data: method,
      message: 'Shipping method created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating shipping method',
      error
    });
  }
};

export const updateShippingMethod = async (req: Request, res: Response) => {
  try {
    const method = await ShippingMethodModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!method) {
      return res.status(404).json({
        success: false,
        message: 'Shipping method not found'
      });
    }

    res.json({
      success: true,
      data: method,
      message: 'Shipping method updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating shipping method',
      error
    });
  }
};

export const deleteShippingMethod = async (req: Request, res: Response) => {
  try {
    const method = await ShippingMethodModel.findByIdAndDelete(req.params.id);

    if (!method) {
      return res.status(404).json({
        success: false,
        message: 'Shipping method not found'
      });
    }

    res.json({
      success: true,
      message: 'Shipping method deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting shipping method',
      error
    });
  }
};

export const reorderShippingMethods = async (req: Request, res: Response) => {
  try {
    const { methods } = req.body; // Array of { id, order }

    await Promise.all(
      methods.map((item: { id: string; order: number }) =>
        ShippingMethodModel.findByIdAndUpdate(item.id, { order: item.order })
      )
    );

    res.json({
      success: true,
      message: 'Shipping methods reordered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reordering shipping methods',
      error
    });
  }
};
