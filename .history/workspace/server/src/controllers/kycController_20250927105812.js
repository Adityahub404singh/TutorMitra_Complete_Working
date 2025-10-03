import Tutor from "../models/Tutor.js";

// Document upload - KYC file path multer se aayegi
export const uploadKycDoc = async (req, res) => {
  try {
    const tutorId = req.user._id; // Auth middleware se user id lete hain
    const filePath = req.file ? req.file.path.replace(/\\/g, "/") : null; // Windows ke liye path fix karna
    
    if (!filePath) {
      return res.status(400).json({ success: false, message: "No file uploaded!" });
    }

    // Tutor ko locate karo
    const tutor = await Tutor.findById(tutorId);

    if (!tutor) {
      return res.status(404).json({ success: false, message: "Tutor not found!" });
    }

    // File path ko DB me push karo aur status "pending" set karo
    tutor.kycDocuments.push(filePath);
    tutor.kycStatus = "pending";

    await tutor.save();

    res.json({ success: true, message: "Document uploaded! KYC pending approval." });
  } catch (err) {
    console.error("uploadKycDoc error:", err);
    res.status(500).json({ success: false, message: "Server error!", error: err.message });
  }
};

// KYC Approve (Admin API)
export const approveKyc = async (req, res) => {
  try {
    const tutorId = req.params.id;
    const tutor = await Tutor.findById(tutorId);

    if (!tutor) {
      return res.status(404).json({ success: false, message: "Tutor not found!" });
    }

    tutor.kycStatus = "approved";
    await tutor.save();

    res.json({ success: true, message: "KYC Approved!" });
  } catch (err) {
    console.error("approveKyc error:", err);
    res.status(500).json({ success: false, message: "Server error!", error: err.message });
  }
};

// KYC Reject (Admin API)
export const rejectKyc = async (req, res) => {
  try {
    const tutorId = req.params.id;
    const tutor = await Tutor.findById(tutorId);

    if (!tutor) {
      return res.status(404).json({ success: false, message: "Tutor not found!" });
    }

    tutor.kycStatus = "rejected";
    await tutor.save();

    res.json({ success: true, message: "KYC Rejected!" });
  } catch (err) {
    console.error("rejectKyc error:", err);
    res.status(500).json({ success: false, message: "Server error!", error: err.message });
  }
};

// Tutor ka KYC Status Get karne wali API (Frontend ke liye)
export const getKycStatus = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const tutor = await Tutor.findById(tutorId);

    if (!tutor) {
      return res.status(404).json({ success: false, message: "Tutor not found!" });
    }

    res.json({
      success: true,
      kycStatus: tutor.kycStatus,
      kycDocuments: tutor.kycDocuments,
    });
  } catch (err) {
    console.error("getKycStatus error:", err);
    res.status(500).json({ success: false, message: "Server error!", error: err.message });
  }
};
