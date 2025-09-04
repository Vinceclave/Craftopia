    import { Request, Response, NextFunction } from "express";
    import * as authService from '../services/auth.service';
import { revokeRefreshToken } from "../services/resfreshToken.service";

    export const register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username, email, password } = req.body;
            const user = await authService.register(username, email, password);
            res.status(201).json({ success: true, data: user });            
        } catch (err) {
            next(err);
        }
    }

    export const login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username, password} = req.body;
            const result = await authService.login(username, password);
            res.status(200).json({ success: true, ...result });
        } catch (err) {
            next(err)
        }
    }

    export const refreshToken = async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        const result = await authService.refreshTokens(refreshToken);
        res.status(200).json({ success: true, ...result });
    }

    export const logout = async (req: Request, res: Response) => {
        const { refreshToken } = req.body   
         await revokeRefreshToken(refreshToken);
        res.status(200).json({ success: true, message: 'Logged out successfully'});
    }