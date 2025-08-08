import { type Subject, type InsertSubject, type Tutor, type InsertTutor, type Booking, type InsertBooking } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Subjects
  getSubjects(): Promise<Subject[]>;
  getSubject(id: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;

  // Tutors
  getTutors(filters?: { subject?: string; minRating?: number }): Promise<Tutor[]>;
  getTutor(id: string): Promise<Tutor | undefined>;
  createTutor(tutor: InsertTutor): Promise<Tutor>;
  getFeaturedTutors(): Promise<Tutor[]>;
  searchTutors(query: string): Promise<Tutor[]>;

  // Bookings
  getBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  getTutorBookings(tutorId: string): Promise<Booking[]>;
}

export class MemStorage implements IStorage {
  private subjects: Map<string, Subject>;
  private tutors: Map<string, Tutor>;
  private bookings: Map<string, Booking>;

  constructor() {
    this.subjects = new Map();
    this.tutors = new Map();
    this.bookings = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Initialize subjects
    const subjectsData: Subject[] = [
      {
        id: randomUUID(),
        name: "Mathematics",
        icon: "fas fa-calculator",
        tutorCount: 2150,
        color: "blue",
      },
      {
        id: randomUUID(),
        name: "Physics",
        icon: "fas fa-atom",
        tutorCount: 1890,
        color: "green",
      },
      {
        id: randomUUID(),
        name: "Chemistry",
        icon: "fas fa-flask",
        tutorCount: 1540,
        color: "purple",
      },
      {
        id: randomUUID(),
        name: "English",
        icon: "fas fa-book",
        tutorCount: 2340,
        color: "red",
      },
      {
        id: randomUUID(),
        name: "Computer Science",
        icon: "fas fa-code",
        tutorCount: 1675,
        color: "yellow",
      },
      {
        id: randomUUID(),
        name: "Languages",
        icon: "fas fa-language",
        tutorCount: 980,
        color: "indigo",
      },
    ];

    subjectsData.forEach(subject => this.subjects.set(subject.id, subject));

    // Initialize tutors
    const tutorsData: Tutor[] = [
      {
        id: randomUUID(),
        name: "Dr. Sarah Chen",
        email: "***REMOVED_EMAIL***",
        subjects: ["Mathematics", "Physics", "Engineering"],
        experience: "8+ years experience • PhD in Applied Mathematics",
        rating: "4.9",
        hourlyRate: 800,
        bio: "Expert mathematician with extensive teaching experience in advanced mathematics and physics.",
        imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        availability: {
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          timeSlots: ["9:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "2:00 PM - 3:00 PM", "4:00 PM - 5:00 PM"],
        },
        sessionTypes: ["online", "in-person"],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Prof. Michael Kumar",
        email: "***REMOVED_EMAIL***",
        subjects: ["Computer Science", "Programming", "AI"],
        experience: "12+ years experience • Former Google Engineer",
        rating: "4.8",
        hourlyRate: 1200,
        bio: "Senior software engineer with expertise in machine learning and artificial intelligence.",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        availability: {
          days: ["Monday", "Wednesday", "Friday", "Saturday"],
          timeSlots: ["10:00 AM - 11:00 AM", "2:00 PM - 3:00 PM", "3:00 PM - 4:00 PM", "6:00 PM - 7:00 PM"],
        },
        sessionTypes: ["online", "in-person"],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Emma Rodriguez",
        email: "***REMOVED_EMAIL***",
        subjects: ["English", "Literature", "Writing"],
        experience: "6+ years experience • Master's in English Literature",
        rating: "4.9",
        hourlyRate: 600,
        bio: "Passionate English teacher specializing in literature analysis and creative writing.",
        imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b332c2bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        availability: {
          days: ["Tuesday", "Thursday", "Friday", "Sunday"],
          timeSlots: ["9:00 AM - 10:00 AM", "11:00 AM - 12:00 PM", "3:00 PM - 4:00 PM", "5:00 PM - 6:00 PM"],
        },
        sessionTypes: ["online", "in-person"],
        createdAt: new Date(),
      },
    ];

    tutorsData.forEach(tutor => this.tutors.set(tutor.id, tutor));
  }

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async getSubject(id: string): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const id = randomUUID();
    const subject: Subject = { 
      ...insertSubject, 
      id,
      tutorCount: insertSubject.tutorCount || 0
    };
    this.subjects.set(id, subject);
    return subject;
  }

  // Tutors
  async getTutors(filters?: { subject?: string; minRating?: number }): Promise<Tutor[]> {
    let tutors = Array.from(this.tutors.values());

    if (filters?.subject) {
      tutors = tutors.filter(tutor => 
        tutor.subjects.some(subject => 
          subject.toLowerCase().includes(filters.subject!.toLowerCase())
        )
      );
    }

    if (filters?.minRating) {
      tutors = tutors.filter(tutor => parseFloat(tutor.rating) >= filters.minRating!);
    }

    return tutors;
  }

  async getTutor(id: string): Promise<Tutor | undefined> {
    return this.tutors.get(id);
  }

  async createTutor(insertTutor: InsertTutor): Promise<Tutor> {
    const id = randomUUID();
    const tutor: Tutor = { 
      ...insertTutor, 
      id,
      createdAt: new Date(),
      subjects: insertTutor.subjects as string[]
    };
    this.tutors.set(id, tutor);
    return tutor;
  }

  async getFeaturedTutors(): Promise<Tutor[]> {
    const tutors = Array.from(this.tutors.values());
    return tutors
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, 3);
  }

  async searchTutors(query: string): Promise<Tutor[]> {
    const tutors = Array.from(this.tutors.values());
    const lowercaseQuery = query.toLowerCase();
    
    return tutors.filter(tutor => 
      tutor.name.toLowerCase().includes(lowercaseQuery) ||
      tutor.subjects.some(subject => subject.toLowerCase().includes(lowercaseQuery)) ||
      tutor.experience.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Bookings
  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = { 
      ...insertBooking, 
      id,
      createdAt: new Date(),
      specialRequirements: insertBooking.specialRequirements || null,
      status: insertBooking.status || "pending"
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getTutorBookings(tutorId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.tutorId === tutorId);
  }
}

export const storage = new MemStorage();
