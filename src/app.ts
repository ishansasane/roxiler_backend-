import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Middleware: allow requests from local Vite dev server and deployed frontend
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(express.json());

// Root welcome endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Store Rating Platform API is running smoothly 🚀',
    version: '1.0.0',
    healthCheck: '/api/health',
    endpoints: {
      auth: '/api/auth',
      stores: '/api/stores',
      users: '/api/users',
      ratings: '/api/ratings',
      dashboard: '/api/dashboard',
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Store Rating Platform API',
  });
});

// Mount API routes
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
