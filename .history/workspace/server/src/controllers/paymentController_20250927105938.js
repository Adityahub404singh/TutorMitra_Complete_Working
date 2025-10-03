import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js"; // check spelling
import Tutor from "../models/Tutor.js";
import User from "../models/user.js";
import { sendNotificationEmail } from "../utils/notificationService.js";
import { paymentNotification, bookingConfirmation } from "../templates/emailTemplates.js";

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
  throw new Error("Razorpay key ID or secret is missing in environment variables");
}

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    if (!bookingId || !amount) {
      return res.status(400).json({ message: "bookingId and amount are required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.paymentStatus === "success") {
      return res.status(400).json({ message: "Invalid booking or already paid" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // amount in paise
      currency: "INR",
      receipt: `tm-booking-${bookingId}`,
      payment_capture: 1,
    });

    res.json({
      orderId: order.id,
      razorpayKey: razorpayKeyId,
      amount: order.amount,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "Failed to create payment order" });
  }
};

// Payment verification controller
export const verifyPayment = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "failed" });
      return res.status(400).json({ message: "Payment verification failed: signature mismatch" });
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

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Send notification emails
    try {
      const tutor = await Tutor.findById(booking.tutor);
      const student = await User.findById(booking.student);

      if (tutor?.email) {
        await sendNotificationEmail({
          to: tutor.email,
          subject: "New Paid Booking | TutorMitra",
          html: paymentNotification({
            name: tutor.name,
            amount: booking.amount,
            status: "Received",
          }),
        });

        await sendNotificationEmail({
          to: tutor.email,
          subject: "Booking Confirmed | TutorMitra",
          html: bookingConfirmation({
            name: tutor.name,
            courseName: booking.courseName,
            time: `${booking.sessionDate} at ${booking.sessionTime}`,
            tutorName: tutor.name,
          }),
        });
      }

      if (student?.email) {
        await sendNotificationEmail({
          to: student.email,
          subject: "Payment Success & Booking Confirmed | TutorMitra",
          html: paymentNotification({
            name: student.name,
            amount: booking.amount,
            status: "Successful",
          }),
        });

        await sendNotificationEmail({
          to: student.email,
          subject: "Session Booking Confirmed | TutorMitra",
          html: bookingConfirmation({
            name: student.name,
            courseName: booking.courseName,
            time: `${booking.sessionDate} at ${booking.sessionTime}`,
            tutorName: tutor.name,
          }),
        });
      }
    } catch (err) {
      console.error("Error sending notification emails:", err);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Failed to verify payment", error: error.message });
  }
};
