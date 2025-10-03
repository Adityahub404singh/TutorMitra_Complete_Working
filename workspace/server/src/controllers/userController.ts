
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.js";

// Auth middleware se req.user set hota hai – har request me authorized user access

// ---- Get current logged-in user profile ----
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    // Password field exclude karo
    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Server Error" });
  }
};

// ---- Update profile: name, email, phone, social/payment links etc. ----
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { name, email, phone, socialLinks, paymentLinks } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    // Editable fields with trimming and validation if needed
    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (phone !== undefined) user.phone = phone.trim();
    if (socialLinks !== undefined) user.socialLinks = { ...(user.socialLinks ?? {}), ...socialLinks };
    if (paymentLinks !== undefined) user.paymentLinks = { ...(user.paymentLinks ?? {}), ...paymentLinks };

    await user.save();

    // Return updated info (password excluded by default)
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Server Error" });
  }
};

// ---- Securely update password (with old password verification) ----
export const updateUserPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, error: "Both current and new passwords required" });
      return;
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, error: "Current password is incorrect" });
      return;
    }

    // Save new password (hash it)
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Server Error" });
  }
};
