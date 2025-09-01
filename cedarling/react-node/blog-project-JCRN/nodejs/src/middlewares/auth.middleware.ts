import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
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

    // Cedarling authorization
    // const request = {
    //   tokens: {
    //     access_token: token,
    //     id_token: token,
    //   },
    //   action: `Jans::Action::"${getAction(req)}"`,
    //   resource: {
    //     type: 'Jans::VirtualMachine',
    //     id: 'CloudInfrastructure',
    //     app_id: 'CloudInfrastructure',
    //     name: 'CloudInfrastructure',
    //     url: {
    //       host: 'jans.test',
    //       path: '/',
    //       protocol: 'http',
    //     },
    //   },
    //   context: {},
    // };

    // logger.info(`Request: ${JSON.stringify(request)}`);

    // const result = await cedarlingClient.authorize(request);
    // logger.info(`Authentication result: ${result.decision}`);

    // if (!result.decision) {
    //   throw new HttpException(403, 'Permission denied!');
    // }

    next();
  } catch (error) {
    logger.error(`Authentication failed: ${error}`);
    next(error);
  }
};
