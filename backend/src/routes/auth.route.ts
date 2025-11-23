import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';
import { validateResource } from '../middleware/validateResource';
import { asyncHandler } from '../utils/asyncHandler';
import { loginSchema, registerSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/register', validateResource(registerSchema), asyncHandler(register));
router.post('/login', validateResource(loginSchema), asyncHandler(login));

export default router;
