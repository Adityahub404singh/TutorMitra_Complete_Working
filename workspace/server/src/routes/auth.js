import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ---- GOOGLE OAUTH ----
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: process.env.CLIENT_URL || "http://localhost:5173",
    session: false,
  })
);

// ---- SIGNUP (Role-based, prevent duplicate roles for same email) ----
router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (!name || !email || !password || !["student", "tutor"].includes(role)) {
      return res.status(400).json({ message: "All fields required with valid role" });
    }
    // Check for duplicate email+role
    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
      role,
    });
    if (existingUser) {
      return res.status(400).json({ message: `Already registered as ${role}` });
    }
    const otherRole = role === "student" ? "tutor" : "student";
    const otherRoleUser = await User.findOne({
      email: email.trim().toLowerCase(),
      role: otherRole,
    });
    if (otherRoleUser) {
      return res.status(400).json({ message: `Email already registered as ${otherRole}` });
    }
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    // ⭐️ Return explicit JSON (NEVER full mongo doc — always plain object)
    res.status(201).json({
      message: "Signup successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Signup failed error:", error);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
});

// ---- LOGIN (Role-based) ----
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  try {
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role required" });
    }
    // Role-based login
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role,
    }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "No account for this role and email" });
    }
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    // ⭐️ Return explicit plain JS object, role included!
    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role // ⭐️⭐️⭐️ This line is CRITICAL ⭐️⭐️⭐️
      },
      token,
    });
  } catch (error) {
    console.error("Login failed error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// ---- Forgot password route ----
router.post("/forgot-password", forgotPassword);
// ---- Reset password route ----
router.post("/reset-password/:resettoken", resetPassword);

export default router;
