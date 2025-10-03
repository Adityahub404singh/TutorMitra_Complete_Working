// server/src/controllers/kycController.js

import { KycDocument } from "../models/Kyc.js";
import path from "path";

export const uploadDoc = async (req, res) => {
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

    const docData = {
      userId: req.user.id,
      aadhaarFront: files.aadhaarFront[0].filename,
      aadhaarBack: files.aadhaarBack[0].filename,
      panCard: files.panCard[0].filename,
      selfie: files.selfie[0].filename,
      status: "pending",
      updatedAt: new Date(),
    };

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

export const status = async (req, res) => {
  try {
    const record = await KycDocument.findOne({ userId: req.user.id });
    if (!record) {
      return res.json({ status: "not_started", documents: [] });
    }
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/kyc_docs/`;

    const documents = [
      baseUrl + record.aadhaarFront,
      baseUrl + record.aadhaarBack,
      baseUrl + record.panCard,
      baseUrl + record.selfie,
    ];

    return res.json({
      status: record.status,
      documents,
    });
  } catch (error) {
    console.error("Error fetching KYC status:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const approve = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required to approve." });
    }

    const record = await KycDocument.findOneAndUpdate(
      { userId },
      { status: "verified", updatedAt: new Date() },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ message: "KYC record not found." });
    }

    return res.json({ success: true, message: "KYC approved successfully.", record });
  } catch (error) {
    console.error("Error approving KYC:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const reject = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required to reject." });
    }

    const record = await KycDocument.findOneAndUpdate(
      { userId },
      { status: "rejected", reason: reason || "No reason provided", updatedAt: new Date() },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ message: "KYC record not found." });
    }

    return res.json({ success: true, message: "KYC rejected.", record });
  } catch (error) {
    console.error("Error rejecting KYC:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
