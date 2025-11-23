import type { Request, Response } from 'express';
import * as cartService from '../services/cart.service';

export const getCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const cart = await cartService.getCart(userId);
  
  res.json({
    success: true,
    data: cart
  });
};

export const addToCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const cart = await cartService.addToCart(userId, req.body);
  
  res.status(201).json({
    success: true,
    message: 'Item added to cart',
    data: cart
  });
};

export const updateCartItem = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { gameId } = req.params;
  const cart = await cartService.updateCartItem(userId, gameId, req.body);
  
  res.json({
    success: true,
    message: 'Cart updated',
    data: cart
  });
};

export const removeFromCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { gameId } = req.params;
  const cart = await cartService.removeFromCart(userId, gameId);
  
  res.json({
    success: true,
    message: 'Item removed from cart',
    data: cart
  });
};

export const clearCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const cart = await cartService.clearCart(userId);
  
  res.json({
    success: true,
    message: 'Cart cleared',
    data: cart
  });
};
