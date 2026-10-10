import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { signupSchema, loginSchema, updatePasswordSchema } from '../validations/index.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/signup', validateBody(signupSchema), AuthController.signup);
router.post('/login', validateBody(loginSchema), AuthController.login);
router.patch('/update-password', authenticate, validateBody(updatePasswordSchema), AuthController.updatePassword);
router.get('/me', authenticate, AuthController.me);

export default router;
