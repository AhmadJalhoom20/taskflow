import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { getMetrics } from '../controllers/metricsController.js';

const router = Router();

router.use(authenticate);
router.get('/', getMetrics);

export default router;
