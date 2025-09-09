import { Request, Response, NextFunction } from 'express';
import { getAction, verifyToken } from '../utils/auth';
import logger from '../utils/logger';
import { HttpException } from './errorHandler';
import { cedarlingClient } from '../utils/cedarlingUtils';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new HttpException(401, 'Authentication token missing');
    }

    const decoded = verifyToken(token);
    logger.info(`Token ${token} Decoded ${JSON.stringify(decoded)}`);

    const sessionUser = req.session!.user;
    logger.info(`Session User: ${JSON.stringify(sessionUser)}`);
    if (!sessionUser) {
      throw new HttpException(401, 'User not found in session');
    }

    if (sessionUser && sessionUser.sub != decoded.id) {
      throw new HttpException(403, 'Invalid user');
    }

    const access_token = req.session!.access_token;
    const id_token = req.session!.id_token;
    if (!access_token || !id_token) {
      throw new HttpException(401, 'Tokens not found in session');
    }

    logger.info(`auth.middleware.ts: Access Token: ${access_token}`);
    logger.info(`auth.middleware.ts: ID Token: ${id_token}`);

    // Cedarling authorization
    const request = {
      tokens: {
        access_token,
        id_token,
      },
      action: `Jans::Action::"${getAction(req)}"`,
      resource: {
        name: 'JansBlogPlatform',
        cedar_entity_mapping: {
          entity_type: 'Jans::Article',
          id: 'JansBlogPlatform',
        },
        url: {
          host: 'jans.test',
          path: '/',
          protocol: 'http',
        },
      },
      context: {},
    };

    logger.info(`auth.middleware.ts: Request: ${JSON.stringify(request)}`);

    const result = await cedarlingClient.authorize(request);
    logger.info(`auth.middleware.ts: Authentication result: ${result.decision}`);

    if (!result.decision) {
      throw new HttpException(403, 'Permission denied!');
    }

    next();
  } catch (error) {
    logger.error(`auth.middleware.ts: Authentication failed: ${error}`);
    next(error);
  }
};
