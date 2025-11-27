import type { Request, Response } from 'express';
import * as gameRequestService from '../services/gameRequest.service';

export const createGameRequest = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const request = await gameRequestService.createGameRequest(userId, req.body);
  
  res.status(201).json({
    success: true,
    data: request
  });
};

export const getUserGameRequests = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const requests = await gameRequestService.getUserGameRequests(userId);
  
  res.json(requests);
};

export const getAllGameRequests = async (req: Request, res: Response) => {
  const { status } = req.query;
  const result = await gameRequestService.getAllGameRequests(status as string);
  
  res.json(result);
};

export const updateGameRequestStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const request = await gameRequestService.updateGameRequestStatus(id, req.body);
  
  res.json(request);
};

export const deleteGameRequest = async (req: Request, res: Response) => {
  const { id } = req.params;
  await gameRequestService.deleteGameRequest(id);
  
  res.json({ success: true, message: 'Request deleted successfully' });
};
