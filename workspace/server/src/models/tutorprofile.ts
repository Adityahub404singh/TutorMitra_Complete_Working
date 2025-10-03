import mongoose from 'mongoose';

const TutorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  name: String,
  subjects: [String],
  experience: Number,
  feePerHour: Number,
  mode: { type: String, enum: ['online', 'offline', 'both'], default: 'both' },
  city: String,
  pin: String,
  mapLink: String,
  slots: [String],
  profilePicUrl: String,
  qualificationDocUrl: String,
  verifiedTutor: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('TutorProfile', TutorProfileSchema);
