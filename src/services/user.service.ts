import bcrypt from 'bcryptjs';
import { prisma } from '../config/index.js';
import { UserRole } from '../types/index.js';

export interface UserQueryParams {
  search?: string;
  name?: string;
  email?: string;
  address?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class UserService {
  static async createUser(data: {
    name: string;
    email: string;
    address: string;
    password: string;
    role: UserRole;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      const error: any = new Error('A user with this email already exists');
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        address: data.address,
        password: hashedPassword,
        role: data.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  static async getUsers(params: UserQueryParams) {
    const {
      search,
      name,
      email,
      address,
      role,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 50,
    } = params;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { address: { contains: search } },
      ];
    } else {
      if (name) {
        where.name = { contains: name };
      }
      if (email) {
        where.email = { contains: email };
      }
      if (address) {
        where.address = { contains: address };
      }
    }

    if (role && ['ADMIN', 'USER', 'STORE_OWNER'].includes(role.toUpperCase())) {
      where.role = role.toUpperCase();
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        store: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: { rating: true },
            },
          },
        },
      },
    });

    // Compute store rating for store owners
    const formattedUsers = users.map((u) => {
      let storeRating: number | null = null;
      let storeName: string | null = null;
      let storeId: number | null = null;

      if (u.role === 'STORE_OWNER' && u.store) {
        storeName = u.store.name;
        storeId = u.store.id;
        const total = u.store.ratings.length;
        const sum = u.store.ratings.reduce((acc, r) => acc + r.rating, 0);
        storeRating = total > 0 ? Number((sum / total).toFixed(2)) : 0;
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        address: u.address,
        role: u.role,
        createdAt: u.createdAt,
        storeRating,
        storeName,
        storeId,
      };
    });

    // Sort users
    formattedUsers.sort((a, b) => {
      let valA: any = (a as any)[sortBy];
      let valB: any = (b as any)[sortBy];

      if (sortBy === 'rating' || sortBy === 'storeRating') {
        valA = a.storeRating ?? -1;
        valB = b.storeRating ?? -1;
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortOrder === 'asc' ? (valA ?? 0) - (valB ?? 0) : (valB ?? 0) - (valA ?? 0);
    });

    const total = formattedUsers.length;
    const startIndex = (page - 1) * limit;
    const paginatedUsers = formattedUsers.slice(startIndex, startIndex + limit);

    return {
      users: paginatedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserById(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        store: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            ratings: {
              select: {
                id: true,
                rating: true,
                createdAt: true,
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    let storeRating: number | null = null;
    let storeDetails: any = null;

    if (user.role === 'STORE_OWNER' && user.store) {
      const totalRatings = user.store.ratings.length;
      const sumRatings = user.store.ratings.reduce((acc, r) => acc + r.rating, 0);
      storeRating = totalRatings > 0 ? Number((sumRatings / totalRatings).toFixed(2)) : 0;
      storeDetails = {
        id: user.store.id,
        name: user.store.name,
        email: user.store.email,
        address: user.store.address,
        overallRating: storeRating,
        totalRatings,
      };
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
      storeRating,
      store: storeDetails,
    };
  }

  static async getAvailableStoreOwners() {
    // Returns STORE_OWNER users who are not yet assigned to any store
    const owners = await prisma.user.findMany({
      where: {
        role: 'STORE_OWNER',
        store: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return owners;
  }
}
