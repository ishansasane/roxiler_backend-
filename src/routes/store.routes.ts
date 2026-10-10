import { Router } from 'express';
import { StoreController } from '../controllers/store.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { adminCreateStoreSchema } from '../validations/index.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// All store routes require authentication
router.use(authenticate);

// Admin can create a new store
router.post('/', requireRole(['ADMIN']), validateBody(adminCreateStoreSchema), StoreController.createStore);

// All authenticated roles (Admin, User, Store Owner) can list and view stores
router.get('/', StoreController.getStores);
router.get('/:id', StoreController.getStoreById);

export default router;
