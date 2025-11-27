import { z } from 'zod';

const empty = z.object({}).optional().transform(() => ({}));

export const createGameRequestSchema = z.object({
  body: z.object({
    productName: z.string().min(1, 'Product name is required'),
    category: z.string().min(1, 'Category is required'),
    brand: z.string().min(1, 'Brand is required'),
    description: z.string().optional()
  }),
  query: empty,
  params: empty
});

export const updateGameRequestStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'approved', 'rejected', 'completed']),
    adminNote: z.string().optional()
  }),
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const getGameRequestsSchema = z.object({
  body: empty,
  query: z.object({
    status: z.enum(['pending', 'approved', 'rejected', 'completed']).optional()
  }),
  params: empty
});

export const deleteGameRequestSchema = z.object({
  body: empty,
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});
