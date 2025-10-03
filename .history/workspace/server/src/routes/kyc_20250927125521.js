// File: routes/kycRoutes.ts

import { Router } from "express";
import multer from "multer";
import path from "path";
import { verifyToken } from "../middleware/authMiddleware.js";
import { KycDocument } from "../models/Kyc.js";

const router = Router();

// Configure multer storage & file naming
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/kyc_docs/"); // save files here (folder should exist)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${req.user.id}_${file.fieldname}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

router.post(
  "/upload",
  verifyToken,
  upload.fields([
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Save file info to DB for the user
      const { files } = req;
      if (
        !files ||
        !files["aadhaarFront"] ||
        !files["aadhaarBack"] ||
        !files["panCard"] ||
        !files["selfie"]
      ) {
        return res.status(400).json({ message: "All files are required" });
      }

      // Save document records in DB associated with user
      await KycDocument.findOneAndUpdate(
        { userId: req.user.id },
        {
          userId: req.user.id,
          aadhaarFront: files["aadhaarFront"][0].filename,
          aadhaarBack: files["aadhaarBack"][0].filename,
          panCard: files["panCard"][0].filename,
          selfie: files["selfie"][0].filename,
          status: "pending",
          updatedAt: new Date(),
        },
        { upsert: true }
      );

      return res.json({ success: true, message: "Documents uploaded successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
