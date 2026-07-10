import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    conversationId: z.string().uuid('conversationId must be a valid UUID').optional(),
    message: z.string().trim().min(1, 'message is required').max(8000, 'message is too long'),
  }),
});

export const conversationIdRouteParamSchema = z.object({
  params: z.object({
    conversationId: z.string().uuid('conversationId must be a valid UUID'),
  }),
});

export type SendMessageBody = z.infer<typeof sendMessageSchema>['body'];
