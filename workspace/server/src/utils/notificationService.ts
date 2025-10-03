// server/src/utils/notificationService.ts
import nodemailer from "nodemailer";

// Nodemailer transport setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Main function to send any type of notification email
export async function sendNotificationEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const mailOptions = {
    from: `"TutorMitra" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Notification email sent to ${to} | Subject: ${subject}`);
  } catch (err) {
    console.error("❌ Notification email send error:", err);
    throw err;
  }
}
