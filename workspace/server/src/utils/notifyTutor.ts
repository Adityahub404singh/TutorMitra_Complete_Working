import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // from your .env
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// The main function to call from booking/payment controllers
interface NotificationOptions {
  to: string;           // tutor email
  studentName: string;
  sessionDate: string;
  sessionTime: string;
  isPayment?: boolean;  // true => payment; false/undefined => booking
  bookingId?: string;   // optional, for links in the email
  amount?: number;      // optional, for payment notifications
}

export async function notifyTutor({
  to,
  studentName,
  sessionDate,
  sessionTime,
  isPayment = false,
  bookingId,
  amount,
}: NotificationOptions) {
  const subject = isPayment
    ? "Payment Received for Your TutorMitra Session"
    : "New Booking Request on TutorMitra";

  const bookingLink = bookingId
    ? `http://localhost:5173/my-bookings/${bookingId}`
    : "http://localhost:5173/my-bookings";

  const body = isPayment
    ? `
      <p>Hi,</p>
      <p>You have received a payment of <b>₹${amount}</b> for a session booked by <b>${studentName}</b> on <b>${sessionDate}</b> at <b>${sessionTime}</b>.</p>
      <p>View your booking for more details: <a href="${bookingLink}">${bookingLink}</a></p>
      <p>Thank you for using TutorMitra!</p>
    `
    : `
      <p>Hi,</p>
      <p><b>${studentName}</b> has requested a session with you on <b>${sessionDate}</b> at <b>${sessionTime}</b>.</p>
      <p>Please login to TutorMitra to review and accept the booking.</p>
      <p>View your bookings: <a href="${bookingLink}">${bookingLink}</a></p>
      <p>Thank you for using TutorMitra!</p>
    `;

  await transporter.sendMail({
    from: `"TutorMitra" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html: body,
  });
}
