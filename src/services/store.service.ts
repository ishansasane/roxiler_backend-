import { prisma } from '../config/index.js';

export interface StoreQueryParams {
  search?: string;
  name?: string;
  address?: string;
  email?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  currentUserId?: number;
}

export class StoreService {
  static async createStore(data: {
    name: string;
    email: string;
    address: string;
    ownerId?: number | null;
  }) {
    // If ownerId provided, verify user exists and is a STORE_OWNER
    if (data.ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: data.ownerId },
        include: { store: true },
      });

      if (!owner) {
        const error: any = new Error('Selected store owner user does not exist');
        error.statusCode = 404;
        throw error;
      }

      if (owner.role !== 'STORE_OWNER') {
        const error: any = new Error('Selected user does not have the STORE_OWNER role');
        error.statusCode = 400;
        throw error;
      }

      if (owner.store) {
        const error: any = new Error('Selected owner is already assigned to another store');
        error.statusCode = 400;
        throw error;
      }
    }

    const store = await prisma.store.create({
      data: {
        name: data.name,
        email: data.email,
        address: data.address,
        ownerId: data.ownerId || null,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return store;
  }

  static async getStores(params: StoreQueryParams) {
    const {
      search,
      name,
      address,
      email,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 50,
      currentUserId,
    } = params;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
      ];
    } else {
      if (name) {
        where.name = { contains: name };
      }
      if (address) {
        where.address = { contains: address };
      }
      if (email) {
        where.email = { contains: email };
      }
    }

    // Fetch stores with their ratings and owner
    const stores = await prisma.store.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        ratings: {
          select: {
            id: true,
            rating: true,
            userId: true,
            createdAt: true,
          },
        },
      },
    });

    // Compute average ratings and userSubmittedRating
    const computedStores = stores.map((store) => {
      const totalRatings = store.ratings.length;
      const sumRatings = store.ratings.reduce((acc, r) => acc + r.rating, 0);
      const overallRating = totalRatings > 0 ? Number((sumRatings / totalRatings).toFixed(2)) : 0;

      let userSubmittedRating: number | null = null;
      if (currentUserId) {
        const userRating = store.ratings.find((r) => r.userId === currentUserId);
        if (userRating) {
          userSubmittedRating = userRating.rating;
        }
      }

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner: store.owner,
        overallRating,
        totalRatings,
        userSubmittedRating,
        createdAt: store.createdAt,
      };
    });

    // Sort the stores
    computedStores.sort((a, b) => {
      let valA: any = (a as any)[sortBy];
      let valB: any = (b as any)[sortBy];

      if (sortBy === 'rating' || sortBy === 'overallRating') {
        valA = a.overallRating;
        valB = b.overallRating;
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    const total = computedStores.length;
    const startIndex = (page - 1) * limit;
    const paginatedStores = computedStores.slice(startIndex, startIndex + limit);

    return {
      stores: paginatedStores,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getStoreById(storeId: number, currentUserId?: number) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        ratings: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!store) {
      const error: any = new Error('Store not found');
      error.statusCode = 404;
      throw error;
    }

    const totalRatings = store.ratings.length;
    const sumRatings = store.ratings.reduce((acc, r) => acc + r.rating, 0);
    const overallRating = totalRatings > 0 ? Number((sumRatings / totalRatings).toFixed(2)) : 0;

    let userSubmittedRating: number | null = null;
    if (currentUserId) {
      const userRating = store.ratings.find((r) => r.userId === currentUserId);
      if (userRating) {
        userSubmittedRating = userRating.rating;
      }
    }

    return {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      owner: store.owner,
      overallRating,
      totalRatings,
      userSubmittedRating,
      ratings: store.ratings.map((r) => ({
        id: r.id,
        rating: r.rating,
        user: r.user,
        createdAt: r.createdAt,
      })),
      createdAt: store.createdAt,
    };
  }
}
