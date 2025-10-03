import express, { Request, Response } from "express";
import User from "../models/user.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// =================== USER ROUTES ===================

// GET CURRENT USER PROFILE (/api/users/me)
router.get("/me", authenticate, async (req: Request, res: Response) => {
  try {
    console.log("📝 Getting current user profile...");

    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in token",
      });
    }

    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("✅ User profile found:", user.email);

    res.json({
      success: true,
      data: {
        id: user._id?.toString() || "",
        name: (user as any).name || "",
        email: (user as any).email || "",
        role: (user as any).role || "student",
        profileImage: (user as any).profileImage || null,
        phone: (user as any).phone || null,
        createdAt: (user as any).createdAt || new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("❌ Get current user error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch user profile",
    });
  }
});

// UPDATE USER PROFILE
router.put("/me", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { name, phone, profileImage } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const updateData: Record<string, any> = {};
    if (name && typeof name === "string") updateData.name = name.trim();
    if (phone && typeof phone === "string") updateData.phone = phone.trim();
    if (profileImage) updateData.profileImage = profileImage;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        id: updatedUser._id?.toString() || "",
        name: (updatedUser as any).name || "",
        email: (updatedUser as any).email || "",
        role: (updatedUser as any).role || "student",
        profileImage: (updatedUser as any).profileImage || null,
        phone: (updatedUser as any).phone || null,
      },
      message: "Profile updated successfully",
    });
  } catch (error: unknown) {
    console.error("❌ Update user error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update profile",
    });
  }
});

// DELETE USER ACCOUNT
router.delete("/me", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error: unknown) {
    console.error("❌ Delete user error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete account",
    });
  }
});

// GET ALL USERS (Admin)
router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      data: users.map((user) => ({
        id: user._id?.toString() || "",
        name: (user as any).name || "",
        email: (user as any).email || "",
        role: (user as any).role || "student",
        createdAt: (user as any).createdAt,
      })),
      count: users.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("❌ Get users error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch users",
    });
  }
});

// VERIFY USER TOKEN (CRITICAL for AuthContext check)
router.get("/verify", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id?.toString() || "",
        name: (user as any).name || "",
        email: (user as any).email || "",
        role: (user as any).role || "student",
      },
    });
  } catch (error: unknown) {
    console.error("❌ Token verification error:", error);
    res.status(401).json({
      success: false,
      message: "Token verification failed",
    });
  }
});

export default router;
