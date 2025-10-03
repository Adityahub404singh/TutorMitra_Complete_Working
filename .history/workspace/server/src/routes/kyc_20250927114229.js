import express from "express";
import multer from "multer";
import { uploadKycDoc, approve, reject, getStatus } from "../controllers/kycController.js";
import { authenticate } from "../middleware/authenticate.js"; // sahi import

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/kyc');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Router initialization
const router = express.Router();

// Routes with authentication middleware
router.post("/upload", authenticate, upload.single("kycDoc"), uploadKycDoc);

router.get("/status", authenticate, getStatus);

router.patch("/approve/:id", authenticate, approve);

router.patch("/reject/:id", authenticate, reject);

export default router;
