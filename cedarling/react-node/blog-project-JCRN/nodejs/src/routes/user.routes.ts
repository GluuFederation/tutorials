import { Router } from 'express';
import logger from '../utils/logger';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Protect all routes with authentication middleware
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: User infromation
 *   description: Get user information
 */

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Get user information
 *     tags: [User info]
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               items:
 *                 $ref: '#/components/schemas/Userinfo'
 *       401:
 *         description: Unauthorized (invalid credentials)
 *       403:
 *         description: Forbidden (not enough permissions)
 *       500:
 *         description: Internal server error
 */
router.get('/me', (req, res) => {
  logger.info('Fetching user information');
  res.json({
    id: 1,
    role: 'admin',
  });
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Userinfo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           example: 1
 *         role:
 *           type: string
 *           example: Joe
 */

export default router;
