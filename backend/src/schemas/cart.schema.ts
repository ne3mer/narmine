import { z } from 'zod';

const empty = z.object({}).optional().transform(() => ({}));

export const addToCartSchema = z.object({
  body: z.object({
    gameId: z.string().min(1, 'Game ID is required'),
    quantity: z.number().int().min(1).default(1),
    variantId: z.string().optional(),
    selectedOptions: z.record(z.string(), z.string()).optional()
  }),
  query: empty,
  params: empty
});

export const getCartSchema = z.object({
  body: empty,
  query: empty,
  params: empty
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(0)
  }),
  query: empty,
  params: z.object({
    itemId: z.string().min(1)
  })
});

export const removeFromCartSchema = z.object({
  body: empty,
  query: empty,
  params: z.object({
    itemId: z.string().min(1)
  })
});

export const clearCartSchema = z.object({
  body: empty,
  query: empty,
  params: empty
});
