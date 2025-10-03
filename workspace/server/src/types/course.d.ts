import { Document, Types } from 'mongoose';

export interface ICourse extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  price: number;
  category: string;
  instructor: Types.ObjectId | {
    _id: Types.ObjectId;
    name: string;
    profileImage?: string;
  };
  coachingType: "online" | "offline" | "both";        // <- Must have!
  location?: string;
  address?: string;
  thumbnail: string;
  rating: number;
  studentsEnrolled: number;
  duration: number;
  language: string;
  startDate?: string;                // <- Add this!
  availableFrom?: string;            // <- Add this!
  availableTo?: string;              // <- Add this!
  topics?: string[];                 // <- Add this!
  isFeatured?: boolean;              // Optional for home-page logic
  createdAt: Date;
  updatedAt: Date;
}
