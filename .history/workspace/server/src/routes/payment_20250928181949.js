// server/src/routes/paymentRoutes.js

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createOrder, verifyPayment, releaseTutorPayment } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.post("/release-tutor-payment", protect, releaseTutorPayment);

export default router;
