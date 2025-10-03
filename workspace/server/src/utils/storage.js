// src/utils/storage.js

// Sample dummy data or connect with actual DB here
const subjects = [ /*...*/ ];
const tutors = [ /*...*/ ];
const bookings = [ /*...*/ ];

export const storage = {
  getSubjects: async () => {
    // Fetch from DB or return dummy data
    return subjects;
  },

  getSubject: async (id) => {
    return subjects.find(s => s.id === id);
  },

  getTutors: async (filters) => {
    // Filter tutors based on criteria
    return tutors.filter(t => {
      let match = true;
      if (filters.subject) match = match && t.subject === filters.subject;
      if (filters.minRating) match = match && t.rating >= filters.minRating;
      return match;
    });
  },

  getFeaturedTutors: async () => {
    // Return featured tutors
    return tutors.filter(t => t.featured);
  },

  searchTutors: async (query) => {
    // Basic search by name or subject
    return tutors.filter(
      t => t.name.toLowerCase().includes(query.toLowerCase()) ||
           t.subject.toLowerCase().includes(query.toLowerCase())
    );
  },

  getTutor: async (id) => {
    return tutors.find(t => t.id === id);
  },

  createBooking: async (bookingData) => {
    bookingData.id = String(bookings.length + 1);
    bookings.push(bookingData);
    return bookingData;
  },

  getBookings: async () => {
    return bookings;
  },

  getBooking: async (id) => {
    return bookings.find(b => b.id === id);
  }
};
