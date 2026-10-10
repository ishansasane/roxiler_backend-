import { Router } from 'express';
import { RatingController } from '../controllers/rating.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { submitRatingSchema } from '../validations/index.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Store Owner can view ratings for their store
router.get('/owner', requireRole(['STORE_OWNER']), RatingController.getOwnerStoreRatings);

// Normal User can submit or modify a rating for a store
router.post('/:storeId', requireRole(['USER']), validateBody(submitRatingSchema), RatingController.submitRating);

export default router;
