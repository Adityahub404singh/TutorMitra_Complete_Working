import { z } from "zod";

// Interface Definitions
export interface Subject {
  id: string;
  name: string;
  icon?: string;
  tutorCount?: number;
  color?: string;
}

export interface Tutor {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  experience: string;
  rating: string;
  hourlyRate: number;
  bio: string;
  imageUrl: string;
  availability: {
    days: string[];
    timeSlots: string[];
  };
  sessionTypes: string[];
  createdAt: Date;
}

export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  date: Date;
  createdAt?: Date;
  specialRequirements?: string | null;
  status?: string;
}

// Insert Types (without auto-generated fields)
export type InsertSubject = Omit<Subject, 'id'>;
export type InsertTutor = Omit<Tutor, 'id' | 'createdAt'>;
export type InsertBooking = Omit<Booking, 'id' | 'createdAt'> & {
  specialRequirements?: string | null;
  status?: string;
};

// Zod Schema
export const insertBookingSchema = z.object({
  studentId: z.string(),
  tutorId: z.string(),
  date: z.string().datetime()
});

// Type for validated booking data
export type ValidBookingData = z.infer<typeof insertBookingSchema>;