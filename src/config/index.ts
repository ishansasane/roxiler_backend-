import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  databaseUrl: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/store_rating_db',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_jwt_key_store_rating_system_2026_xyz',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
};

export const prisma = new PrismaClient();

// Phumicv0JQ55iNBx