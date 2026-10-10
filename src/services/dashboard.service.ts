import { prisma } from '../config/index.js';

export class DashboardService {
  static async getAdminStats() {
    const [totalUsers, totalStores, totalRatings, userRolesBreakdown, recentStores, recentRatings] =
      await Promise.all([
        prisma.user.count(),
        prisma.store.count(),
        prisma.rating.count(),
        prisma.user.groupBy({
          by: ['role'],
          _count: {
            role: true,
          },
        }),
        prisma.store.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            ratings: {
              select: { rating: true },
            },
            owner: {
              select: { name: true, email: true },
            },
          },
        }),
        prisma.rating.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true } },
            store: { select: { id: true, name: true } },
          },
        }),
      ]);

    const rolesMap: Record<string, number> = {
      ADMIN: 0,
      USER: 0,
      STORE_OWNER: 0,
    };

    userRolesBreakdown.forEach((group) => {
      rolesMap[group.role] = group._count.role;
    });

    const formattedRecentStores = recentStores.map((s) => {
      const sum = s.ratings.reduce((acc, r) => acc + r.rating, 0);
      const avg = s.ratings.length > 0 ? Number((sum / s.ratings.length).toFixed(2)) : 0;
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        rating: avg,
        ratingsCount: s.ratings.length,
        owner: s.owner,
        createdAt: s.createdAt,
      };
    });

    return {
      totalUsers,
      totalStores,
      totalRatings,
      rolesBreakdown: rolesMap,
      recentStores: formattedRecentStores,
      recentRatings,
    };
  }
}
