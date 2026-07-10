import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { conversationService } from '../services/conversation.service';

export const listConversations = asyncHandler(async (req: Request, res: Response) => {
  const conversations = await conversationService.listForUser(req.user!.id);
  res.status(200).json(ApiResponse.success(conversations));
});

export const createConversation = asyncHandler(async (req: Request, res: Response) => {
  const conversation = await conversationService.createForUser(req.user!.id, req.body);
  res.status(201).json(ApiResponse.success(conversation, 'Conversation created successfully'));
});

export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const conversation = await conversationService.getForUser(req.params.id, req.user!.id);
  res.status(200).json(ApiResponse.success(conversation));
});

export const deleteConversation = asyncHandler(async (req: Request, res: Response) => {
  await conversationService.deleteForUser(req.params.id, req.user!.id);
  res.status(200).json(ApiResponse.success(null, 'Conversation deleted successfully'));
});
