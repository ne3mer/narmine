import type { Request, Response } from 'express';
import * as userService from '../services/user.service';

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  res.json({ data: users });
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  res.json({ data: user });
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'نقش معتبر نیست. باید user یا admin باشد' });
  }

  const user = await userService.updateUserRole(id, role);
  res.json({
    message: `نقش کاربر به ${role === 'admin' ? 'مدیر' : 'کاربر عادی'} تغییر یافت`,
    data: user
  });
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, telegram } = req.body;

  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (telegram !== undefined) updates.telegram = telegram;

  const user = await userService.updateUser(id, updates);
  res.json({
    message: 'اطلاعات کاربر به‌روزرسانی شد',
    data: user
  });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  await userService.deleteUser(id);
  res.status(204).send();
};

export const sendUserMessage = async (req: Request, res: Response) => {
  const { subject, message, userIds, role, sendToAll, channel } = req.body;
  const result = await userService.sendAdminMessage({
    subject,
    message,
    userIds,
    role,
    sendToAll,
    channel
  });

  res.json({
    message: `پیام برای ${result.sent} کاربر ارسال شد`,
    data: result
  });
};

export const getUserInsights = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await userService.getUserInsights(id);
  res.json({ data });
};
