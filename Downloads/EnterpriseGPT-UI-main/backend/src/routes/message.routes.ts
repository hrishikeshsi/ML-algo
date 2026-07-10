import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { conversationIdRouteParamSchema } from '../validators/message.validator';

const router = Router();

/**
 * @openapi
 * /messages/{conversationId}:
 *   get:
 *     tags: [Messages]
 *     summary: List all messages for a conversation owned by the authenticated user
 *     responses:
 *       200:
 *         description: Array of messages, oldest first
 *       404:
 *         description: Conversation not found
 */
router.get(
  '/:conversationId',
  authenticate,
  validate(conversationIdRouteParamSchema),
  messageController.listMessages
);

export default router;
