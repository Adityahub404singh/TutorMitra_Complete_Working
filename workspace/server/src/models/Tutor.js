import mongoose from "mongoose";

const tutorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  profileImage: {
    type: String,
    default: "",
  },
  // ... (baki tumhara code same as it is)
  // --- KYC fields add karo yahan par ---
  kycStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  kycDocuments: {
    type: [String],
    default: [],
  },
  // --- baaki tumhara original code niche rehne do ---
  phone: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  subjects: {
    type: [String],
    default: [],
  },
  experience: {
    type: Number,
    default: 0,
    min: 0,
    max: 50,
  },
  feePerHour: {
    type: Number,
    default: 0,
    min: 0,
    max: 10000,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0,
  },
  mode: {
    type: String,
    enum: ["online", "offline", "both"],
    default: "both",
  },
  bio: {
    type: String,
    default: "",
    maxlength: 1000,
  },
  qualifications: {
    type: [String],
    default: [],
  },
  qualificationDoc: {
    type: String,
    default: "",
  },
  availability: {
    type: Map,
    of: [
      {
        startTime: String,
        endTime: String,
        isAvailable: { type: Boolean, default: true },
      },
    ],
    default: new Map(),
  },
  slots: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  socialLinks: {
    linkedin: { type: String, default: "" },
    website: { type: String, default: "" },
    youtube: { type: String, default: "" },
  },
  totalStudents: {
    type: Number,
    default: 0,
  },
  totalSessions: {
    type: Number,
    default: 0,
  },
  address: {
    type: String,
    default: "",
  },
  coordinates: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  availableFrom: {
    type: String,
    default: "",
  },
  availableTo: {
    type: String,
    default: "",
  },
},
{
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      if (
        ret.profileImage &&
        !ret.profileImage.startsWith("http") &&
        !ret.profileImage.startsWith("/uploads/") &&
        ret.profileImage !== ""
      ) {
        ret.profileImage = `/uploads/${ret.profileImage}`;
      }
      return ret;
    },
  },
  toObject: { virtuals: true },
}
);

tutorSchema.index({ userId: 1 }, { unique: true });
tutorSchema.index({ city: 1 });
tutorSchema.index({ subjects: 1 });
tutorSchema.index({ rating: -1 });
tutorSchema.index({ isActive: 1 });

tutorSchema.virtual("profileCompletion").get(function () {
  let completion = 0;
  const fields = ["name", "phone", "city", "bio", "experience", "feePerHour"];
  fields.forEach((field) => {
    if (this[field] && this[field] !== "" && this[field] !== 0) {
      completion += 15;
    }
  });
  if (this.subjects && this.subjects.length > 0) completion += 10;
  if (this.profileImage) completion += 10;
  return Math.min(completion, 100);
});

tutorSchema.pre("save", function (next) {
  if (!Array.isArray(this.subjects)) this.subjects = [];
  if (!Array.isArray(this.qualifications)) this.qualifications = [];
  if (!Array.isArray(this.slots)) this.slots = [];
  if (this.rating < 0) this.rating = 0;
  if (this.rating > 5) this.rating = 5;
  if (this.experience < 0) this.experience = 0;
  if (this.feePerHour < 0) this.feePerHour = 0;
  next();
});

tutorSchema.statics.findBySubject = function (subject) {
  return this.find({
    subjects: { $regex: subject, $options: "i" },
    isActive: true,
  });
};

const Tutor = mongoose.model("Tutor", tutorSchema);

export default Tutor;
