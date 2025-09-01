import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { v4 as uuid } from 'uuid';

import logger from './utils/logger';
import vmRoutes from './routes/vm.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middlewares/errorHandler';
import swaggerDocs from './utils/swagger';

import { cedarlingBootstrapProperties, cedarlingClient } from './utils/cedarlingUtils';

const app = express();
const PORT = process.env.PORT || 3000;
const store = new session.MemoryStore();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: 'super-secret',
    resave: false,
    saveUninitialized: false,
    store,
    cookie: undefined, // no Set-Cookie header
    genid: () => uuid(), // custom session ID generator
  }) as any,
);

// Middleware to read session ID from header
app.use((req, _res, next) => {
  const sid = req.header('x-session-id');
  if (sid) {
    (req as any).sessionID = sid;
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// api middleware
app.use('/api/auth', authRoutes);
app.use('/api/vm', vmRoutes);
app.use('/api/user', userRoutes);

// Error handler should be last middleware
app.use(errorHandler);

app.listen(PORT, () => {
  // cedarlingClient.initialize(cedarlingBootstrapProperties).catch(console.error);
  logger.info(`Server running on http://localhost:${PORT}`);
  swaggerDocs(app, Number(PORT));
});
