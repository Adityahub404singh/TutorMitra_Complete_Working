import express from "express";
import Booking from "../models/BooKing.js";
import Tutor from "../models/Tutor.js";
import Course from "../models/Course.js";
import { authenticate } from "../middleware/authenticate.js";
import { getMyBookingWithTutor } from "../controllers/bookingController.js";

const router = express.Router();

// Helper to get authenticated user from request
const getAuthUser = (req) => req.user;

// CREATE booking (trial or normal)
router.post("/", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id && !user?._id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const userId = user.id || user._id;

    const { tutorId, courseId, sessionDate, sessionTime, message, bookingType, isTrial } = req.body;

    if (!tutorId || !sessionDate || !sessionTime) {
      return res.status(400).json({ success: false, message: "Tutor, session date and session time are required" });
    }

    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ success: false, message: "Tutor not found" });
    }

    let course = null;
    if (courseId) {
      course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
    }

    let amount;
    if (isTrial) {
      amount = typeof tutor.trialFee === "number" && tutor.trialFee >= 49 ? tutor.trialFee : 49;
    } else {
      amount = course?.price ?? tutor.feePerHour ?? 500;
    }

    const booking = new Booking({
      student: userId,
      tutor: tutorId,
      course: courseId || null,
      sessionDate: new Date(sessionDate),
      sessionTime,
      message: message || "",
      bookingType: bookingType || "tutor",
      isTrial: !!isTrial,
      status: "pending",
      amount,
      paymentStatus: "pending",
      canChat: false,
      privateDetailsUnlocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await booking.save();

    await booking.populate([
      { path: "student", select: "name email phone" },
      { path: "tutor", select: "name profileImage city subjects phone whatsapp trialFee" },
      { path: "course", select: "title description price" },
    ]);

    return res.status(201).json({
      success: true,
      data: booking,
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("Create Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating booking.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// GET all bookings for logged-in student
router.get("/my-bookings", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id && !user?._id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const userId = user.id || user._id;

    const { status, page = 1, limit = 10 } = req.query;
    const filter = { student: userId };
    if (status && status !== "all") {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const bookings = await Booking.find(filter)
      .populate([
        { path: "student", select: "name email phone" },
        { path: "tutor", select: "name profileImage city subjects phone whatsapp" },
        { path: "course", select: "title description price" },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);

    return res.json({
      success: true,
      data: bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get My Bookings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching bookings.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// GET all bookings for logged-in tutor
router.get("/tutor-bookings", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id && !user?._id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const userId = user.id || user._id;

    const tutorProfile = await Tutor.findOne({ userId });
    if (!tutorProfile) {
      return res.status(404).json({ success: false, message: "Tutor profile not found" });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const filter = { tutor: tutorProfile._id };
    if (status && status !== "all") {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const bookings = await Booking.find(filter)
      .populate([
        { path: "student", select: "name email phone" },
        { path: "tutor", select: "name profileImage city subjects phone whatsapp" },
        { path: "course", select: "title description price" },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);

    return res.json({
      success: true,
      data: bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get Tutor Bookings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching tutor bookings.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// UPDATE booking status by tutor
router.patch("/:id/status", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id && !user?._id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const userId = user.id || user._id;

    const { status, rejectionReason } = req.body;
    const bookingId = req.params.id;

    if (!["accepted", "rejected", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const tutorProfile = await Tutor.findOne({ userId });
    if (!tutorProfile || !booking.tutor.equals(tutorProfile._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to update this booking" });
    }

    booking.status = status;
    if (status === "rejected" && rejectionReason) {
      booking.rejectionReason = rejectionReason;
    }
    booking.updatedAt = new Date();

    await booking.save();

    await booking.populate([
      { path: "student", select: "name email phone" },
      { path: "tutor", select: "name profileImage city subjects phone whatsapp" },
      { path: "course", select: "title description price" },
    ]);

    return res.json({
      success: true,
      data: booking,
      message: `Booking ${status} successfully`,
    });
  } catch (error) {
    console.error("Update Booking Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating booking status.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// GET booking details (student or tutor)
router.get("/:id", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id && !user?._id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const userId = user.id || user._id;

    const booking = await Booking.findById(req.params.id)
      .populate([
        { path: "student", select: "name email phone" },
        { path: "tutor", select: "name profileImage city subjects phone whatsapp rating trialFee" },
        { path: "course", select: "title description price" },
      ]);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const tutorProfile = await Tutor.findOne({ userId });
    const isStudent = booking.student._id.equals(userId);
    const isTutor = tutorProfile && booking.tutor._id.equals(tutorProfile._id);
    if (!isStudent && !isTutor) {
      return res.status(403).json({ success: false, message: "Not authorized to view this booking" });
    }

    return res.json({ success: true, data: booking });
  } catch (error) {
    console.error("Get Booking Details Error:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching booking details.", error: error instanceof Error ? error.message : String(error) });
  }
});

// UNLOCK CONTACT AND CHAT STATUS ROUTE
router.get("/my-booking-with-tutor/:tutorId", authenticate, getMyBookingWithTutor);

export default router;
