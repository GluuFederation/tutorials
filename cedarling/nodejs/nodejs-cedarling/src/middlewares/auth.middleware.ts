import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import logger from '../utils/logger';
import { findUserById } from '../models/user.model';
import { HttpException } from './errorHandler';

export const authenticate = async (req: any, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException(401, 'Authentication token missing');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await findUserById(decoded.id);

    if (!user) {
      throw new HttpException(401, 'User not found');
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    logger.error(`Authentication failed: ${error}`);
    next(error);
  }
};
