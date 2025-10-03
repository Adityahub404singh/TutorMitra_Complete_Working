import { Request, Response } from "express";
import Review from "../models/review.js";

// Submit a new review
export const submitReview = async (req: Request, res: Response) => {
  try {
    const { tutorId, rating, comment } = req.body;
    const studentId = (req as any).user?.id;

    if (!tutorId || !rating) {
      res.status(400).json({ success: false, message: "Tutor ID and rating required." });
      return;
    }

    const review = new Review({
      tutor: tutorId,
      student: studentId,
      rating,
      comment,
    });

    await review.save();

    res.status(201).json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all reviews for a tutor
export const getTutorReviews = async (req: Request, res: Response) => {
  try {
    const tutorId = req.params.tutorId;
    const reviews = await Review.find({ tutor: tutorId }).populate("student", "name");
    res.json({ success: true, reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
