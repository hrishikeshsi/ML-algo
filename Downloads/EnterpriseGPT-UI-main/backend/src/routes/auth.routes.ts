import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user (and organization, if organizationId is not provided)
 *     security: []
 *     responses:
 *       201:
 *         description: Registration successful, returns user + JWT tokens
 *       409:
 *         description: Email already registered
 */
router.post('/register', authRateLimiter, validate(registerSchema), authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate with email and password
 *     security: []
 *     responses:
 *       200:
 *         description: Login successful, returns user + JWT tokens
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke a refresh token
 *     security: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', validate(refreshTokenSchema), authController.logout);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange a valid refresh token for a new access/refresh token pair (rotates the refresh token)
 *     security: []
 *     responses:
 *       200:
 *         description: New token pair issued
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset email
 *     security: []
 *     responses:
 *       200:
 *         description: Always returns success to avoid leaking which emails are registered
 */
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset a password using a token emailed by forgot-password
 *     security: []
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token
 */
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), authController.resetPassword);

export default router;
