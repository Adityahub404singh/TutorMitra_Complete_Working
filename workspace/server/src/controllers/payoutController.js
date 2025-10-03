import Booking from "../models/BooKing.js";  // Correct import, case sensitive
import { notifyTutor } from "../utils/notifyTutor.js"; // Optional email notification

const PLATFORM_COMMISSION = 0.1; // 10% platform commission

/**
 * Releases payment to tutor for a completed booking.
 * Only call from trusted sources/admins.
 *
 * @param {object} req - Express request object containing bookingId in body
 * @param {object} res - Express response object
 */
export const releaseTutorPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: "BookingId is required" });
    }

    const booking = await Booking.findById(bookingId).populate([
      { path: "tutor", select: "name email" },
      { path: "student", select: "name email" }
    ]);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({ success: false, message: "Booking is not marked as completed" });
    }

    if (booking.paymentStatus !== "success") {
      return res.status(400).json({ success: false, message: "Payment not confirmed for this booking" });
    }

    if (booking.tutorPaid) {
      return res.status(400).json({ success: false, message: "Tutor has already been paid for this session" });
    }

    // Calculate payout amount after deducting platform commission
    const tutorShare = Math.floor(booking.amount * (1 - PLATFORM_COMMISSION));

    booking.tutorPaid = true;
    await booking.save();

    // Send email notification to tutor about payout (optional)
    if (booking.tutor?.email) {
      await notifyTutor({
        to: booking.tutor.email,
        studentName: booking.student?.name || "Student",
        sessionDate: booking.sessionDate,
        sessionTime: booking.sessionTime,
        amount: tutorShare,
        isPayment: true,
        bookingId: booking._id.toString(),
      });
    }

    return res.status(200).json({
      success: true,
      tutorAmount: tutorShare,
      message: `Payment released to tutor (${booking.tutor?.name ?? "Unknown"})`,
    });
  } catch (error) {
    console.error("Error in releaseTutorPayment:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while releasing tutor payment",
    });
  }
};
