// apps/backend/src/services/user.service.ts - Extended with additional methods
import { prisma } from '@/config/prisma';
import { User } from '@prisma/client';
import { hashPassword, comparePassword } from '@/utils/hash';

export const createUser = async (data: {
  username: string;
  email: string;
  password_hash: string | null;
}): Promise<User> => {
  return await prisma.user.create({ data });
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return await prisma.user.findUnique({ where: { email } });
};

export const findUserByUsername = async (username: string): Promise<User | null> => {
  return await prisma.user.findUnique({ where: { username } });
};

export const findUserById = async (id: number): Promise<User | null> => {
  return await prisma.user.findUnique({ where: { id } });
};

// Change user password
export const changePassword = async (
  userId: number, 
  currentPassword: string, 
  newPassword: string
): Promise<{ message: string }> => {
  const user = await findUserById(userId);
  if (!user) throw new Error('User not found');
  
  if (!user.password_hash) throw new Error('No password set for this account');
  
  const validPassword = await comparePassword(currentPassword, user.password_hash);
  if (!validPassword) throw new Error('Current password is incorrect');
  
  const newPasswordHash = await hashPassword(newPassword);
  
  await prisma.user.update({
    where: { id: userId },
    data: { password_hash: newPasswordHash },
  });
  
  // Invalidate all refresh tokens for this user (force re-login on all devices)
  await prisma.refreshToken.deleteMany({
    where: { user_id: userId },
  });
  
  return { message: 'Password changed successfully' };
};

// Delete user account
export const deleteUserAccount = async (userId: number, password: string): Promise<void> => {
  const user = await findUserById(userId);
  if (!user) throw new Error('User not found');
  
  if (!user.password_hash) throw new Error('Cannot delete account without password verification');
  
  const validPassword = await comparePassword(password, user.password_hash);
  if (!validPassword) throw new Error('Password is incorrect');
  
  // Delete user (cascade will handle related records)
  await prisma.user.delete({
    where: { id: userId },
  });
};

// Update user profile
export const updateUserProfile = async (
  userId: number,
  profileData: {
    fullname?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
  }
) => {
  return await prisma.userProfile.upsert({
    where: { user_id: userId },
    update: profileData,
    create: {
      user_id: userId,
      ...profileData,
    },
  });
};

// Get user with profile
export const getUserWithProfile = async (userId: number) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
    },
  });
};

// Update user role (Admin only)
export const updateUserRole = async (userId: number, role: 'USER' | 'ADMIN') => {
  return await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      updated_at: true,
    },
  });
};

// Get user statistics
export const getUserStats = async () => {
  const [totalUsers, verifiedUsers, adminUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { is_email_verified: true } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
  ]);
  
  return {
    total_users: totalUsers,
    verified_users: verifiedUsers,
    admin_users: adminUsers,
    unverified_users: totalUsers - verifiedUsers,
  };
};