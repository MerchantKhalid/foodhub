import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

import { PrismaClient, Role } from '@prisma/client';
import { AuthRequest, RegisterInput, LoginInput } from '../types';
import { sendSuccess, sendError } from '../utils/helpers';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not defined');
}

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      name,
      phone,
      address,
      role,
      restaurantName,
      restaurantDescription,
      restaurantAddress,
      cuisineType,
    }: RegisterInput = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendError(res, 'Email already registered', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with optional provider profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        address,
        role: role as Role,
        ...(role === 'PROVIDER' && restaurantName && restaurantAddress
          ? {
              providerProfile: {
                create: {
                  restaurantName,
                  description: restaurantDescription,
                  address: restaurantAddress,
                  cuisineType,
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
        providerProfile: role === 'PROVIDER',
      },
    });

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    );

    return sendSuccess(res, { user, token }, 'Registration successful', 201);
  } catch (error) {
    console.error('Registration error:', error);
    return sendError(res, 'Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginInput = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        providerProfile: true,
      },
    });

    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Check if user is suspended
    if (user.status === 'SUSPENDED') {
      return sendError(res, 'Account suspended. Please contact support', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return sendSuccess(
      res,
      { user: userWithoutPassword, token },
      'Login successful',
    );
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 'Login failed', 500);
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
        providerProfile: true,
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, user);
  } catch (error) {
    console.error('Get me error:', error);
    return sendError(res, 'Failed to get user info', 500);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.user!.userId;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(address && { address }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
        providerProfile: true,
      },
    });

    return sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return sendError(res, 'Failed to update profile', 500);
  }
};

export const updateProviderProfile = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user!.userId;
    const {
      restaurantName,
      description,
      address,
      openingHours,
      closingHours,
      cuisineType,
      imageUrl,
    } = req.body;

    const providerProfile = await prisma.providerProfile.upsert({
      where: { userId },
      update: {
        ...(restaurantName && { restaurantName }),
        ...(description !== undefined && { description }),
        ...(address && { address }),
        ...(openingHours && { openingHours }),
        ...(closingHours && { closingHours }),
        ...(cuisineType && { cuisineType }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
      create: {
        userId,
        restaurantName: restaurantName || 'My Restaurant',
        address: address || '',
        description,
        openingHours,
        closingHours,
        cuisineType,
        imageUrl,
      },
    });

    return sendSuccess(
      res,
      providerProfile,
      'Provider profile updated successfully',
    );
  } catch (error) {
    console.error('Update provider profile error:', error);
    return sendError(res, 'Failed to update provider profile', 500);
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      return sendError(res, 'Current password is incorrect', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return sendError(res, 'Failed to change password', 500);
  }
};
