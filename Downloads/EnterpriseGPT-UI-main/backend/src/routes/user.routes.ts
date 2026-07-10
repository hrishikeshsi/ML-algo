import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateUserSchema } from '../validators/user.validator';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get the authenticated user's profile
 *     responses:
 *       200:
 *         description: Current user profile
 */
router.get('/me', userController.getMe);

/**
 * @openapi
 * /users/me:
 *   put:
 *     tags: [Users]
 *     summary: Update the authenticated user's profile
 *     responses:
 *       200:
 *         description: Updated user profile
 */
router.put('/me', validate(updateUserSchema), userController.updateMe);

/**
 * @openapi
 * /users/me:
 *   delete:
 *     tags: [Users]
 *     summary: Delete the authenticated user's account
 *     responses:
 *       200:
 *         description: Account deleted
 */
router.delete('/me', userController.deleteMe);

export default router;
