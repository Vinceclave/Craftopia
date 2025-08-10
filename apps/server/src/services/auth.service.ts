import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as userService from "./user.service";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const SALT_ROUNDS = 10;

export const register = async (
    username: string,
    email: string,
    password: string,
    role: Role = Role.USER
) => {
    const existing = await userService.getUserByEmail(email);

    if (existing) throw new Error("Email already in use");

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userService.createUser(username, email, hashedPassword, role);
    // Optionally remove password before returning (controller can prick what to send)
    return user;
}

export const login = async (email: string, password: string) => {
    const user = await userService.getUserByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid credentials");
    
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h"});

    // return token and sanitized user
    const { password: _p, ...safeUser } = user as any;
    return { token, user: safeUser }; 
}

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET);
}