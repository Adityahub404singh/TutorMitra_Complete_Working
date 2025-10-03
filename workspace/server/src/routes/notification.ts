import express, { Request, Response, NextFunction } from "express";
import { getNotifications, markAsRead } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getNotifications(req as any, res, next);
  } catch (error) {
    next(error);
  }
});

router.post("/mark-read", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await markAsRead(req as any, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;
