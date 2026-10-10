import { prisma } from '../config/index.js';

export interface OwnerRatingsQueryParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class RatingService {
  static async submitOrUpdateRating(userId: number, storeId: number, ratingValue: number) {
    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      const error: any = new Error('Store not found');
      error.statusCode = 404;
      throw error;
    }

    // Upsert rating for this user and store
    const ratingRecord = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      update: {
        rating: ratingValue,
      },
      create: {
        userId,
        storeId,
        rating: ratingValue,
      },
      include: {
        store: {
          select: { id: true, name: true },
        },
      },
    });

    // Compute updated average rating for the store
    const storeRatings = await prisma.rating.findMany({
      where: { storeId },
      select: { rating: true },
    });

    const totalRatings = storeRatings.length;
    const sumRatings = storeRatings.reduce((sum, r) => sum + r.rating, 0);
    const overallRating = totalRatings > 0 ? Number((sumRatings / totalRatings).toFixed(2)) : 0;

    return {
      rating: ratingRecord,
      overallRating,
      totalRatings,
    };
  }

  static async getStoreRatingsForOwner(ownerUserId: number, params: OwnerRatingsQueryParams) {
    const { sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 50 } = params;

    // Find the store owned by this user
    const store = await prisma.store.findUnique({
      where: { ownerId: ownerUserId },
    });

    if (!store) {
      const error: any = new Error('You do not own any registered store');
      error.statusCode = 404;
      throw error;
    }

    const ratings = await prisma.rating.findMany({
      where: { storeId: store.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
          },
        },
      },
    });

    // Compute store overall stats
    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRatings > 0 ? Number((sumRatings / totalRatings).toFixed(2)) : 0;

    // Format list of users who submitted ratings
    const formattedRatings = ratings.map((r) => ({
      id: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      userId: r.user.id,
      userName: r.user.name,
      userEmail: r.user.email,
      userAddress: r.user.address,
    }));

    // Sorting
    formattedRatings.sort((a, b) => {
      let valA: any = (a as any)[sortBy];
      let valB: any = (b as any)[sortBy];

      if (sortBy === 'name' || sortBy === 'userName') {
        valA = a.userName;
        valB = b.userName;
      } else if (sortBy === 'email' || sortBy === 'userEmail') {
        valA = a.userEmail;
        valB = b.userEmail;
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      if (valA instanceof Date) {
        return sortOrder === 'asc'
          ? valA.getTime() - valB.getTime()
          : valB.getTime() - valA.getTime();
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    const startIndex = (page - 1) * limit;
    const paginatedRatings = formattedRatings.slice(startIndex, startIndex + limit);

    return {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
        totalRatings,
      },
      ratings: paginatedRatings,
      pagination: {
        total: totalRatings,
        page,
        limit,
        totalPages: Math.ceil(totalRatings / limit),
      },
    };
  }
}
