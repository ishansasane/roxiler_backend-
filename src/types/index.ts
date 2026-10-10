import { Request } from 'express';

export type UserRole = 'ADMIN' | 'USER' | 'STORE_OWNER';

export interface AuthUserPayload {
  id: number;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export interface PaginationAndSortQuery {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  role?: string;
  name?: string;
  email?: string;
  address?: string;
}
