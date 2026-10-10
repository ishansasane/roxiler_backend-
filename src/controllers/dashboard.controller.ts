import { Response } from 'express';
import { DashboardService } from '../services/dashboard.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export class DashboardController {
  static async getAdminStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stats = await DashboardService.getAdminStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error fetching admin dashboard statistics',
      });
    }
  }
}
