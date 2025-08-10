import { Request, Response } from "express";
import * as userService from '../services/user.service';

export const getProfile = async (req: Request, res: Response) => {
    try { 
        const userId = (req as any).user.userId as number;
        const user = await userService.getUserById(userId);

        if (!user) return res.status(400).json({ error: "User not found" });
        const { password: _p, ...safe } = user as any;
        res.json(safe);
    } catch (error: any ) {
        res.status(500).json({ error: error.message });
    }
}

export const updateProfile = async (req: Request, res: Response) => {
    try { 
        const userId = (req as any).user.userId as number;
        const { username, email } = req.body;
        const updated = await userService.updateUser(userId, { username, email});
        const { password: _p, ...safe } = updated as any;
        res.json(safe);
    } catch (error: any) {
        res.status(400).json({ error: error.message});
    }
}