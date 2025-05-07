import { Router } from 'express';
import { findUserByEmail } from '../models/user.model';
import { generateToken, comparePasswords } from '../utils/auth';
import logger from '../utils/logger';
import { HttpException } from '../middlewares/errorHandler';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new HttpException(400, 'Email and password are required');
    }

    const user = await findUserByEmail(email);
    if (!user) {
      throw new HttpException(401, 'Invalid credentials');
    }

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      throw new HttpException(401, 'Invalid credentials');
    }

    const token = generateToken(user);
    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
