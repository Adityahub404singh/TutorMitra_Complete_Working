import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // "Tutor" model ki jagah "User" hona chahiye if tutors users hi hain
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 }, // rating ko 1 se 5 tak limit karna better hai
    comment: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

// Avoid OverwriteModelError on hot reloads
const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

export default Review;
