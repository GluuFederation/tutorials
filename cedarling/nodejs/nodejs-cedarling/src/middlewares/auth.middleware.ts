import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import logger from '../utils/logger';
import { findUserById } from '../models/user.model';
import { HttpException } from './errorHandler';
import { cedarlingClient } from '../utils/cedarlingUtils';

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
    logger.info(`Token ${token} Decoded ${JSON.stringify(decoded)}`);

    // Cedarling authorization
    const request = {
      tokens: {
        access_token: token,
        id_token: token,
      },
      action: `Jans::Action::"Compare"`,
      resource: {
        type: 'Jans::Application',
        id: 'App',
        app_id: 'App',
        name: 'App',
        url: {
          host: 'jans.test',
          path: '/',
          protocol: 'http',
        },
      },
      context: {},
    };

    logger.info(`Request: ${JSON.stringify(request)}`);

    const result = await cedarlingClient.authorize(request);
    logger.info(`Authentication result: ${result.decision}`);
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    logger.error(`Authentication failed: ${error}`);
    next(error);
  }
};
