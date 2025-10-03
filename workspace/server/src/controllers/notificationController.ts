import { Request, Response, NextFunction } from "express";
import Notification from "../models/Notification.js";

interface UserRequest extends Request {
  user?: { id: string; role?: string };
}

// Get all notifications for a user
export const getNotifications = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }
    // Only notifications for this user, sorted newest-first
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

// Mark notifications as read (single or all)
export const markAsRead = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }
    const { notificationId } = req.body;
    if (notificationId) {
      await Notification.updateOne({ _id: notificationId, userId }, { $set: { read: true } });
    } else {
      await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
