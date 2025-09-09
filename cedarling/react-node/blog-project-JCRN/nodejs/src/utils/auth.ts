import jwt from 'jsonwebtoken';
import logger from './logger';
import { HttpException } from '../middlewares/errorHandler';
import { Request } from 'express';

const SECRET_KEY = process.env.JWT_SECRET ?? 'your-very-secure-secret-key';

export const generateToken = (id: string): string => {
  return jwt.sign(
    {
      id,
    },
    SECRET_KEY,
    {
      algorithm: 'HS256',
      expiresIn: '5m',
    },
  );
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

export const getAction = (req: Request): string => {
  if (req.method === 'GET') {
    return 'View';
  } else if (req.method === 'POST') {
    return 'Create';
  } else if (req.method === 'PUT') {
    return 'Edit';
  } else if (req.method === 'DELETE') {
    return 'Delete';
  } else {
    return 'Invalid';
  }
};
