import nodemailer from "nodemailer";

// Use correct environment variables!
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL,     // ✅ Correct variable name!
    pass: process.env.SMTP_PASSWORD,  // ✅ Correct variable name!
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  const mailOptions = {
    from: `"TutorMitra" <${process.env.SMTP_EMAIL}>`, // ✅ Correct variable name!
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}
