import jwt from 'jsonwebtoken';
import logger from './logger';
import { HttpException } from '../middlewares/errorHandler';
import { Request } from 'express';

const SECRET_KEY = process.env.JWT_SECRET ?? 'your-very-secure-secret-key';

// Simulating OAuth token
export const generateToken = (user: { id: string; role: string[] }): string => {
  return jwt.sign(
    {
      ...user,
      iss: 'https://jans-ui.jans.io',
      token_type: 'Bearer',
      client_id: '01b8d980-b43c-455a-b8a6-98ba351bfe2b',
      aud: '01b8d980-b43c-455a-b8a6-98ba351bfe2b',
      jti: '6dV4hO0kQ3OaPJerJHNwgg',
      sub: '5a6130b1-2380-4a0f-94df-8af2214e395a',
    },
    SECRET_KEY,
    {
      algorithm: 'HS256',
      expiresIn: '1h',
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
    return 'Update';
  } else if (req.method === 'DELETE') {
    return 'Delete';
  } else {
    return 'Invalid';
  }
};
