import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/BooKing.js";
import Tutor from "../models/Tutor.js";
import User from "../models/user.js";
import { sendNotificationEmail } from "../utils/notificationService.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLATFORM_COMMISSION = 0.1; // 10%

export const createOrder = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    if (!bookingId || !amount) return res.status(400).json({ message: "Booking ID and amount required" });

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.paymentStatus === "success")
      return res.status(400).json({ message: "Invalid booking or already paid" });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `tm-booking-${bookingId}`,
      payment_capture: 1,
    });

    return res.json({
      orderId: order.id,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({ message: "Failed to create order" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ message: "Missing payment details" });

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "failed" });
      return res.status(400).json({ message: "Payment signature mismatch" });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: "success",
        status: "confirmed",
        canChat: true,
        privateDetailsUnlocked: true,
      },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const tutor = await Tutor.findById(booking.tutor);
    const student = await User.findById(booking.student);

    const sendEmail = async (to, subject, html) => {
      try {
        await sendNotificationEmail({ to, subject, html });
      } catch (e) {
        console.error("Email Error:", e);
      }
    };

    if (tutor?.email) {
      await sendEmail(
        tutor.email,
        "Booking Paid - TutorMitra",
        `<p>Hi ${tutor.name}, ₹${booking.amount} payment received for your booking.</p>`
      );
      await sendEmail(
        tutor.email,
        "Booking Confirmed - TutorMitra",
        `<p>Your booking for ${booking.courseName} on ${booking.sessionDate} at ${booking.sessionTime} is confirmed.</p>`
      );
    }

    if (student?.email) {
      await sendEmail(
        student.email,
        "Payment Successful - TutorMitra",
        `<p>Hi ${student.name}, your payment of ₹${booking.amount} was successful.</p>`
      );
      await sendEmail(
        student.email,
        "Booking Confirmed - TutorMitra",
        `<p>Your booking for ${booking.courseName} with tutor ${tutor?.name} on ${booking.sessionDate} at ${booking.sessionTime} is confirmed.</p>`
      );
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const releaseTutorPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ message: "Booking ID required" });

    const booking = await Booking.findById(bookingId).populate(["tutor", "student"]);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status !== "completed")
      return res.status(400).json({ message: "Session not completed yet." });
    if (booking.paymentStatus !== "success")
      return res.status(400).json({ message: "Payment not confirmed on booking." });
    if (booking.tutorPaid) return res.status(400).json({ message: "Tutor already paid." });

    const tutorAmount = Math.floor(booking.amount * (1 - PLATFORM_COMMISSION));
    booking.tutorPaid = true;
    await booking.save();

    if (booking.tutor?.email) {
      await sendNotificationEmail({
        to: booking.tutor.email,
        subject: "Payment Released - TutorMitra",
        html: `<p>Hi ${booking.tutor.name}, your ₹${tutorAmount} payment for session on ${booking.sessionDate} has been released.</p><p>Thanks for being part of TutorMitra!</p>`,
      });
    }

    return res.json({ success: true, tutorAmount, message: "Payment released to tutor." });
  } catch (error) {
    console.error("Release Payment Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
