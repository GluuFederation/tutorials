import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from './utils/logger';
import vmRoutes from './routes/vm.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middlewares/errorHandler';
import swaggerDocs from './utils/swagger';
import { cedarlingBootstrapProperties, cedarlingClient } from './utils/cedarlingUtils';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());

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
