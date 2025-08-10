import { Request, Response } from "express";
import * as userService from "../services/user.service";

export const listUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userService.listUsers();
    const safe = users.map(u => {
      const { password: _p, ...rest } = u as any;
      return rest;
    });
    res.json(safe);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await userService.getUserById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password: _p, ...safe } = user as any;
    res.json(safe);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await userService.deleteUser(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
