// /server/routes/booking.js

import express from "express";
import Booking from "../models/BooKing.js";
import Tutor from "../models/Tutor.js";
import Course from "../models/Course.js";
import { authenticate } from "../middleware/authenticate.js";
import { getMyBookingWithTutor } from "../controllers/bookingController";

const router = express.Router();

const getAuthUser = (req) => req.user;

router.post("/", authenticate, async (req, res) => {
  try {
    console.log("Booking create request body:", req.body);

    const user = getAuthUser(req);
    if (!user?.id && !user?._id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const userId = user.id || user._id;

    const { tutorId, courseId, sessionDate, sessionTime, message, bookingType, isTrial } = req.body;

    if (!tutorId || !sessionDate || !sessionTime) {
      return res.status(400).json({
        success: false,
        message: "Tutor, session date and session time are required",
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

    let amount;
    if (isTrial) {
      amount = typeof tutor.trialFee === "number" && tutor.trialFee > 0 ? tutor.trialFee : 49;
    } else {
      amount = course?.price ?? tutor.feePerHour ?? 0;
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
      createdAt: new Date(),
      updatedAt: new Date(),
      canChat: false,
      privateDetailsUnlocked: false,
    });

    await booking.save();

    await booking.populate([
      { path: "student", select: "name email phone" },
      { path: "tutor", select: "name profileImage city subjects phone whatsapp" },
      { path: "course", select: "title description price" },
    ]);

    return res.status(201).json({
      success: true,
      data: booking,
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("Booking creation failed:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating booking.",
    });
  }
});

// ... (Baaki GET, PATCH routes can remain same)

router.get("/my-booking-with-tutor/:tutorId", authenticate, getMyBookingWithTutor);

export default router;
