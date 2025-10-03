import express from 'express';
import multer from 'multer';

// Import exactly the named exports from controllers
import { uploadDoc, approve, reject, status } from '../controllers/kycController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/kyc');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Define route endpoints with correct controller functions and middleware
router.post('/upload', authenticate, upload.single('kycDoc'), uploadDoc);
router.get('/status', authenticate, status);
router.patch('/approve/:id', authenticate, approve);
router.patch('/reject/:id', authenticate, reject);

export default router;
