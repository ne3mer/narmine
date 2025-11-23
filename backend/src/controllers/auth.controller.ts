import type { Request, Response } from 'express';
import { authenticateUser, registerUser, signAccessToken } from '../services/auth.service';

const respondWithAuthPayload = (res: Response, user: any, status = 200) => {
  const token = signAccessToken(user);
  res.status(status).json({
    data: {
      token,
      user: user.toJSON()
    }
  });
};

export const register = async (req: Request, res: Response) => {
  const user = await registerUser(req.body);
  respondWithAuthPayload(res, user, 201);
};

export const login = async (req: Request, res: Response) => {
  const user = await authenticateUser(req.body);
  respondWithAuthPayload(res, user);
};
