import { Router } from 'express';
import logger from '../utils/logger';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Protect all routes with authentication middleware
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Articles
 *   description: Article management
 */

/**
 * @swagger
 * /api/vm:
 *   get:
 *     summary: Get all articles
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: List of articles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Articles'
 *       401:
 *         description: Unauthorized (invalid credentials)
 *       403:
 *         description: Forbidden (not enough permissions)
 *       500:
 *         description: Internal server error
 */
router.get('/', (req, res) => {
  logger.info('Fetching all articles');
  res.json([
    {
      id: 1,
      name: 'Janssen Project is a Digital Public Good',
      content:
        'Citizens want to use the Internet to connect to their government for a myriad of reasons...',
      status: 'Draft',
    },
    {
      id: 2,
      name: 'Multi Master Multi-Cluster LDAP (OpenDJ) replication in Kubernetes? A controversial view',
      content:
        'OpenDJ is a Lightweight Directory Access Protocol (LDAP) compliant distributed directory written in Java...',
      status: 'Draft',
    },
    {
      id: 3,
      name: 'Gluu Flex Roadmap',
      content:
        'As Flex is a commercial distribution of the Janssen Project, check the Janssen Nightly Build changelog and issues....',
      status: 'Published',
    },
  ]);
});

/**
 * @swagger
 * /api/vm:
 *   post:
 *     summary: Create a new article
 *     tags: [Articles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArticlesInput'
 *     responses:
 *       201:
 *         description: Article created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Articles'
 *       400:
 *         description: Bad request (missing or invalid fields)
 *       401:
 *         description: Unauthorized (invalid credentials)
 *       403:
 *         description: Forbidden (not enough permissions)
 *       500:
 *         description: Internal server error
 */
router.post('/', (req, res) => {
  logger.info('Creating articles');
  res.status(201).json({}); // Properly send status and response
});

/**
 * @swagger
 * /api/vm:
 *   put:
 *     summary: Update articles
 *     tags: [Articles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/ArticlesUpdate'
 *     responses:
 *       204:
 *         description: Articles updated successfully
 *       400:
 *         description: Bad request (missing or invalid fields)
 *       401:
 *         description: Unauthorized (invalid credentials)
 *       403:
 *         description: Forbidden (not enough permissions)
 *       500:
 *         description: Internal server error
 */
router.put('/', (req, res) => {
  logger.info('Updating articles');
  res.status(204).json({});
});

/**
 * @swagger
 * /api/vm/{id}:
 *   delete:
 *     summary: Delete a article by ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the article to delete
 *     responses:
 *       204:
 *         description: Article deleted successfully
 *       401:
 *         description: Unauthorized (invalid credentials)
 *       403:
 *         description: Forbidden (not enough permissions)
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', (req, res) => {
  const vmId = parseInt(req.params.id);
  logger.info(`Deleting article with ID: ${vmId}`);
  res.status(204).json({});
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Articles:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           example: 1
 *         name:
 *           type: string
 *           example: Janssen
 *         content:
 *           type: string
 *           example: Auth 2.0 service
 *         status:
 *           type: string
 *           example: Draft
 *     ArticlesInput:
 *       type: object
 *       required:
 *         - name
 *         - content
 *         - status
 *       properties:
 *         name:
 *           type: string
 *           example: Janssen
 *         content:
 *           type: string
 *           example: Auth 2.0 service
 *         status:
 *           type: string
 *           example: Draft
 *     ArticlesUpdate:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           example: 1
 *         name:
 *           type: string
 *           example: Janssen
 *         content:
 *           type: string
 *           example: Auth 2.0 service
 *         status:
 *           type: string
 *           example: Draft
 */

export default router;
