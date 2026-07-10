import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import conversationRoutes from './conversation.routes';
import messageRoutes from './message.routes';
import chatRoutes from './chat.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/conversations', conversationRoutes);
router.use('/messages', messageRoutes);
router.use('/chat', chatRoutes);
router.use('/', adminRoutes);

export default router;
