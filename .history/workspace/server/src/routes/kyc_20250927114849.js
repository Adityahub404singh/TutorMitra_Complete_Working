import express from "express";
import multer from "multer";
import { uploadDoc, approve, reject, status } from "../controllers/kycController.js"; // exact exports correct karo
import { authenticate } from "../middleware/auth.js"; // middleware path confirm karo

const router = express.Router();

// Multer storage configuration for KYC documents
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/kyc");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Routes
router.post("/upload", authenticate, upload.single("kycDoc"), uploadDoc);

router.get("/status", authenticate, status);

router.patch("/approve/:id", authenticate, approve);

router.patch("/reject/:id", authenticate, reject);

export default router;
