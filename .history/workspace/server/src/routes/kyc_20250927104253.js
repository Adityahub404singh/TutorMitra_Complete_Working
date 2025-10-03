import express from "express";
import multer from "multer";
import { uploadKycDoc, approveKyc, rejectKyc, getKycStatus } from "../controllers/kycController.js";
import auth from "../middleware/auth.js";

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/kyc');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// --- Router ---
const router = express.Router();

// Tutor doc upload
router.post("/upload", auth, upload.single("kycDoc"), uploadKycDoc);

// Get KYC status (tutor ke liye)
router.get("/status", auth, getKycStatus);

// Approve (admin panel me use hoga)
router.patch("/approve/:id", auth, approveKyc);

// Reject (admin panel me use hoga)
router.patch("/reject/:id", auth, rejectKyc);

export default router;
