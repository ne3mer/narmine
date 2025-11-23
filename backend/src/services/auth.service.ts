import bcrypt from 'bcryptjs';
import jwt, { type SignOptions, type Secret } from 'jsonwebtoken';
import type { z } from 'zod';
import { UserModel, type UserDocument } from '../models/user.model';
import type { registerSchema, loginSchema } from '../schemas/auth.schema';
import { ApiError } from '../middleware/errorHandler';
import { env } from '../config/env';

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];

const sanitizeEmail = (email: string) => email.trim().toLowerCase();

export const registerUser = async (input: RegisterInput) => {
  const email = sanitizeEmail(input.email);
  const existing = await UserModel.findOne({ email });

  if (existing) {
    throw new ApiError(409, 'کاربری با این ایمیل وجود دارد.');
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await UserModel.create({
    name: input.name,
    email,
    password: hashedPassword,
    phone: input.phone,
    telegram: input.telegram
  });

  return user;
};

export const authenticateUser = async (input: LoginInput) => {
  const email = sanitizeEmail(input.email);
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new ApiError(401, 'ایمیل یا رمز عبور نامعتبر است.');
  }

  const isValid = await bcrypt.compare(input.password, user.password);

  if (!isValid) {
    throw new ApiError(401, 'ایمیل یا رمز عبور نامعتبر است.');
  }

  return user;
};

export const signAccessToken = (user: UserDocument) => {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };

  const secret: Secret = env.JWT_SECRET;
  const expiresIn = env.JWT_EXPIRES_IN as SignOptions['expiresIn'];
  const options: SignOptions = {
    expiresIn
  };

  return jwt.sign(payload, secret, options);
};
