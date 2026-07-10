import { z } from 'zod';

export const createConversationSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
  }),
});

export const conversationIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('id must be a valid UUID'),
  }),
});

export type CreateConversationBody = z.infer<typeof createConversationSchema>['body'];
