import express from "express";
import Booking from "../models/Booking.js";
import Tutor from "../models/Tutor.js";
import Course from "../models/Course.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

const getAuthUser = (req) => req.user;

// CREATE booking (trial ya normal booking ke liye)
router.post("/", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id && !user?._id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    // Auth id normalize - agar _id hai to use karo
    const userId = user.id || user._id;

    const {
      tutorId,
      courseId,
      sessionDate,
      sessionTime,
      message,
      bookingType,
      isTrial,
    } = req.body;

    // Basic validation
    if (!tutorId || !sessionDate || !sessionTime) {
      return res.status(400).json({
        success: false,
        message: "Tutor, session date and session time are required",
      });
    }

    // Tutor verify
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ success: false, message: "Tutor not found" });
    }

    // Course verify (optional)
    let course = null;
    if (courseId) {
      course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
    }

    // Trial booking logic check
    const isTrialBooking = bookingType === "trial" || isTrial === true;

    let amount;
    if (isTrialBooking) {
      amount = typeof tutor.trialFee === "number" && tutor.trialFee > 0 ? tutor.trialFee : 49;
    } else {
      amount = course?.price ?? tutor.feePerHour ?? 0;
    }

    // Create new booking document
    const booking = new Booking({
      student: userId,
      tutor: tutorId,
      course: courseId || null,
      sessionDate: new Date(sessionDate),
      sessionTime,
      message: message || "",
      bookingType: bookingType || "tutor",
      isTrial: Boolean(isTrialBooking),
      status: "pending",
      amount,
      paymentStatus: "pending",
      canChat: false,
      privateDetailsUnlocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save and then populate for response
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
    return res
      .status(500)
      .json({ success: false, message: "Server error while creating booking." });
  }
});

export default router;
