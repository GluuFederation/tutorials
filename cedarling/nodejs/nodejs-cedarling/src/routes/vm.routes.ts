import { Router } from 'express';
import logger from '../utils/logger';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Protect all routes with authentication middleware
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Virtual Machines
 *   description: Virtual machine management
 */

/**
 * @swagger
 * /api/vm:
 *   get:
 *     summary: Get all virtual machines
 *     tags: [Virtual Machines]
 *     responses:
 *       200:
 *         description: List of virtual machines
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VirtualMachine'
 *       401:
 *         description: Unauthorized (invalid credentials)
 *       500:
 *         description: Internal server error
 */
router.get('/', (req, res) => {
  logger.info('Fetching all virtual machines');
  res.json([
    { id: 1, name: 'Ubuntu 22', storage: '40 GB', memory: '4 GB' },
    { id: 2, name: 'CentOS', storage: '50 GB', memory: '8 GB' },
  ]);
});

/**
 * @swagger
 * /api/vm:
 *   post:
 *     summary: Create a new virtual machine
 *     tags: [Virtual Machines]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VirtualMachineInput'
 *     responses:
 *       201:
 *         description: Virtual machine created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VirtualMachine'
 *       400:
 *         description: Bad request (missing or invalid fields)
 *       401:
 *         description: Unauthorized (invalid credentials)
 *       500:
 *         description: Internal server error
 */
router.post('/', (req, res) => {
  logger.info('Creating virtual machines');
  res.status(201).json({}); // Properly send status and response
});

/**
 * @swagger
 * /api/vm:
 *   put:
 *     summary: Update virtual machines
 *     tags: [Virtual Machines]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/VirtualMachineUpdate'
 *     responses:
 *       204:
 *         description: Virtual machines updated successfully
 *       400:
 *         description: Bad request (missing or invalid fields)
 *       401:
 *         description: Unauthorized (invalid credentials)
 *       500:
 *         description: Internal server error
 */
router.put('/', (req, res) => {
  logger.info('Updating virtual machines');
  res.status(204).json({});
});

/**
 * @swagger
 * components:
 *   schemas:
 *     VirtualMachine:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           example: 1
 *         name:
 *           type: string
 *           example: Ubuntu 22
 *         storage:
 *           type: string
 *           example: 40 GB
 *         memory:
 *           type: string
 *           example: 4 GB
 *     VirtualMachineInput:
 *       type: object
 *       required:
 *         - name
 *         - storage
 *         - memory
 *       properties:
 *         name:
 *           type: string
 *           example: Ubuntu 22
 *         storage:
 *           type: string
 *           example: 40 GB
 *         memory:
 *           type: string
 *           example: 4 GB
 *     VirtualMachineUpdate:
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
 *           example: Ubuntu 22.04 LTS
 *         storage:
 *           type: string
 *           example: 45 GB
 *         memory:
 *           type: string
 *           example: 4 GB
 */

export default router;
