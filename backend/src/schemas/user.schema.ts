import { z } from 'zod';

const empty = z.object({}).optional().transform(() => ({}));

export const getAllUsersSchema = z.object({
  body: empty,
  query: empty,
  params: empty
});

export const getUserByIdSchema = z.object({
  body: empty,
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(['user', 'admin'])
  }),
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    phone: z.string().optional(),
    telegram: z.string().optional()
  }),
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const deleteUserSchema = z.object({
  body: empty,
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const sendUserMessageSchema = z.object({
  body: z.object({
    subject: z.string().min(3, 'موضوع باید حداقل ۳ کاراکتر باشد'),
    message: z.string().min(3, 'متن پیام باید حداقل ۳ کاراکتر باشد'),
    userIds: z.array(z.string().min(1)).optional(),
    role: z.enum(['user', 'admin']).optional(),
    sendToAll: z.boolean().optional(),
    channel: z.enum(['email', 'telegram', 'both']).optional()
  }).refine(
    (data) => Boolean(data.sendToAll || (data.userIds && data.userIds.length > 0) || data.role),
    {
      message: 'باید حداقل یک کاربر یا دسته‌بندی مخاطب انتخاب شود'
    }
  ),
  query: empty,
  params: empty
});

export const getUserInsightsSchema = z.object({
  body: empty,
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});
