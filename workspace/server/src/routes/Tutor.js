import express from "express";
import Tutor from "../models/Tutor.js";
import Course from "../models/Course.js";
import Booking from "../models/BooKing.js";
import User from "../models/user.js"; // <-- ENSURE THIS PATH IS CORRECT!
import { authenticate } from "../middleware/authenticate.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";

const router = express.Router();

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueName}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
    fieldSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "profileImage" && !file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files allowed for profileImage"), false);
    } else {
      cb(null, true);
    }
  }
});

// GET ALL TUTORS
router.get("/", async (req, res) => {
  try {
    const { subject, location, rating, minPrice, maxPrice, mode, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (subject && subject !== "all") filter.subjects = { $regex: subject, $options: "i" };
    if (location && location !== "all") filter.city = { $regex: location, $options: "i" };
    if (rating) filter.rating = { $gte: Number(rating) };
    if (minPrice || maxPrice) {
      filter.feePerHour = {};
      if (minPrice) filter.feePerHour.$gte = Number(minPrice);
      if (maxPrice) filter.feePerHour.$lte = Number(maxPrice);
    }
    if (mode && mode !== "all") filter.mode = { $in: [mode, "both"] };
    const skip = (Number(page) - 1) * Number(limit);

    const tutors = await Tutor.find(filter)
      .populate("userId", "name email profileImage")
      .select("name subjects experience feePerHour mode city rating profileImage bio availableFrom availableTo")
      .skip(skip)
      .limit(Number(limit))
      .sort({ rating: -1, createdAt: -1 })
      .lean();

    const tutorsWithImages = await Promise.all(
      tutors.map(async (tutor) => {
        const courseCount = await Course.countDocuments({ tutorId: tutor._id });
        let profileImage = tutor.profileImage || tutor.userId?.profileImage || "";
        if (profileImage && !profileImage.startsWith("http") && !profileImage.startsWith("/uploads/")) {
          profileImage = `/uploads/${profileImage}`;
        }
        return {
          _id: tutor._id,
          name: tutor.name || tutor.userId?.name || "Unknown Tutor",
          subjects: tutor.subjects || [],
          experience: tutor.experience || 0,
          feePerHour: tutor.feePerHour || 0,
          mode: tutor.mode || "both",
          city: tutor.city || "",
          rating: tutor.rating || 0,
          profileImage,
          bio: tutor.bio || "",
          totalCourses: courseCount,
          availableFrom: tutor.availableFrom,
          availableTo: tutor.availableTo,
          userId: tutor.userId
        };
      })
    );

    const total = await Tutor.countDocuments(filter);
    res.json({
      success: true,
      tutors: tutorsWithImages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      }
    });
  } catch (error) {
    console.error("❌ Get tutors error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET BY ID
router.get("/:id", async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id)
      .populate("userId", "name email createdAt profileImage")
      .lean();
    if (!tutor) {
      return res.status(404).json({ success: false, message: "Tutor not found" });
    }
    const courses = await Course.find({ tutorId: tutor._id })
      .select("title description price duration level")
      .lean();
    let profileImage = tutor.profileImage || tutor.userId?.profileImage || "";
    if (profileImage && !profileImage.startsWith("http") && !profileImage.startsWith("/uploads/")) {
      profileImage = `/uploads/${profileImage}`;
    }
    res.json({
      success: true,
      tutor: { ...tutor, profileImage, courses, totalCourses: courses.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET current tutor profile for editing (protected)
router.get("/profile/me", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const tutor = await Tutor.findOne({ userId })
      .populate("userId", "name email profileImage")
      .lean();
    if (!tutor) {
      return res.status(404).json({ success: false, message: "Tutor profile not found" });
    }
    const courses = await Course.find({ tutorId: tutor._id }).lean();
    let profileImage = tutor.profileImage || tutor.userId?.profileImage || "";
    if (profileImage && !profileImage.startsWith("http") && !profileImage.startsWith("/uploads/")) {
      profileImage = `/uploads/${profileImage}`;
    }
    res.json({
      success: true,
      tutor: { ...tutor, profileImage, courses }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// CREATE/UPDATE TUTOR PROFILE with instant JWT
router.post(
  "/profile",
  authenticate,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "qualificationDoc", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      let data = { ...req.body };
      const files = req.files || {};
      let existing = await Tutor.findOne({ userId });

      if (typeof data.subjects === "string") {
        try { data.subjects = JSON.parse(data.subjects); }
        catch { data.subjects = data.subjects.split(",").map(s => s.trim()).filter(Boolean); }
      }
      if (typeof data.slots === "string") {
        try { data.slots = JSON.parse(data.slots); }
        catch { data.slots = [data.slots]; }
      }
      data.experience = Number(data.experience) || 0;
      data.feePerHour = Number(data.feePerHour) || 0;

      if (files.profileImage && files.profileImage[0]) {
        const newFile = files.profileImage[0];
        if (
          existing &&
          existing.profileImage &&
          fs.existsSync(`uploads/${existing.profileImage}`) &&
          existing.profileImage !== newFile.filename
        ) {
          fs.unlinkSync(`uploads/${existing.profileImage}`);
        }
        data.profileImage = newFile.filename;
      } else if (existing && existing.profileImage) {
        data.profileImage = existing.profileImage;
      } else {
        data.profileImage = "";
      }

      if (files.qualificationDoc && files.qualificationDoc[0]) {
        data.qualificationDoc = files.qualificationDoc[0].filename;
      } else if (existing && existing.qualificationDoc) {
        data.qualificationDoc = existing.qualificationDoc;
      } else {
        data.qualificationDoc = "";
      }

      data.userId = userId;

      let tutor;
      if (existing) {
        Object.assign(existing, data);
        await existing.save();
        tutor = existing;
      } else {
        tutor = new Tutor(data);
        await tutor.save();
      }

      let profileImageUrl = tutor.profileImage;
      if (profileImageUrl && !profileImageUrl.startsWith("/uploads/")) {
        profileImageUrl = `/uploads/${profileImageUrl}`;
      }

      // KEY: Set role and send new JWT
      await User.findByIdAndUpdate(userId, { role: "tutor" });
      const token = jwt.sign(
        { id: userId, role: "tutor" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        tutor: { ...tutor.toObject(), profileImage: profileImageUrl },
        token,
        message: "Profile updated successfully!"
      });
    } catch (error) {
      console.error("PROFILE UPLOAD ERROR:", error, error?.stack);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to save profile",
        stack: process.env.NODE_ENV !== "production" ? error.stack : "",
      });
    }
  }
);

// UPDATE PROFILE IMAGE ONLY (PROTECTED)
router.post(
  "/upload-image",
  authenticate,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No image provided" });
      }
      const imageFilename = req.file.filename;
      const userId = req.user.id;
      const tutor = await Tutor.findOneAndUpdate(
        { userId },
        { profileImage: imageFilename },
        { new: true }
      );
      if (!tutor) {
        return res.status(404).json({ success: false, message: "Tutor not found" });
      }
      res.json({
        success: true,
        imageUrl: `/uploads/${imageFilename}`,
        message: "Profile image updated!"
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Upload failed" });
    }
  }
);

// GET tutor dashboard stats (protected)
router.get("/dashboard/stats", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const tutor = await Tutor.findOne({ userId });
    if (!tutor) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    const totalCourses = await Course.countDocuments({ tutorId: tutor._id });
    const totalBookings = await Booking.countDocuments({ tutorId: tutor._id });
    const activeBookings = await Booking.countDocuments({
      tutorId: tutor._id,
      status: "confirmed"
    });

    const stats = {
      totalCourses,
      totalBookings,
      activeBookings,
      avgRating: tutor.rating || 0,
      totalEarnings: 0,
      profileViews: tutor.profileViews || 0,
      completionRate: totalBookings > 0 ? Math.round((activeBookings / totalBookings) * 100) : 0
    };

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET tutor's courses (public)
router.get("/:tutorId/courses", async (req, res) => {
  try {
    const { tutorId } = req.params;
    const courses = await Course.find({ tutorId })
      .select("title description price duration level category")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
