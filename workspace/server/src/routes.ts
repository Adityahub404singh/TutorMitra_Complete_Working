import type { Express } from "express";
import { createServer, Server } from "http";
import { storage } from "./storage.js";
import { insertBookingSchema } from "./shared/schema.js";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Subjects routes
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json({ success: true, data: subjects });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch subjects" });
    }
  });

  app.get("/api/subjects/:id", async (req, res) => {
    try {
      const subject = await storage.getSubject(req.params.id);
      if (!subject) {
        return res.status(404).json({ success: false, message: "Subject not found" });
      }
      res.json({ success: true, data: subject });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch subject" });
    }
  });

  // Tutors routes
  app.get("/api/tutors", async (req, res) => {
    try {
      const { subject, minRating } = req.query;
      const filters: { subject?: string; minRating?: number } = {};

      if (subject && typeof subject === "string") {
        filters.subject = subject;
      }

      if (minRating && typeof minRating === "string") {
        filters.minRating = parseFloat(minRating);
      }

      const tutors = await storage.getTutors(filters);
      res.json({ success: true, data: tutors });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch tutors" });
    }
  });

  app.get("/api/tutors/featured", async (req, res) => {
    try {
      const tutors = await storage.getFeaturedTutors();
      res.json({ success: true, data: tutors });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch featured tutors" });
    }
  });

  app.get("/api/tutors/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ success: false, message: "Search query is required" });
      }

      const tutors = await storage.searchTutors(q);
      res.json({ success: true, data: tutors });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to search tutors" });
    }
  });

  app.get("/api/tutors/:id", async (req, res) => {
    try {
      const tutor = await storage.getTutor(req.params.id);
      if (!tutor) {
        return res.status(404).json({ success: false, message: "Tutor not found" });
      }
      res.json({ success: true, data: tutor });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch tutor" });
    }
  });

  // Bookings routes
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse({
        ...req.body,
        date: new Date(req.body.date).toISOString(),  // Convert to ISO string
      });
      const booking = await storage.createBooking({
        ...validatedData,
        date: new Date(validatedData.date), // Convert back to Date object
      });
      res.status(201).json({ success: true, data: booking });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking data",
          errors: error.format(),
        });
      }
      res.status(500).json({ success: false, message: "Failed to create booking" });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json({ success: true, data: bookings });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      res.json({ success: true, data: booking });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch booking" });
    }
  });

  // Create and return the HTTP server wrapping the Express app
  const httpServer = createServer(app);
  return httpServer;
}
