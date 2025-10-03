import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, default: "general" },      // booking, chat, payment, etc.
    title: { type: String, default: "" },            // e.g. "Booking Confirmed"
    message: { type: String, required: true },
    link: { type: String, default: "" },             // optional link (booking/chat/payment)
    read: { type: Boolean, default: false },
  },
  { timestamps: true }                               // includes createdAt, updatedAt automatically
);

// Index for fast lookup
notificationSchema.index({ userId: 1, type: 1, read: 1 });

export default mongoose.model("Notification", notificationSchema);
