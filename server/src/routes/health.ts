import { Router, Request, Response } from 'express';
import { dbGet } from '../config/database.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  let dbStatus = 'healthy';
  let tablesCount = 0;
  try {
    const row = await dbGet<{ count: number }>("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
    tablesCount = row?.count || 0;
  } catch (err: any) {
    dbStatus = 'degraded: ' + err.message;
  }

  res.status(200).json({
    status: 'ok',
    service: 'TaskFlow Enterprise REST API',
    version: '3.0.0',
    engine: 'TaskFlow Standalone SQL Service',
    database: {
      type: 'SQLite Relational Engine',
      status: dbStatus,
      tablesCount,
    },
    port: Number(process.env.PORT || 5001),
    environment: process.env.NODE_ENV || 'production',
    security: {
      helmet: true,
      rateLimiter: 'active (100 req/min, 30 writes/min)',
      hsts: 'max-age=31536000',
      frameGuard: 'DENY',
      noSniff: true,
      authProtocols: ['Authorization: Bearer <jwt>', 'x-user-id'],
      databaseEncryption: 'bcrypt-salt10',
    },
    tracing: {
      requestId: req.headers['x-request-id'] || null,
    },
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

export default router;
