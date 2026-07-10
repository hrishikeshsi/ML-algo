import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { sendMessageSchema } from '../validators/message.validator';

const router = Router();

/**
 * @openapi
 * /chat:
 *   post:
 *     tags: [Messages]
 *     summary: Send a message to the Purple Fabric agent (creates a conversation if conversationId is omitted)
 *     responses:
 *       200:
 *         description: The persisted user + agent message pair
 *       404:
 *         description: conversationId does not exist or does not belong to the caller
 *       502:
 *         description: Purple Fabric agent call failed
 */
router.post('/', authenticate, validate(sendMessageSchema), messageController.chat);

export default router;
