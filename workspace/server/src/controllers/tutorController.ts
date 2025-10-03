import { Request, Response } from "express";
import Tutor from "../models/Tutor.js";

// Get filtered tutors list with pagination and filters
export const getFilteredTutors = async (req: Request, res: Response) => {
  try {
    const { subject, location, ratingMin, page = 1, limit = 10 } = req.query;

    const filter: Record<string, any> = {};
    if (subject) filter.subjects = { $in: [subject] };
    if (location) filter.location = location;
    if (ratingMin) filter.avgRating = { $gte: Number(ratingMin) };

    const skip = (Number(page) - 1) * Number(limit);

    const tutors = await Tutor.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ avgRating: -1 })
      .populate("userId", "name email");

    const total = await Tutor.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: tutors,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: "Unknown server error" });
    }
  }
};

// Get one tutor profile by user ID
export const getTutorByUserId = async (req: Request, res: Response) => {
  try {
    const tutor = await Tutor.findOne({ userId: req.params.id }).populate("userId", "name email");
    if (!tutor) {
      return res.status(404).json({ success: false, error: "Tutor not found" });
    }
    res.status(200).json({ success: true, data: tutor });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: "Unknown server error" });
    }
  }
};

// Create or update tutor profile for logged-in user
export const createOrUpdateTutorProfile = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    let existing = await Tutor.findOne({ userId });

    if (existing) {
      Object.assign(existing, data);
      await existing.save();
      return res.status(200).json({ success: true, data: existing });
    }

    const newTutor = new Tutor({ userId, ...data });
    await newTutor.save();

    res.status(201).json({ success: true, data: newTutor });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: "Unknown server error" });
    }
  }
};
