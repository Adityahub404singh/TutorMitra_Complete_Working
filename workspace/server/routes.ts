import type { Express } from "express";
import {  createServer, Server } from "http";
import { storage } from "./storage";

import { insertBookingSchema } from "@shared/schema";
import { z } from "zod";


export async function registerRoutes(app: Express): Promise<Server> {
  // Subjects routes
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.get("/api/subjects/:id", async (req, res) => {
    try {
      const subject = await storage.getSubject(req.params.id);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      res.json(subject);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subject" });
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
      res.json(tutors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tutors" });
    }
  });

  app.get("/api/tutors/featured", async (req, res) => {
    try {
      const tutors = await storage.getFeaturedTutors();
      res.json(tutors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured tutors" });
    }
  });

  app.get("/api/tutors/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const tutors = await storage.searchTutors(q);
      res.json(tutors);
    } catch (error) {
      res.status(500).json({ message: "Failed to search tutors" });
    }
  });

  app.get("/api/tutors/:id", async (req, res) => {
    try {
      const tutor = await storage.getTutor(req.params.id);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      res.json(tutor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tutor" });
    }
  });

  // Bookings routes
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid booking data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
