// apps/backend/src/controllers/user.controller.ts
import { Request, Response } from "express";
import * as userService from '@/services/user.service';
import { prisma } from '@/config/prisma';

// Get current user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await userService.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user with profile
    const userWithProfile = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        is_email_verified: true,
        created_at: true,
        updated_at: true,
        profile: {
          select: {
            fullname: true,
            avatar_url: true,
            bio: true,
          },
        },
      },
    });

    return res.json({ user: userWithProfile });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { fullname, bio, avatar_url } = req.body;
    const userId = req.user.id;

    // Update or create user profile
    const profile = await prisma.userProfile.upsert({
      where: { user_id: userId },
      update: {
        fullname: fullname || null,
        bio: bio || null,
        avatar_url: avatar_url || null,
      },
      create: {
        user_id: userId,
        fullname: fullname || null,
        bio: bio || null,
        avatar_url: avatar_url || null,
      },
    });

    return res.json({ 
      message: 'Profile updated successfully',
      profile 
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Update username
export const updateUsername = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { username } = req.body;
    
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { username: username.trim() },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        updated_at: true,
      },
    });

    return res.json({ 
      message: 'Username updated successfully',
      user: updatedUser 
    });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    console.error('Update username error:', error);
    return res.status(500).json({ error: 'Failed to update username' });
  }
};

// Change password
export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const result = await userService.changePassword(req.user.id, currentPassword, newPassword);
    return res.json(result);
  } catch (error: any) {
    console.error('Change password error:', error);
    return res.status(400).json({ error: error.message || 'Failed to change password' });
  }
};

// Delete account
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    await userService.deleteUserAccount(req.user.id, password);
    return res.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return res.status(400).json({ error: error.message || 'Failed to delete account' });
  }
};

// Get all users (Admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: Number(limit),
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          is_email_verified: true,
          created_at: true,
          profile: {
            select: {
              fullname: true,
              avatar_url: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return res.json({
      users,
      pagination: {
        current_page: Number(page),
        total_pages: Math.ceil(total / Number(limit)),
        total_users: total,
        limit: Number(limit),
      },
    });
  } catch (error: any) {
    console.error('Get all users error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};