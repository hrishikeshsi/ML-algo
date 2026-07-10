import { Router } from 'express';
import { Role } from '@prisma/client';
import * as adminController from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Admin]
 *     summary: Liveness/readiness probe (unauthenticated) — checks the database and Purple Fabric agent
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is degraded (database or Purple Fabric unreachable)
 */
router.get('/health', adminController.getHealth);

/**
 * @openapi
 * /logs:
 *   get:
 *     tags: [Admin]
 *     summary: Paginated API request/response audit log (Admin only)
 *     responses:
 *       200:
 *         description: Paginated logs
 *       403:
 *         description: Caller is not an admin
 */
router.get('/logs', authenticate, authorize(Role.ADMIN), adminController.getLogs);

/**
 * @openapi
 * /stats:
 *   get:
 *     tags: [Admin]
 *     summary: Aggregate system statistics (Admin only)
 *     responses:
 *       200:
 *         description: System statistics
 *       403:
 *         description: Caller is not an admin
 */
router.get('/stats', authenticate, authorize(Role.ADMIN), adminController.getStats);

export default router;
