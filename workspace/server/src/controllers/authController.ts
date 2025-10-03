import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/emailService.js"; // Nodemailer email util (apna bana lo)

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// JWT token generate karne ka helper
const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token, role: user.role, user });
};

// Register controller with role check and duplicate email logic
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide all fields" });
    }

    // Check if already registered with same role
    const existingUser = await User.findOne({ email: email.trim().toLowerCase(), role });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: `User already exists as ${role}` });
    }

    // Prevent different role duplication for same email
    const otherRole = role === "student" ? "tutor" : "student";
    const otherRoleUser = await User.findOne({ email: email.trim().toLowerCase(), role: otherRole });
    if (otherRoleUser) {
      return res
        .status(400)
        .json({ success: false, error: `Email already registered as ${otherRole}` });
    }

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
    });

    sendTokenResponse(user, 201, res);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Login controller with role-based authentication
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide email, password, and role" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase(), role }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, error: "No account for this role and email" });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Forgot Password - send reset email with token
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;

    // Send email - replace with actual email sending in your app
    const message = `
      <p>Hello ${user.name},</p>
      <p>You requested a password reset. Click below link to reset:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour.</p>
    `;

    await sendEmail(user.email!, "TutorMitra Password Reset", message);

    res.status(200).json({ success: true, message: "Password reset email sent" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Reset password controller
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const resetToken = req.params.token; // from URL
    const password = req.body.password;
    if (!password) {
      return res.status(400).json({ success: false, error: "Password is required" });
    }

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid or expired token" });
    }

    // Hash new password and save
    user.password = await bcrypt.hash(password.trim(), 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
