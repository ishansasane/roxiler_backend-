import { Response } from 'express';
import { UserService } from '../services/user.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export class UserController {
  static async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error creating user',
      });
    }
  }

  static async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { search, name, email, address, role, sortBy, sortOrder, page, limit } = req.query;
      const result = await UserService.getUsers({
        search: search as string,
        name: name as string,
        email: email as string,
        address: address as string,
        role: role as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
      });

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error fetching users',
      });
    }
  }

  static async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string, 10);
      if (isNaN(userId)) {
        res.status(400).json({ success: false, message: 'Invalid user ID' });
        return;
      }

      const user = await UserService.getUserById(userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error fetching user details',
      });
    }
  }

  static async getAvailableStoreOwners(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const owners = await UserService.getAvailableStoreOwners();
      res.status(200).json({
        success: true,
        data: owners,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error fetching store owners',
      });
    }
  }
}
