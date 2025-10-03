import express, { Request, Response } from "express";
import Course from "../models/Course.js";
import Tutor from "../models/Tutor.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

const getAuthUser = (req: Request): AuthenticatedUser | undefined =>
  req.user as AuthenticatedUser | undefined;

// GET all courses
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      coachingType,
      location,
      subject,
      page = "1",
      limit = "12",
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter: Record<string, any> = {};
    if (coachingType && coachingType !== "all" && coachingType !== "All") {
      filter.coachingType = { $in: [coachingType, "both"] };
    }
    if (location && location !== "all" && location !== "All Cities") {
      filter.location = { $regex: location, $options: "i" };
    }
    if (subject && subject !== "all") {
      filter.subjects = { $regex: subject, $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder: 1 | -1 = order === "desc" ? -1 : 1;
    const sortObj: Record<string, 1 | -1> = { [sortBy as string]: sortOrder };

    const courses = await Course.find(filter)
      .populate("instructor", "name profileImage _id city")
      .skip(skip)
      .limit(Number(limit))
      .sort(sortObj)
      .lean();

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      data: courses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
      filters: {
        coachingType,
        location,
        subject,
      },
    });
  } catch (error) {
    console.error("❌ Get courses error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch courses",
    });
  }
});

// GET single course by ID  <-- ADD THIS FOR BOOKING PAGE
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name profileImage _id city")
      .lean();
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, course });
  } catch (error) {
    console.error("❌ Get course by id error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch course",
    });
  }
});

// CREATE COURSE
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const {
      title,
      description,
      price,
      location,
      subjects,
      coachingType,
      category,
    } = req.body;

    const tutorProfile = await Tutor.findOne({ userId: user.id }).lean();
    if (!tutorProfile) {
      return res.status(400).json({
        success: false,
        message: "Complete your tutor profile first",
      });
    }

    const courseData = {
      instructor: tutorProfile._id,
      title: typeof title === "string" ? title.trim() : "",
      description: typeof description === "string" ? description.trim() : "",
      price: Number(price) || 0,
      location: location?.trim() || tutorProfile.city || "",
      subjects: Array.isArray(subjects)
        ? subjects.map((s: string) => s.trim()).filter(Boolean)
        : typeof subjects === "string"
        ? subjects.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
      coachingType: coachingType || "both",
      category: typeof category === "string" ? category : "",
      rating: 0,
      totalReviews: 0,
    };

    if (!courseData.title) {
      return res.status(400).json({ success: false, message: "Course title is required" });
    }
    if (!courseData.price || courseData.price <= 0) {
      return res.status(400).json({ success: false, message: "Valid price is required" });
    }

    const created = await Course.create(courseData);

    const course = await Course.findById(created._id)
      .populate("instructor", "name profileImage _id city")
      .lean();

    res.status(201).json({
      success: true,
      data: course,
      message: "Course created successfully",
    });
  } catch (error) {
    console.error("❌ Create course error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create course",
    });
  }
});

export default router;
