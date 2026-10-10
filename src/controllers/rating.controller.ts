import { Response } from 'express';
import { RatingService } from '../services/rating.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export class RatingController {
  static async submitRating(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const storeId = parseInt(req.params.storeId as string, 10);
      if (isNaN(storeId)) {
        res.status(400).json({ success: false, message: 'Invalid store ID' });
        return;
      }

      const { rating } = req.body;
      const result = await RatingService.submitOrUpdateRating(req.user.id, storeId, rating);

      res.status(200).json({
        success: true,
        message: 'Rating submitted successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error submitting rating',
      });
    }
  }

  static async getOwnerStoreRatings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { sortBy, sortOrder, page, limit } = req.query;
      const result = await RatingService.getStoreRatingsForOwner(req.user.id, {
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error fetching store ratings',
      });
    }
  }
}
