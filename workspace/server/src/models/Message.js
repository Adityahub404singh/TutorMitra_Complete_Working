import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chat:      { type: String, required: true }, // Room/Chat id (string, not ObjectId)
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName:{ type: String, required: true },
  receiver:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  content:   {
    type: String,
    required: function () { return this.messageType === 'text'; },
    trim: true,
    maxlength: 2000,
    default: ""
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'booking', 'system'],
    default: 'text'
  },
  fileUrl:   { type: String, default: null },
  fileName:  { type: String, default: null },
  fileSize:  { type: Number, default: null },
  isRead:    { type: Boolean, default: false },
  readAt:    { type: Date, default: null },
  isDelivered:{ type: Boolean, default: false },
  deliveredAt:{ type: Date, default: null },
  replyTo:   { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  bookingData:{
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
    action:    { type: String, enum: ['created','accepted','rejected','completed','cancelled'], default: null }
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  timestamp: { type: Date, default: null }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });
messageSchema.index({ isDeleted: 1 });

// Virtuals: For formatted time/date
messageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
});
messageSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-IN');
});

// Pre-save: Delivery & File check
messageSchema.pre('save', function(next) {
  if (!this.isDelivered) {
    this.isDelivered = true;
    this.deliveredAt = new Date();
  }
  if (this.messageType !== 'text' && this.messageType !== 'system' && !this.fileUrl) {
    return next(new Error('File URL is required for non-text messages'));
  }
  next();
});

// Methods: Seen, delete
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};
messageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Statics: Unread count
messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ receiver: userId, isRead: false, isDeleted: false });
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
