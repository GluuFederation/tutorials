import { Router } from 'express';
import logger from '../utils/logger';
import { HttpException } from '../middlewares/errorHandler';

const router = Router();

router.get('/', (req, res) => {
  logger.info('Fetching all virtual machines');
  res.json([
    { id: 1, name: 'Ubuntu 22', storage: '40 GB', memory: '4 GB' },
    { id: 2, name: 'CentOS', storage: '50 GB', memory: '8 GB' },
  ]);
});

router.get('/:id', (req, res, next) => {
  const vmId = req.params.id;

  if (vmId === '0') {
    logger.warn('Attempt to access invalid vm ID');
    next(new HttpException(400, 'Invalid vm ID'));
    return;
  }

  logger.info(`Fetching vm with ID ${vmId}`);
  res.json({ id: 1, name: 'Ubuntu 22', storage: '40 GB', memory: '4 GB' });
});

export default router;
