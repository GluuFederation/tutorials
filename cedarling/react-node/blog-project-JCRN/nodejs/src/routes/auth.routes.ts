import { Router } from 'express';
import { findUserByEmail } from '../models/user.model';
import { generateToken, comparePasswords } from '../utils/auth';
import logger from '../utils/logger';
import { HttpException } from '../middlewares/errorHandler';
import querystring from 'querystring';
import { generateCodeChallenge, generateCodeVerifier } from '../utils/pkceUtils';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { User } from '../utils/types';

declare module 'express-session' {
  interface SessionData {
    access_token: string;
    id_token: string;
    refresh_token: string;
    user: User;
  }
}

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login an existing user, simulating oAuth token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *             example:
 *               email: dhoni@gluu.org
 *               password: dhoni@123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         username:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                     token:
 *                       type: string
 *       400:
 *         description: Bad request (missing fields)
 *       401:
 *         description: Unauthorized (invalid credentials)
 *       500:
 *         description: Internal server error
 */
router.get('/login', async (req, res, next) => {
  try {
    const authUrl =
      `${process.env.AUTH_ENDPOINT}?` +
      querystring.stringify({
        response_type: 'code',
        client_id: process.env.CLIENT_ID,
        redirect_uri: `${process.env.APP_URL}/api/auth/callback`,
        scope: 'openid profile email role offline_access permission',
      });

    res.redirect(authUrl);
  } catch (error) {
    next(error);
  }
});

router.get('/callback', async (req, res, next) => {
  const code = req.query.code as string;
  if (!code) {
    throw new HttpException(400, 'No authorization code returned');
  }
  try {
    const basicAuth = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString(
      'base64',
    );

    // Exchange code for tokens
    const response = await axios.post(
      process.env.TOKEN_ENDPOINT as string,
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.APP_URL}/api/auth/callback`,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`,
        },
      },
    );

    const { access_token, id_token, refresh_token } = response.data;
    const decodedIDTOken = jwtDecode(id_token) as User;
    req.session!.access_token = access_token;
    req.session!.id_token = id_token;
    req.session!.refresh_token = refresh_token;
    req.session!.user = decodedIDTOken;
    logger.info(`Decoded ID Token: ${JSON.stringify(decodedIDTOken)}`);

    const token = generateToken(decodedIDTOken.sub as string);

    // Set cookie with JWT
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // set to true if using HTTPS
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15,
    });

    res.redirect(`${process.env.FRONTEND_URL as string}/login`);
    // res.json({ id: 1 });
  } catch (err: any) {
    console.log(err);
    logger.error(err.response?.data || err.message);
    throw new HttpException(500, err.response?.data || err.message);
  }
});

export default router;
