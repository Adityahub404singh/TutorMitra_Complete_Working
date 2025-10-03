// src/models/KycDocument.ts

import { Schema, model, Types } from "mongoose";

export interface IKycDocument {
  userId: Types.ObjectId;
  aadhaarFront: string;
  aadhaarBack: string;
  panCard: string;
  selfie: string;
  status: string; // e.g. "pending", "approved", "rejected"
  updatedAt: Date;
}

const kycDocumentSchema = new Schema<IKycDocument>({
  userId: { type: Schema.Types.ObjectId, required: true, unique: true, ref: "User" },
  aadhaarFront: { type: String, required: true },
  aadhaarBack: { type: String, required: true },
  panCard: { type: String, required: true },
  selfie: { type: String, required: true },
  status: { type: String, default: "pending" },
  updatedAt: { type: Date, default: Date.now }
});

export const KycDocument = model<IKyc
