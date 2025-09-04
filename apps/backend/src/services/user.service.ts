import { prisma } from "../config/prisma";
import { User } from "../generated/prisma";

// Create a new user
export const createUser = async (
    username: string,
    email: string,
    password_hash: string
): Promise<User> => {
    try {
        return await prisma.user.create({
            data: { username, email, password_hash },
        });
    } catch (err: any) {
        // Handle unique constraint errors
        if (err.code === "P2002") {
            throw new Error("Username or email already exists");
        }
        throw err;
    }
};

// Find user by username or email (for login or existence check)
export const findUserByUsernameOrEmail = async (
    usernameOrEmail: string
): Promise<User | null> => {
    return prisma.user.findFirst({
        where: {
            OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        },
    });
};


export const markedUserAsVerified = async (
    userId: number
) => {
    const user = await prisma.user.update({
        where: { user_id: userId},
        data: { is_email_verified: true }, 
    })

}