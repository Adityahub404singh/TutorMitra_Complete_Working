import express from "express";
import Booking from "../models/BooKing.js";
import Tutor from "../models/Tutor.js";
import Course from "../models/Course.js";
import { authenticate } from "../middleware/authenticate.js";
import { getMyBookingWithTutor } from "../controllers/bookingController.js";

const router = express.Router();

const getAuthUser = req => req.user;

// CREATE booking
router.post("/", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const { tutorId, courseId, sessionDate, sessionTime, message, bookingType } = req.body;
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
    const amount = course?.price ?? tutor.feePerHour ?? 0;

    const booking = new Booking({
      student: user.id,
      tutor: tutorId,
      course: courseId || null,
      sessionDate: new Date(sessionDate),
      sessionTime,
      message: message || "",
      bookingType: bookingType || "tutor",
      status: "pending",
      amount,
      paymentStatus: "pending",
      canChat: false, // Make sure these are present!
      privateDetailsUnlocked: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await booking.save();
    await booking.populate([
      { path: "student", select: "name email phone" },
      { path: "tutor", select: "name profileImage city subjects phone whatsapp" },
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

// GET all bookings for current logged-in student
router.get("/my-bookings", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { student: user.id };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(filter)
      .populate([
        { path: "student", select: "name email phone" },
        { path: "tutor", select: "name profileImage city subjects phone whatsapp" },
        { path: "course", select: "title description price" }
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
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Get My Bookings Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching bookings." });
  }
});

// GET all bookings for current logged-in tutor
router.get("/tutor-bookings", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const tutorProfile = await Tutor.findOne({ userId: user.id });
    if (!tutorProfile) {
      return res.status(404).json({ success: false, message: "Tutor profile not found" });
    }
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { tutor: tutorProfile._id };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(filter)
      .populate([
        { path: "student", select: "name email phone" },
        { path: "tutor", select: "name profileImage city subjects phone whatsapp" },
        { path: "course", select: "title description price" }
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
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Get Tutor Bookings Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching tutor bookings." });
  }
});

// UPDATE booking status by tutor
router.patch("/:id/status", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id){
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const { status, rejectionReason } = req.body;
    const bookingId = req.params.id;

    if (!["accepted","rejected","completed","cancelled"].includes(status)){
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking){
      return res.status(404).json({ success:false, message:"Booking not found" });
    }
    const tutorProfile = await Tutor.findOne({ userId: user.id });
    if (!tutorProfile || !booking.tutor.equals(tutorProfile._id)){
      return res.status(403).json({ success:false, message:"Not authorized to update this booking" });
    }

    booking.status = status;
    if(status === "rejected" && rejectionReason){
      booking.rejectionReason = rejectionReason;
    }
    booking.updatedAt = new Date();
    await booking.save();
    await booking.populate([
      { path: "student", select: "name email phone" },
      { path: "tutor", select: "name profileImage city subjects phone whatsapp" },
      { path: "course", select: "title description price" }
    ]);
    return res.json({
      success: true,
      data: booking,
      message: `Booking ${status} successfully`
    });
  } catch(error) {
    console.error("Update Booking Status Error:", error);
    res.status(500).json({ success:false, message:"Server error while updating booking status." });
  }
});

// GET booking details (student or tutor)
router.get("/:id", authenticate, async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id){
      return res.status(401).json({ success:false, message:"Authentication required" });
    }
    const booking = await Booking.findById(req.params.id)
      .populate([
        { path: "student", select: "name email phone" },
        { path: "tutor", select: "name profileImage city subjects phone whatsapp rating" },
        { path: "course", select: "title description price" }
      ]);
    if (!booking){
      return res.status(404).json({ success:false, message:"Booking not found" });
    }
    const tutorProfile = await Tutor.findOne({ userId: user.id });
    const isStudent = booking.student._id.equals(user.id);
    const isTutor = tutorProfile && booking.tutor._id.equals(tutorProfile._id);
    if (!isStudent && !isTutor){
      return res.status(403).json({ success:false, message:"Not authorized to view this booking" });
    }
    return res.json({ success:true, data: booking });
  } catch(error) {
    console.error("Get Booking Details Error:", error);
    res.status(500).json({ success:false, message:"Server error while fetching booking details." });
  }
});

// ====== UNLOCK CONTACT AND CHAT STATUS ROUTE ======
router.get(
  "/my-booking-with-tutor/:tutorId",
  authenticate,
  getMyBookingWithTutor
);

export default router;
