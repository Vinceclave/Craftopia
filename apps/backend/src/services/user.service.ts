import prisma from "../config/prisma";
import { User } from "../generated/prisma";

// Create user
export const createUser = async (username: string, email: string, password_hash: string): Promise<User> => {
    return prisma.user.create({
        data: { username, email, password_hash },
    });
};

// Find user by username or email
export const findUserByUsernameOrEmail = async (usernameOrEmail: string): Promise<User | null> => {
    return prisma.user.findFirst({
        where: { OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }] },
    });
};

// Mark user as verified
export const markUserAsVerified = async (userId: number): Promise<User> => {
    return prisma.user.update({
        where: { user_id: userId },
        data: { is_email_verified: true },
    });
};
