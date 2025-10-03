import express from "express";
import Booking from "../models/BooKing.js";
import Tutor from "../models/Tutor.js";
import Course from "../models/Course.js";
import { authenticate } from "../middleware/authenticate.js";
import { getMyBookingWithTutor } from "../controllers/bookingController.js";

const router = express.Router();

const getAuthUser = req => req.user;

router.post("/", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const { tutorId, courseId, sessionDate, sessionTime, message, bookingType, isTrial } = req.body;
    if (!tutorId || !sessionDate || !sessionTime) {
      return res.status(400).json({ success: false, message: "Tutor, session date and time are required" });
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

    // === Flexible trial fee logic ===
    let amount;
    if (isTrial) {
      // Tutor can set trialFee (e.g., 39 or 49) else defaults to 49
      amount = (typeof tutor.trialFee === "number" && tutor.trialFee > 0) ? tutor.trialFee : 49;
    } else {
      amount = course?.price ?? tutor.feePerHour ?? 0;
    }

    const booking = new Booking({
      student: user.id,
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
    await booking.populate([
      { path: "student", select: "name email phone" },
      { path: "tutor", select: "name profileImage city subjects phone whatsapp trialFee" },
      { path: "course", select: "title description price" }
    ]);

    return res.status(201).json({
      success: true,
      data: booking,
      message: "Booking created successfully"
    });
  } catch (error) {
    console.error("Create Booking Error:", error);
    res.status(500).json({ success: false, message: "Server error while creating booking." });
  }
});

// Rest of your existing routes remain unchanged...
// (copy your GET, PATCH, etc. here)

export default router;
