import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { adminCreateUserSchema } from '../validations/index.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Only ADMIN can manage users
router.use(authenticate, requireRole(['ADMIN']));

router.post('/', validateBody(adminCreateUserSchema), UserController.createUser);
router.get('/', UserController.getUsers);
router.get('/available-owners', UserController.getAvailableStoreOwners);
router.get('/:id', UserController.getUserById);

export default router;
