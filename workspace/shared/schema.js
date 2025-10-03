import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
export const subjects = pgTable("subjects", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    name: text("name").notNull(),
    icon: text("icon").notNull(),
    tutorCount: integer("tutor_count").notNull().default(0),
    color: text("color").notNull(),
});
export const tutors = pgTable("tutors", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    subjects: jsonb("subjects").notNull().$type(),
    experience: text("experience").notNull(),
    rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
    hourlyRate: integer("hourly_rate").notNull(),
    bio: text("bio").notNull(),
    imageUrl: text("image_url").notNull(),
    availability: jsonb("availability").notNull().$type(),
    sessionTypes: jsonb("session_types").notNull().$type(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const bookings = pgTable("bookings", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tutorId: varchar("tutor_id").references(() => tutors.id).notNull(),
    studentName: text("student_name").notNull(),
    studentEmail: text("student_email").notNull(),
    date: text("date").notNull(),
    timeSlot: text("time_slot").notNull(),
    sessionType: text("session_type").notNull(),
    specialRequirements: text("special_requirements"),
    totalAmount: integer("total_amount").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const insertSubjectSchema = createInsertSchema(subjects).omit({
    id: true,
});
export const insertTutorSchema = createInsertSchema(tutors).omit({
    id: true,
    createdAt: true,
});
export const insertBookingSchema = createInsertSchema(bookings).omit({
    id: true,
    createdAt: true,
});
