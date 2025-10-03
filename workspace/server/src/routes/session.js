import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getUpcomingSessions } from "../controllers/sessionController.js";

const router = express.Router();

router.get("/upcoming", protect, getUpcomingSessions);

export default router;
