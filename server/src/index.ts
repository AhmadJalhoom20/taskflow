import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import tasksRouter from './routes/tasks.js';
import metricsRouter from './routes/metrics.js';
import { initDatabase } from './config/database.js';
import { errorHandler } from './middlewares/errorHandler.js';
import {
  enterpriseHeaders,
  enterpriseHelmet,
} from './middlewares/security.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Trust reverse proxy for accurate client IP identification in rate limiting
app.set('trust proxy', 1);

// 1. Enterprise Security Headers & Request Tracing (stamped first in pipeline)
app.use(enterpriseHeaders);

// 2. Strict Helmet Security Policies
app.use(enterpriseHelmet);

// 3. CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5001',
  'https://taskflow-taqat.apps.taqat.academy',
  'https://taskflow.apps.taqat.academy',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (/^https:\/\/([a-zA-Z0-9-]+\.)*taqat\.academy$/.test(origin)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  if (process.env.NODE_ENV !== 'production') return true;
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-user-email',
      'x-user-name',
      'x-request-id',
      'x-client-version',
      'x-request-source',
    ],
    exposedHeaders: [
      'X-Request-Id',
      'X-Response-Time',
      'X-Backend-Engine',
      'X-Database',
      'X-Security-Policy',
      'RateLimit-Limit',
      'RateLimit-Remaining',
      'RateLimit-Reset',
      'Retry-After',
    ],
  })
);

// 4. Rate Limiting Middlewares (Temporarily disabled upon request)
// app.use(generalRateLimiter);
// app.use(mutationRateLimiter);

// 5. Body Parsers & HTTP Access Logging
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan('combined'));

// 6. Root API Service Directory
app.get('/', (req, res) => {
  res.json({
    service: 'TaskFlow Enterprise REST API',
    version: '3.0.0',
    status: 'online',
    engine: 'TaskFlow Standalone SQL Service',
    description: 'Mission-critical SQL backed project and task management system built for high throughput and reliability.',
    healthCheck: '/api/health',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
      },
      projects: {
        list: 'GET /api/projects',
        create: 'POST /api/projects',
        get: 'GET /api/projects/:id',
        update: 'PATCH /api/projects/:id',
        delete: 'DELETE /api/projects/:id',
        addMember: 'POST /api/projects/:id/members',
        removeMember: 'DELETE /api/projects/:id/members/:memberId',
      },
      tasks: {
        list: 'GET /api/projects/:id/tasks',
        create: 'POST /api/projects/:id/tasks',
        update: 'PATCH /api/projects/:id/tasks/:taskId',
        delete: 'DELETE /api/projects/:id/tasks/:taskId',
      },
      metrics: 'GET /api/metrics',
    },
    timestamp: new Date().toISOString(),
  });
});

// 7. Route Registration
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/projects/:id/tasks', tasksRouter);
app.use('/api/metrics', metricsRouter);

// 7. 404 Catch-All Handler
app.use((req, res) => {
  res.status(404).json({
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    code: 'NOT_FOUND',
    requestId: req.headers['x-request-id'] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

// 8. Centralized Error Handling Middleware
app.use(errorHandler);

// Bootstrap SQLite database and start HTTP listener
async function startServer() {
  try {
    await initDatabase();
    console.log('[TaskFlow Enterprise API] SQLite Database initialized and verified.');

    const server = app.listen(PORT, () => {
      console.log(`[TaskFlow Enterprise API] Service running on http://localhost:${PORT}`);
      console.log(`[TaskFlow Enterprise API] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[TaskFlow Enterprise API] Target Domain: https://taskflow-taqat.apps.taqat.acadamay`);
      console.log(`[TaskFlow Enterprise API] Pure SQL Engine: SQLite WAL mode enabled`);
      console.log(`[TaskFlow Enterprise API] Security Policies & Rate Limiting: ACTIVE`);
    });

    // Graceful Shutdown
    const shutdown = (signal: string) => {
      console.log(`[TaskFlow Enterprise API] Received ${signal}. Initiating clean shutdown...`);
      server.close(() => {
        console.log('[TaskFlow Enterprise API] HTTP listener closed. Exiting process.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('[TaskFlow Enterprise API] Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

export default app;
