import { Response } from 'express';
import { StoreService } from '../services/store.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export class StoreController {
  static async createStore(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const store = await StoreService.createStore(req.body);
      res.status(201).json({
        success: true,
        message: 'Store registered successfully',
        data: store,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error registering store',
      });
    }
  }

  static async getStores(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { search, name, address, email, sortBy, sortOrder, page, limit } = req.query;
      const currentUserId = req.user?.id;

      const result = await StoreService.getStores({
        search: search as string,
        name: name as string,
        address: address as string,
        email: email as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
        currentUserId,
      });

      res.status(200).json({
        success: true,
        data: result.stores,
        pagination: result.pagination,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error fetching stores',
      });
    }
  }

  static async getStoreById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const storeId = parseInt(req.params.id as string, 10);
      if (isNaN(storeId)) {
        res.status(400).json({ success: false, message: 'Invalid store ID' });
        return;
      }

      const currentUserId = req.user?.id;
      const store = await StoreService.getStoreById(storeId, currentUserId);
      res.status(200).json({
        success: true,
        data: store,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error fetching store details',
      });
    }
  }
}
