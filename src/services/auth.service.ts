import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, config } from '../config/index.js';
import { AuthUserPayload } from '../types/index.js';

export class AuthService {
  static async signup(data: { name: string; email: string; address: string; password: string }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      const error: any = new Error('An account with this email already exists');
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
        role: 'USER',
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

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return { user, token };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        store: {
          include: {
            ratings: true,
          },
        },
      },
    });

    if (!user) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    let storeData = null;
    if (user.store) {
      const totalRatings = user.store.ratings.length;
      const sumRatings = user.store.ratings.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = totalRatings > 0 ? Number((sumRatings / totalRatings).toFixed(2)) : 0;
      storeData = {
        id: user.store.id,
        name: user.store.name,
        email: user.store.email,
        address: user.store.address,
        averageRating,
        totalRatings,
      };
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        store: storeData,
      },
      token,
    };
  }

  static async updatePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      const error: any = new Error('Incorrect current password');
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true, message: 'Password updated successfully' };
  }

  static async getCurrentUser(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        store: {
          include: {
            ratings: true,
          },
        },
      },
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    let storeData = null;
    if (user.store) {
      const totalRatings = user.store.ratings.length;
      const sumRatings = user.store.ratings.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = totalRatings > 0 ? Number((sumRatings / totalRatings).toFixed(2)) : 0;
      storeData = {
        id: user.store.id,
        name: user.store.name,
        email: user.store.email,
        address: user.store.address,
        averageRating,
        totalRatings,
      };
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      store: storeData,
      createdAt: user.createdAt,
    };
  }
}
