import { prisma } from "../config/prisma";

interface CreateUserProps {
    username: string;
    email: string;
    password: string;
}

export const createUser = async ({ username, email, password }: CreateUserProps) => {
    return await prisma.user.create({
        data: {
            username,
            email,
            password
        }
    })
};
