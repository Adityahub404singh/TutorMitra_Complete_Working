// routes/kycRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";
import { KycDocument } from "../models/Kyc.js";

const router = express.Router();

// Configure multer storage - Ensure 'uploads/kyc_docs/' exists with write permission
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/kyc_docs/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${req.user.id}_${file.fieldname}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

router.post(
  "/upload",
  protect,
  upload.fields([
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files;
      if (
        !files ||
        !files.aadhaarFront ||
        !files.aadhaarBack ||
        !files.panCard ||
        !files.selfie
      ) {
        return res.status(400).json({ message: "All documents/files are required." });
      }

      // Prepare document info to save in DB
      const docData = {
        userId: req.user.id,
        aadhaarFront: files.aadhaarFront[0].filename,
        aadhaarBack: files.aadhaarBack[0].filename,
        panCard: files.panCard[0].filename,
        selfie: files.selfie[0].filename,
        status: "pending",
        updatedAt: Date.now(),
      };

      // Save or update document record for user
      await KycDocument.findOneAndUpdate(
        { userId: req.user.id },
        docData,
        { upsert: true }
      );

      return res.json({ success: true, message: "Documents uploaded successfully." });
    } catch (error) {
      console.error("Error in KYC upload:", error);
      return res.status(500).json({ message: "Server error during KYC upload." });
    }
  }
);

export default router;
