import jwt from 'jsonwebtoken';
import logger from './logger';
import { HttpException } from '../middlewares/errorHandler';

const SECRET_KEY = process.env.JWT_SECRET ?? 'your-very-secure-secret-key';

export const generateToken = (user: { id: string; role: string }): string => {
  return jwt.sign(user, SECRET_KEY, {
    algorithm: 'HS256',
    expiresIn: '1h',
  });
};

export const verifyToken = (token: string): { id: string } => {
  try {
    return jwt.verify(token, SECRET_KEY) as { id: string };
  } catch (error) {
    logger.error(`Token verification failed: ${error}`);
    throw new HttpException(401, 'Invalid or expired token');
  }
};

export const comparePasswords = async (
  inputPassword: string,
  validPassword: string,
): Promise<boolean> => {
  return inputPassword === validPassword;
};
