import { z } from 'zod';

const empty = z.object({}).optional().transform(() => ({}));

export const createReviewSchema = z.object({
  body: z.object({
    gameId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(10, 'نظر باید حداقل ۱۰ کاراکتر باشد').max(1000, 'نظر نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد')
  }),
  query: empty,
  params: empty
});

export const getReviewsSchema = z.object({
  body: empty,
  query: z.object({
    gameId: z.string().optional(),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    userId: z.string().optional(),
    limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
    page: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
  }),
  params: empty
});

export const updateReviewStatusSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected']),
    adminNote: z.string().optional()
  }),
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const deleteReviewSchema = z.object({
  body: empty,
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});




