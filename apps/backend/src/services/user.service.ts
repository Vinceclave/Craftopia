import { prisma } from '@/config/prisma';
import { User } from '@prisma/client';

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
