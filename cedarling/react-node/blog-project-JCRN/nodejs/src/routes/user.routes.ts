import { Router } from 'express';
import logger from '../utils/logger';
import { authenticate } from '../middlewares/auth.middleware';
import { HttpException } from '../middlewares/errorHandler';

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
  try {
    logger.info('Fetching user information');
    const sessionUser = req.session!.user;
    logger.info(`/me Session User: ${JSON.stringify(sessionUser)}`);
    res.json({
      id: sessionUser?.sub,
      role: sessionUser?.role,
      email: sessionUser?.email,
      name: sessionUser?.name,
      plan: sessionUser?.plan,
    });
  } catch (err: Error | any) {
    logger.error(err.response?.data || err.message);
    throw new HttpException(500, err.response?.data || err.message);
  }
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
