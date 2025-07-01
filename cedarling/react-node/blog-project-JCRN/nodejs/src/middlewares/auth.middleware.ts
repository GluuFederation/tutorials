import { Request, Response, NextFunction } from 'express';
import { getAction, verifyToken } from '../utils/auth';
import logger from '../utils/logger';
import { findUserById } from '../models/user.model';
import { HttpException } from './errorHandler';
import { cedarlingClient } from '../utils/cedarlingUtils';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
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
      action: `Jans::Action::"${getAction(req)}"`,
      resource: {
        type: 'Jans::VirtualMachine',
        id: 'CloudInfrastructure',
        app_id: 'CloudInfrastructure',
        name: 'CloudInfrastructure',
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

    if (!result.decision) {
      throw new HttpException(403, 'Permission denied!');
    }

    next();
  } catch (error) {
    logger.error(`Authentication failed: ${error}`);
    next(error);
  }
};
