import { Request, Response } from 'express';
import { createUser } from '../services/user.service';
import { error } from 'console';

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) 
            res.status(400).json({ success: false, error: "Missing required fields" });

        const user = await createUser({ username, email, password });

        return res.status(201).json({
            success: true,
            message: 'Successfully created',
            data: user,
        })

    } catch (err: any) {
        console.error('Register error: ', err)
        res.status(500).json({
            succes: false,
            message: "Internal Server Error"
        })
    }


}