import prisma from "../config/prisma";
import { User } from "../generated/prisma";
import { AppError } from '../utils/error';

export const createUser = async (username: string, email: string, password_hash: string): Promise<User> => {
  try {
    return await prisma.user.create({
      data: { username, email, password_hash },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new AppError('Username or email already exists', 409);
    }
    throw new AppError('Failed to create user', 500);
  }
};

export const findUserByUsernameOrEmail = async (usernameOrEmail: string): Promise<User | null> => {
  if (!usernameOrEmail?.trim()) return null;
  
  return prisma.user.findFirst({
    where: { 
      OR: [
        { username: usernameOrEmail }, 
        { email: usernameOrEmail }
      ] 
    },
  });
};

export const findUserById = async (userId: number): Promise<User | null> => {
  if (!userId || userId <= 0) return null;
  
  return prisma.user.findUnique({
    where: { user_id: userId },
  });
};

export const markUserAsVerified = async (userId: number): Promise<User> => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.is_email_verified) {
    throw new AppError('Email is already verified', 400);
  }

  return prisma.user.update({
    where: { user_id: userId },
    data: { is_email_verified: true },
  });
};