import prisma from '../prisma';
import { Role } from '@prisma/client';

export const createUser = async (
    username: string,
    email: string,
    password: string,
    role: Role = Role.USER
) => {
    return prisma.user.create({
        data: { username, email, password, role},
    });
};

export const getUserByEmail = async (email: string) => {
    return prisma.user.findUnique({ where: { email } });
};

export const getUserById = async(id: number) => {
    return prisma.user.findUnique({ where: { id } });
};

export const updateUser = async(    
    id: number,
    data: Partial<{ username: string, email: string, password: string, role: Role; isActive: boolean }>
) => {
    return prisma.user.update({
        where: { id }, 
        data,
    });
};

export const deleteUser = async (id: number) => {
    return prisma.user.delete({ where: { id } });
}

export const listUsers = async () => {
    return prisma.user.findMany();
}