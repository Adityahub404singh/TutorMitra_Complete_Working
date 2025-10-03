import express from "express";
import Review from "../models/review.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get reviews for a specific tutor
router.get("/tutor/:tutorId", async (req, res) => {
  try {
    const tutorId = req.params.tutorId;
    if (!tutorId) {
      res.status(400).json({ success: false, message: "Tutor ID is required" });
      return;
    }

    const reviews = await Review.find({ tutorId }).populate("studentId", "name");
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    const err = error;
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
});

// Post a new review (protected route)
router.post("/", protect, async (req, res) => {
  try {
    const { tutorId, rating, comment } = req.body;

    if (!tutorId || !rating || !comment) {
      res.status(400).json({ success: false, message: "tutorId, rating and comment are required." });
      return;
    }

    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const review = new Review({
      tutorId,
      studentId: req.user.id,
      rating,
      comment,
    });

    await review.save();

    res.status(201).json({ success: true, review });
  } catch (error) {
    const err = error;
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
});

export default router;
