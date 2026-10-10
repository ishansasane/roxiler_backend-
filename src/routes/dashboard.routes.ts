import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate, requireRole(['ADMIN']));

router.get('/admin', DashboardController.getAdminStats);

export default router;
