import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validateResource } from '../middleware/validateResource';
import { adminAuth } from '../middleware/adminAuth';
import * as userController from '../controllers/user.controller';
import {
  getAllUsersSchema,
  getUserByIdSchema,
  updateUserRoleSchema,
  updateUserSchema,
  deleteUserSchema,
  sendUserMessageSchema,
  getUserInsightsSchema
} from '../schemas/user.schema';

const router = Router();

// All user management routes require admin authentication
router.use(adminAuth);

router.get('/', validateResource(getAllUsersSchema), asyncHandler(userController.getAllUsers));
router.post('/messages', validateResource(sendUserMessageSchema), asyncHandler(userController.sendUserMessage));
router.get('/:id/insights', validateResource(getUserInsightsSchema), asyncHandler(userController.getUserInsights));
router.get('/:id', validateResource(getUserByIdSchema), asyncHandler(userController.getUserById));
router.patch('/:id/role', validateResource(updateUserRoleSchema), asyncHandler(userController.updateUserRole));
router.patch('/:id', validateResource(updateUserSchema), asyncHandler(userController.updateUser));
router.delete('/:id', validateResource(deleteUserSchema), asyncHandler(userController.deleteUser));

export default router;
