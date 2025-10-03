import { KycDocument } from "../models/Kyc.js";
import path from "path";

export const uploadDoc = async (req, res) => {
  try {
    const files = req.files;

    // Validate all files present
    if (
      !files ||
      !files.aadhaarFront ||
      !files.aadhaarBack ||
      !files.panCard ||
      !files.selfie
    ) {
      return res.status(400).json({ message: "All documents/files are required." });
    }

    // Assign filenames saved by multer
    const docData = {
      userId: req.user.id,
      aadhaarFront: files.aadhaarFront[0].filename,
      aadhaarBack: files.aadhaarBack[0].filename,
      panCard: files.panCard[0].filename,
      selfie: files.selfie[0].filename,
      status: "pending",
      updatedAt: new Date(),
    };

    // Save or update KYC document record in DB
    await KycDocument.findOneAndUpdate(
      { userId: req.user.id },
      docData,
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      message: "Documents uploaded successfully. Awaiting approval.",
    });
  } catch (error) {
    console.error("Error uploading KYC docs: ", error);
    return res.status(500).json({ message: "Internal server error during upload." });
  }
};
