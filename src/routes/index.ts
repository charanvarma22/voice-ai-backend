import { Router, Request, Response } from 'express';
import auth from './auth.js';
import twilioRoutes from './twilio.js';
import callsRoutes from './calls.js';
import numbersRoutes from './numbers.js';
import agentRoutes from './agent.js';
import businessHoursRoutes from './business-hours.js';
import deviceRoutes from './device.js';
import billingRoutes from './billing.js';
import recapRoutes from './recap.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Voice AI Backend API v1' });
});

// Public routes
router.use('/', auth);
router.use('/', twilioRoutes); // Webhooks don't need auth

// Protected routes (require auth token)
router.use('/numbers', authMiddleware, numbersRoutes);
router.use('/agent', authMiddleware, agentRoutes);
router.use('/business-hours', authMiddleware, businessHoursRoutes);
router.use('/device', authMiddleware, deviceRoutes);
router.use('/billing', authMiddleware, billingRoutes);
router.use('/calls', authMiddleware, callsRoutes);
router.use('/recap', authMiddleware, recapRoutes);

export default router;

