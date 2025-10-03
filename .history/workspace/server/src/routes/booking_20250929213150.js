// File: /server/routes/booking.ts

import express from "express";
import Booking from "../models/Booking.js";
import Tutor from "../models/Tutor.js";
import Course from "../models/Course.js";
import { authenticate } from "../middleware/authenticate.js";
import { getMyBookingWithTutor } from "../controllers/bookingController.js";

const router = express.Router();

const getAuthUser = (req: any) => req.user;

// Create a booking (trial or regular)
router.post("/", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id && !user?._id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const userId = user.id || user._id;

    const {
      tutorId,
      courseId,
      sessionDate,
      sessionTime,
      message,
      bookingType,
      isTrial
    } = req.body;

    if (!tutorId || !sessionDate || !sessionTime) {
      return res.status(400).json({
        success: false,
        message: "Tutor ID, session date, and session time are required"
      });
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

    // Amount logic
    let amount: number;
    if (isTrial) {
      amount = typeof tutor.trialFee === "number" && tutor.trialFee > 0 ? tutor.trialFee : 49;
    } else {
      amount = course?.price ?? tutor.feePerHour ?? 0;
    }

    const newBooking = new Booking({
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
      updatedAt: new Date()
    });

    await newBooking.save();

    await newBooking.populate([
      { path: "student", select: "name email phone" },
      { path: "tutor", select: "name profileImage city subjects phone whatsapp" },
      { path: "course", select: "title description price" }
    ]);

    return res.status(201).json({
      success: true,
      data: newBooking,
      message: "Booking created successfully"
    });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating booking",
      error: error.message
    });
  }
});

// Rest of the routes (your existing GET, PATCH, etc.) can remain as is, with similar error handling.

router.get("/my-bookings", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id && !user?._id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const userId = user.id || user._id;

    const { status, page = "1", limit = "10" } = req.query;
    const filter: any = { student: userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

    const bookings = await Booking.find(filter)
      .populate([
        { path: "student", select: "name email phone" },
        { path: "tutor", select: "name profileImage city subjects phone whatsapp" },
        { path: "course", select: "title description price" }
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string, 10));

    const total = await Booking.countDocuments(filter);

    return res.json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        total,
        pages: Math.ceil(total / parseInt(limit as string, 10))
      }
    });
  } catch (error: any) {
    console.error("Error fetching student bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching bookings",
      error: error.message
    });
  }
});


// Similarly, tutor bookings and other routes with proper auth, validation, and error handling

// Finally export router
export default router;
