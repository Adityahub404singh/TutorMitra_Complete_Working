import { sendEmail } from "./emailService";

const adminEmail = process.env.ADMIN_EMAIL || "bmadityas@gmail.com";

/**
 * Booking notification
 */
export async function sendBookingNotification(booking: any) {
  const subject = "New Booking Alert - TutorMitra";
  const message = `New booking by student ID: ${booking.studentId} for tutor ID: ${booking.tutorId} on ${booking.sessionDate} at ${booking.sessionTime}. Subject: ${booking.subject}. Price: ₹${booking.price}.`;
  
  await sendEmail(adminEmail, subject, message);
}

/**
 * User signup notification (sample)
 */
export async function sendUserSignupNotification(user: any) {
  const subject = "New User Signup - TutorMitra";
  const message = `New user signed up with email: ${user.email} and role: ${user.role}.`;
  
  await sendEmail(adminEmail, subject, message);
}

/**
 * Payment notification (sample)
 */
export async function sendPaymentNotification(payment: any) {
  const subject = "New Payment Received - TutorMitra";
  const message = `Payment of ₹${payment.amount} received from user ID: ${payment.userId} on ${payment.date}. Transaction ID: ${payment.transactionId}.`;
  
  await sendEmail(adminEmail, subject, message);
}
