import { z } from 'zod';

const empty = z.object({}).optional().transform(() => ({}));

export const getUserNotificationsSchema = z.object({
  body: empty,
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).optional()
  }),
  params: empty
});

export const getUnreadCountSchema = z.object({
  body: empty,
  query: empty,
  params: empty
});

export const markAsReadSchema = z.object({
  body: empty,
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const markAllAsReadSchema = z.object({
  body: empty,
  query: empty,
  params: empty
});

export const deleteNotificationSchema = z.object({
  body: empty,
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

