import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { getSettings, updateSettings, getDueSoonTasks } from '../controllers/settingsController.js';

const router = Router();

// All settings routes require authentication
router.use(authenticate);

router.get('/', getSettings);
router.put('/', updateSettings);
router.get('/notifications/due-soon', getDueSoonTasks);

export default router;
