import mongoose, { Schema, Document, Model } from "mongoose";

// User interface for TypeScript
export interface IUser extends Document {
  googleId?: string;
  name: string;
  email: string;
  password?: string;
  role?: "student" | "tutor";
  photo?: string;
  profileImage?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  phone?: string;
  socialLinks?: Map<string, string>;
  paymentLinks?: Map<string, string>;
  isActive?: boolean;
  lastLogin?: Date;
  emailVerified?: boolean;

  // KYC Fields
  aadhaarNumber?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  kyCVerified?: boolean;
  videoSelfieUrl?: string;
  demoVideoUrl?: string;

  // Instance methods
  getPublicProfile(): object;
  updateLastLogin(): Promise<IUser>;
}

// User static methods interface
interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findActiveUsers(): Promise<IUser[]>;
  findTutors(): Promise<IUser[]>;
  findStudents(): Promise<IUser[]>;
}

const UserSchema: Schema<IUser> = new mongoose.Schema(
  {
    googleId: { type: String, sparse: true, index: true },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: { type: String, required: false, select: false },
    role: {
      type: String,
      enum: ["student", "tutor"],
      default: "student",
      required: true,
    },
    photo: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-()]{10,15}$/, "Please enter a valid phone number"],
    },
    socialLinks: { type: Map, of: String, default: new Map() },
    paymentLinks: { type: Map, of: String, default: new Map() },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    emailVerified: { type: Boolean, default: false },

    // KYC Fields added here
    aadhaarNumber: { type: String, unique: true, sparse: true, trim: true },
    bankAccountNumber: { type: String, trim: true },
    ifscCode: { type: String, trim: true },
    kyCVerified: { type: Boolean, default: false },
    videoSelfieUrl: { type: String, default: "" },
    demoVideoUrl: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        if (
          ret.profileImage &&
          !ret.profileImage.startsWith("http") &&
          !ret.profileImage.startsWith("/uploads") &&
          ret.profileImage !== ""
        ) {
          ret.profileImage = `/uploads/${ret.profileImage}`;
        }
        // Remove sensitive fields
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ googleId: 1 }, { sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

// Virtual to get full profile image URL
UserSchema.virtual("fullProfileImageUrl").get(function (this: IUser) {
  if (!this.profileImage) return "";
  if (
    this.profileImage.startsWith("http") ||
    this.profileImage.startsWith("/uploads")
  )
    return this.profileImage;
  return `/uploads/${this.profileImage}`;
});

// Pre-save hook for lastLogin initialization
UserSchema.pre<IUser>("save", function (next) {
  if (this.isNew) {
    this.lastLogin = new Date();
  }
  next();
});

// Instance methods
UserSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    profileImage: this.fullProfileImageUrl,
    phone: this.phone,
    socialLinks: this.socialLinks,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    // optionally expose KYC status as well
    kyCVerified: this.kyCVerified,
  };
};

UserSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

// Static methods
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true });
};

UserSchema.statics.findTutors = function () {
  return this.find({ role: "tutor", isActive: true });
};

UserSchema.statics.findStudents = function () {
  return this.find({ role: "student", isActive: true });
};

const User = mongoose.model<IUser, IUserModel>("User", UserSchema);

export default User;
