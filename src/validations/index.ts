import { z } from 'zod';

// Name: Min 20 characters, Max 60 characters
export const nameSchema = z
  .string()
  .min(20, { message: 'Name must be at least 20 characters long' })
  .max(60, { message: 'Name cannot exceed 60 characters' })
  .trim();

// Address: Max 400 characters
export const addressSchema = z
  .string()
  .min(1, { message: 'Address is required' })
  .max(400, { message: 'Address cannot exceed 400 characters' })
  .trim();

// Email: Standard email validation
export const emailSchema = z
  .string()
  .email({ message: 'Must be a valid email address' })
  .trim()
  .toLowerCase();

// Password: 8-16 characters, at least one uppercase letter, at least one special character
export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(16, { message: 'Password cannot exceed 16 characters' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' });

// Role enum
export const roleSchema = z.enum(['ADMIN', 'USER', 'STORE_OWNER']);

// Signup schema (Normal User)
export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' }),
});

// Update password schema
export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: passwordSchema,
});

// Admin Add User schema
export const adminCreateUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
  role: roleSchema,
});

// Admin Add Store schema
export const adminCreateStoreSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  ownerId: z.number().int().positive().optional().nullable(),
});

// Rating schema (1-5)
export const submitRatingSchema = z.object({
  rating: z
    .number()
    .int({ message: 'Rating must be an integer' })
    .min(1, { message: 'Rating must be at least 1' })
    .max(5, { message: 'Rating cannot be more than 5' }),
});
