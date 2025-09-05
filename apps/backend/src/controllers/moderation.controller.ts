// controllers/moderation.controller.ts
import { Request, Response, NextFunction } from "express";
import * as moderationService from "../services/moderation.service";

export const createLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { adminId, action, targetId, targetUserId, reason } = req.body;
    const log = await moderationService.createModerationLog({
      adminId,
      action,
      targetId,
      targetUserId,
      reason,
    });
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
};

export const getLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await moderationService.getModerationLogs();
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
};
