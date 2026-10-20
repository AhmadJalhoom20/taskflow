import { Router } from 'express';
import { register, login, getMe, listAllUsers } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import {
  registrationRateLimiter,
  authRateLimiter,
  resetRegistrationRateLimits,
} from '../middlewares/security.js';

const router = Router();

router.post('/register', registrationRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.get('/me', authenticate, getMe);
router.get('/users', authenticate, listAllUsers);

if (process.env.NODE_ENV !== 'production') {
  router.post('/reset-limiter', (_req, res) => {
    resetRegistrationRateLimits();
    res.json({ ok: true, message: 'Registration rate limiters reset.' });
  });
}

export default router;
