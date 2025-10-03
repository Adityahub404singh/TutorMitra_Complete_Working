import mongoose, { Document, Schema } from "mongoose";

export interface ICourse extends Document {
  title: string;
  description?: string;
  price: number;
  category: string;
  instructor: mongoose.Types.ObjectId; // <-- MUST ref Tutor only
  coachingType: "online" | "offline" | "both";
  location?: string;
  address?: string;
  thumbnail?: string;
  rating?: number;
  studentsEnrolled?: number;
  duration?: number;
  language?: string;
  startDate?: string;
  availableFrom?: string;
  availableTo?: string;
  topics?: string[];
  isFeatured?: boolean;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "academic", "programming", "language", "music", "arts",
        "sports", "science", "mathematics", "other"
      ]
    },
    instructor: { type: Schema.Types.ObjectId, ref: "Tutor", required: true }, // <-- This is correct
    coachingType: { type: String, enum: ["online", "offline", "both"], required: true },
    location: { type: String, default: "" },
    address: { type: String, default: "" },
    thumbnail: { type: String, default: "default-course.jpg" },
    rating: { type: Number, default: 0 },
    studentsEnrolled: { type: Number, default: 0 },
    duration: { type: Number, default: 10 },
    language: { type: String, default: "English" },
    startDate: { type: String },
    availableFrom: { type: String },
    availableTo: { type: String },
    topics: [{ type: String }],
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Course = mongoose.model<ICourse>("Course", CourseSchema);
export default Course;
