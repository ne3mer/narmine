import { GameRequestModel } from '../models/gameRequest.model';
import { ApiError } from '../middleware/errorHandler';
import type { z } from 'zod';
import type { createGameRequestSchema, updateGameRequestStatusSchema } from '../schemas/gameRequest.schema';

type CreateGameRequestInput = z.infer<typeof createGameRequestSchema>['body'];
type UpdateGameRequestStatusInput = z.infer<typeof updateGameRequestStatusSchema>['body'];

export const createGameRequest = async (userId: string, input: CreateGameRequestInput) => {
  const request = await GameRequestModel.create({
    ...input,
    userId
  });
  return request;
};

export const getUserGameRequests = async (userId: string) => {
  return GameRequestModel.find({ userId }).sort({ createdAt: -1 });
};

export const getAllGameRequests = async (status?: string) => {
  const query = status ? { status } : {};
  const requests = await GameRequestModel.find(query)
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 });
    
  const stats = await getGameRequestStats();
  
  return {
    data: requests,
    statistics: stats
  };
};

export const getGameRequestStats = async () => {
  const total = await GameRequestModel.countDocuments();
  const pending = await GameRequestModel.countDocuments({ status: 'pending' });
  const approved = await GameRequestModel.countDocuments({ status: 'approved' });
  const rejected = await GameRequestModel.countDocuments({ status: 'rejected' });
  const completed = await GameRequestModel.countDocuments({ status: 'completed' });
  
  return {
    total,
    pending,
    approved,
    rejected,
    completed
  };
};

export const updateGameRequestStatus = async (id: string, input: UpdateGameRequestStatusInput) => {
  const request = await GameRequestModel.findByIdAndUpdate(
    id,
    { 
      status: input.status,
      adminNote: input.adminNote
    },
    { new: true }
  );
  
  if (!request) {
    throw new ApiError(404, 'Request not found');
  }
  
  return request;
};

export const deleteGameRequest = async (id: string) => {
  const request = await GameRequestModel.findByIdAndDelete(id);
  
  if (!request) {
    throw new ApiError(404, 'Request not found');
  }
  
  return request;
};
