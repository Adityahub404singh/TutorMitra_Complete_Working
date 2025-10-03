export interface Tutor {
  id: string;
  name: string;
  subjects: string[];
  hourlyRate: number;
  imageUrl?: string;
  location: string;
  rating?: number;
  bio?: string;
  sessionTypes: string[];
  availability: {
    timeSlots: string[];
  };
  // New fields for enhanced display
  experience?: string;
  totalSessions?: number;
  isVerified?: boolean;
}

export interface InsertBooking {
  tutorId: string;
  studentName: string;
  studentEmail: string;
  date: string;
  timeSlot: string;
  sessionType: string;
  specialRequirements?: string;
  totalAmount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
}
