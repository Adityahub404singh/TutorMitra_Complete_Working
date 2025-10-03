// server/src/controllers/paymentController.js

import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/BooKing.js"; // Verify exact file name and path
import Tutor from "../models/Tutor.js";
import User from "../models/user.js";
import { sendNotificationEmail } from "../utils/notificationService.js";

// Razorpay Initialization
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Platform commission rate (10%)
const PLATFORM_COMMISSION = 0.1;

/**
 * Endpoint to create Razorpay order
 */
export const createOrder = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    if (!bookingId || !amount) {
      return res.status(400).json({ message: "BookingId and amount are required." });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.paymentStatus === "success") {
      return res.status(400).json({ message: "Invalid booking or already paid." });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // INR in paise
      currency: "INR",
      receipt: `tm-booking-${bookingId}`,
      payment_capture: 1,
    });

    res.json({
      orderId: order.id,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "Failed to create order." });
  }
};

/**
 * Verify Razorpay payment signature and update booking status
 */
export const verifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details." });
    }

    // Verify signature
    const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "failed" });
      return res.status(400).json({ message: "Signature verification failed." });
    }

    // Update booking record after successful payment
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { paymentStatus: "success", status: "confirmed", canChat: true, privateDetailsUnlocked: true },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Notify both tutor and student via email
    const tutor = await Tutor.findById(booking.tutor);
    const student = await User.findById(booking.student);

    const notify = async (email, subject, htmlContent) => {
      try {
        await sendNotificationEmail({ to: email, subject, html: htmlContent });
      } catch (err) {
        console.error("Email notification error:", err);
      }
    };

    if (tutor?.email) {
      await notify(tutor.email, "New Booking Paid | TutorMitra",
      `<p>Dear ${tutor.name}, ₹${booking.amount} payment for booking confirmation received.</p>`);

      await notify(tutor.email, "Booking Confirmed | TutorMitra",
      `<p>Your booking for course ${booking.courseName} on ${booking.sessionDate} at ${booking.sessionTime} is confirmed.</p>`);
    }

    if (student?.email) {
      await notify(student.email, "Payment Successful | TutorMitra",
      `<p>Dear ${student.name}, your payment of ₹${booking.amount} was successful.</p>`);

      await notify(student.email, "Booking Confirmed | TutorMitra",
      `<p>Your booking for course ${booking.courseName} with tutor ${tutor?.name} on ${booking.sessionDate} at ${booking.sessionTime} is confirmed.</p>`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Release payment to tutor after session completion
 */
export const releaseTutorPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ success: false, message: "Booking ID required." });

    // Fetch booking with tutor and student details
    const booking = await Booking.findById(bookingId).populate([
      { path: "tutor", select: "name email" },
      { path: "student", select: "name email" }
    ]);

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    if (booking.status !== "completed") return res.status(400).json({ success: false, message: "Session not yet completed." });
    if (booking.paymentStatus !== "success") return res.status(400).json({ success: false, message: "Payment not confirmed yet." });
    if (booking.tutorPaid) return res.status(400).json({ success: false, message: "Tutor already paid." });

    // Calculate tutor's payout after 10% commission deduction
    const tutorAmount = Math.floor(booking.amount * (1 - PLATFORM_COMMISSION));

    booking.tutorPaid = true; // Mark as paid
    await booking.save();

    // Send email notification to tutor
    if (booking.tutor?.email) {
      await sendNotificationEmail({
        to: booking.tutor.email,
        subject: "Payment Released | TutorMitra",
        html: `<p>Dear ${booking.tutor.name},</p><p>Your payment of ₹${tutorAmount} for the session on ${booking.sessionDate} has been released. Thank you for your valuable contribution.</p><p>Regards,<br/>TutorMitra Team</p>`
      });
    }

    res.status(200).json({ success: true, tutorAmount, message: "Payment released to tutor." });
  } catch (error) {
    console.error("Error releasing tutor payment:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};
