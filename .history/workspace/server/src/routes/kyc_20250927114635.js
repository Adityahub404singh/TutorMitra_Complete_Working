import express from "express";
import multer from "multer";
import { uploadKycDoc, approveKyc, rejectKyc, getKycStatus } from "../controllers/kycController.js";
import { authenticate } from "../middleware/auth.js"; // aapka auth middleware import sahi se

const router = express.Router();

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/kyc");
  },
  filename: function (req, file, cb) {
    // filename me timestamp + original name add kar rahe hain
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Routes with authentication & file upload middleware use kar ke
router.post("/upload", authenticate, upload.single("kycDoc"), uploadKycDoc);

router.get("/status", authenticate, getKycStatus);

router.patch("/approve/:id", authenticate, approveKyc);

router.patch("/reject/:id", authenticate, rejectKyc);

export default router;
