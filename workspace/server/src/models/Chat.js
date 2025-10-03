import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  chatType: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Group chat specific fields
  groupName: {
    type: String,
    default: null
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Booking reference (if chat is created from booking)
  relatedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
chatSchema.index({ participants: 1 });
chatSchema.index({ updatedAt: -1 });
chatSchema.index({ isActive: 1 });

// Virtual for unread message count
chatSchema.virtual('unreadCount').get(function() {
  // This will be populated by the frontend or separate query
  return 0;
});

// Pre-save middleware
chatSchema.pre('save', function(next) {
  // Ensure participants array has at least 2 members for direct chat
  if (this.chatType === 'direct' && this.participants.length !== 2) {
    return next(new Error('Direct chat must have exactly 2 participants'));
  }
  next();
});

// Static method to find chat between two users
chatSchema.statics.findBetweenUsers = function(userId1, userId2) {
  return this.findOne({
    chatType: 'direct',
    participants: { $all: [userId1, userId2] }
  });
};

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
