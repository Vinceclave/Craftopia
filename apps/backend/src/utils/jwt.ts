import Jwt  from "jsonwebtoken";
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const signToken = (user: User): string => {
    return Jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
}

export const verifyToken = (token: string): any => {
    return Jwt.verify(token, JWT_SECRET);
}