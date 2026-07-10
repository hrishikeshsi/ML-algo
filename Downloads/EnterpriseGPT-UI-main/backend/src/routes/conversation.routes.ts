import { Router } from 'express';
import * as conversationController from '../controllers/conversation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { conversationIdParamSchema, createConversationSchema } from '../validators/conversation.validator';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /conversations:
 *   get:
 *     tags: [Conversations]
 *     summary: List the authenticated user's conversations
 *     responses:
 *       200:
 *         description: Array of conversations
 */
router.get('/', conversationController.listConversations);

/**
 * @openapi
 * /conversations:
 *   post:
 *     tags: [Conversations]
 *     summary: Create a new conversation (also starts a thread with the Purple Fabric agent)
 *     responses:
 *       201:
 *         description: Created conversation
 */
router.post('/', validate(createConversationSchema), conversationController.createConversation);

/**
 * @openapi
 * /conversations/{id}:
 *   get:
 *     tags: [Conversations]
 *     summary: Get a single conversation by id
 *     responses:
 *       200:
 *         description: Conversation
 *       404:
 *         description: Not found
 */
router.get('/:id', validate(conversationIdParamSchema), conversationController.getConversation);

/**
 * @openapi
 * /conversations/{id}:
 *   delete:
 *     tags: [Conversations]
 *     summary: Delete a conversation and its messages
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', validate(conversationIdParamSchema), conversationController.deleteConversation);

export default router;
