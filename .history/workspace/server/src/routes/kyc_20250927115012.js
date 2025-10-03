import express from "express";
import multer from "multer";
import {
  uploadKycDoc,
  approveKyc,
  rejectKyc,
  getKycStatus,
} from "../controllers/kycController.js";
import { authenticate } from "../middleware/auth.js"; // Ensure this path is correct in your project

const router = express.Router();

// Multer storage config for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/kyc"); // Ensure this folder exists or create it
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Routes with middleware and controllers
router.post(
  "/upload",
  authenticate,
  upload.single("kycDoc"),
  uploadKycDoc
);

router.get("/status", authenticate, getKycStatus);

router.patch("/approve/:id", authenticate, approveKyc);

router.patch("/reject/:id", authenticate, rejectKyc);

export default router;
