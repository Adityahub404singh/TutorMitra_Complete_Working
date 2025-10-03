import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  sessionDate: {
    type: Date,
    required: true
  },
  sessionTime: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  bookingType: {
    type: String,
    enum: ['tutor', 'course'],
    default: 'tutor'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'confirmed', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  // Contact details
  studentPhone: {
    type: String,
    default: null
  },
  tutorPhone: {
    type: String,
    default: null
  },
  // Privacy & chat access control
  canChat: {
    type: Boolean,
    default: false
  },
  privateDetailsUnlocked: {
    type: Boolean,
    default: false
  },

  // Session details
  sessionNotes: {
    type: String,
    default: ''
  },
  rating: {
    student: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    tutor: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    }
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: () => new Date()
  },
  updatedAt: {
    type: Date,
    default: () => new Date()
  },
  // Session timing
  sessionStartTime: {
    type: Date,
    default: null
  },
  sessionEndTime: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for session duration in minutes
bookingSchema.virtual('duration').get(function () {
  if (this.sessionStartTime && this.sessionEndTime) {
    return Math.round((this.sessionEndTime - this.sessionStartTime) / (1000 * 60)); // minutes
  }
  return null;
});

bookingSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for improved query performance
bookingSchema.index({ student: 1, createdAt: -1 });
bookingSchema.index({ tutor: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ sessionDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
