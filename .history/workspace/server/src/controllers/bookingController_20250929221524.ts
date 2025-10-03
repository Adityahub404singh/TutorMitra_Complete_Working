import { Request, Response } from "express";
import Booking from "../models/BooKing.js";
import Tutor from "../models/Tutor.js";
import Course from "../models/Course.js";
import User from "../models/user.js";
import { sendNotificationEmail } from "../utils/notificationService.js";
import { bookingConfirmationTemplate } from "../templates/emailTemplates.js";

interface TutorDoc {
  email?: string;
  name?: string;
  feePerHour?: number;
}

interface CourseDoc {
  title?: string;
  price?: number;
}

interface UserDoc {
  email?: string;
  name?: string;
}

export const createBooking = async (req: Request, res: Response) => {
  try {
    const user = req.user as { id?: string } | undefined;
    if (!user?.id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { tutorId, courseId, sessionDate, sessionTime, message, bookingType } = req.body;

    if (!tutorId || !sessionDate || !sessionTime) {
      return res.status(400).json({ success: false, message: "Tutor, session date and time are required" });
    }

    const tutor = (await Tutor.findById(tutorId)) as TutorDoc | null;
    if (!tutor) {
      return res.status(404).json({ success: false, message: "Tutor not found" });
    }

    let course: CourseDoc | null = null;
    if (courseId) {
      course = (await Course.findById(courseId)) as CourseDoc | null;
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
    }

    let amount: number;
    if (bookingType === "trial") {
      amount = tutor.feePerHour && tutor.feePerHour >= 49 ? tutor.feePerHour : 49;
    } else {
      amount = course?.price ?? tutor.feePerHour ?? 500;
    }

    const booking = new Booking({
      student: user.id,
      tutor: tutorId,
      course: courseId ?? null,
      sessionDate: new Date(sessionDate),
      sessionTime,
      message: message || "",
      bookingType: bookingType ?? "tutor",
      status: "pending",
      amount,
      paymentStatus: "pending",
      canChat: false,
      privateDetailsUnlocked: false,
    });

    await booking.save();

    await booking.populate([
      { path: "student", select: "name email phone" },
      { path: "tutor", select: "name email profileImage city subjects phone whatsapp" },
      { path: "course", select: "title description price" },
    ]);

    const studentObj = (await User.findById(user.id)) as UserDoc | null;

    const tutorEmail = tutor.email ?? "";
    const tutorName = tutor.name ?? "Tutor";
    const courseTitle = course?.title ?? "Direct Tutor Booking";
    const studentName = studentObj?.name ?? "Student";
    const studentEmail = studentObj?.email ?? "";

    if (tutorEmail && studentName) {
      await sendNotificationEmail({
        to: tutorEmail,
        subject: "New Booking Request | TutorMitra",
        html: bookingConfirmationTemplate({
          name: tutorName,
          courseName: courseTitle,
          time: `${sessionDate} at ${sessionTime}`,
          tutorName: tutorName,
        }),
      });
    }

    if (studentEmail) {
      await sendNotificationEmail({
        to: studentEmail,
        subject: "Booking Requested | TutorMitra",
        html: bookingConfirmationTemplate({
          name: studentName,
          courseName: courseTitle,
          time: `${sessionDate} at ${sessionTime}`,
          tutorName: tutorName,
        }),
      });
    }

    return res.status(201).json({
      success: true,
      data: booking,
      message: "Booking created successfully and notifications sent!",
    });
  } catch (error) {
    console.error("Create Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating booking.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
