import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    // any other fields you want like subject, notes etc.
  },
  { timestamps: true }
);

const Session = mongoose.models.Session || mongoose.model("Session", SessionSchema);

export default Session;
