export interface Storage {
  getSubjects(): Promise<any>;
  getSubject(id: string): Promise<any>;
  getTutors(filters?: { subject?: string; minRating?: number }): Promise<any>;
  getFeaturedTutors(): Promise<any>;
  searchTutors(q: string): Promise<any>;
  getTutor(id: string): Promise<any>;        // <-- Add this method declaration

  createBooking(data: any): Promise<any>;
  getBookings(): Promise<any>;
  getBooking(id: string): Promise<any>;
  // Add other methods as needed
}

export const storage: Storage;
