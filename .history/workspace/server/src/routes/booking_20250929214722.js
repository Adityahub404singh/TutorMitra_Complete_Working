import express from "express";
import Booking from "../models/Booking.js"; // Yahi file use ho
import Tutor from "../models/Tutor.js";
import Course from "../models/Course.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// Booking create route with full logging
router.post("/", authenticate, async (req, res) => {
  try {
    console.log("DEBUG: New booking request body:", req.body);

    // Auth check
    const user = req.user;
    if (!user?.id && !user?._id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const userId = user.id || user._id;

    // Destructure body
    const { tutorId, courseId, sessionDate, sessionTime, message, bookingType, isTrial } = req.body;

    // Input validation
    if (!tutorId || !sessionDate || !sessionTime) {
      return res.status(400).json({
        success: false,
        message: "Tutor, session date and session time are required"
      });
    }

    // Tutor find
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ success: false, message: "Tutor not found" });
    }

    // Course find
    let course = null;
    if (courseId) {
      course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
    }

    // Amount calculation
    let amount;
    if (isTrial) {
      amount = (typeof tutor.trialFee === "number" && tutor.trialFee > 0) ? tutor.trialFee : 49;
    } else {
      amount = course?.price ?? tutor.feePerHour ?? 0;
    }

    // Create booking
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
      updatedAt: new Date()
    });

    await booking.save();

    // Populate for response
    await booking.populate([
      { path: "student", select: "name email phone" },
      { path: "tutor", select: "name profileImage city subjects phone whatsapp trialFee" },
      { path: "course", select: "title description price" }
    ]);

    res.status(201).json({
      success: true,
      data: booking,
      message: "Booking created successfully"
    });
  } catch (err) {
    console.error("Booking creation failed (500):", err);
    res.status(500).json({ success: false, message: "Server error while creating booking.", error: err.message });
  }
});

export default router;
