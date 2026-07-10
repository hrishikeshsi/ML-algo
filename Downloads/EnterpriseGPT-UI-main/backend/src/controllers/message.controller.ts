import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { messageService } from '../services/message.service';

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const result = await messageService.sendChatMessage(req.user!.id, req.body);
  res.status(200).json(ApiResponse.success(result, 'Message sent successfully'));
});

export const listMessages = asyncHandler(async (req: Request, res: Response) => {
  const messages = await messageService.listForConversation(req.params.conversationId, req.user!.id);
  res.status(200).json(ApiResponse.success(messages));
});
