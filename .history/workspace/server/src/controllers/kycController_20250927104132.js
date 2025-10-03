import Tutor from "../models/Tutor.js";

// Document upload - file ki path multer se aayegi
export const uploadKycDoc = async (req, res) => {
  try {
    const tutorId = req.user._id; // Auth middleware se id lo
    const filePath = req.file ? req.file.path : null;
    if (!filePath) {
      return res.status(400).json({ success: false, message: "No file uploaded!" });
    }
    // File path DB mein daalo
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ success: false, message: "Tutor not found!" });
    }
    tutor.kycDocuments.push(filePath);
    tutor.kycStatus = "pending";
    await tutor.save();
    res.json({ success: true, message: "Document uploaded! KYC pending approval." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error!", error: err });
  }
};

// KYC Approve (Admin)
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
    res.status(500).json({ success: false, message: "Server error!", error: err });
  }
};

// KYC Reject (Admin)
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
    res.status(500).json({ success: false, message: "Server error!", error: err });
  }
};

// Tutor ka KYC status fetch (frontend use ke liye)
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
      kycDocuments: tutor.kycDocuments
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error!", error: err });
  }
};
