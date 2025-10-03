import { Request, Response } from "express";
import mongoose from "mongoose";
import Course, { ICourse } from "../models/Course.js";

// Create new course
export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, price, category, instructor, coachingType, location, address } = req.body;

    if (!title || !price || !category || !instructor || !coachingType) {
      return res.status(400).json({
        success: false,
        error: "Title, price, category, instructor and coaching type are required"
      });
    }
    if ((coachingType === 'offline' || coachingType === 'both') && (!location || !address)) {
      return res.status(400).json({
        success: false,
        error: "Location and address are required for offline courses"
      });
    }

    const newCourse = await Course.create({
      title: title.trim(),
      description: description?.trim() || 'Course description coming soon',
      price: Number(price),
      category,
      instructor,
      coachingType,
      location: location || '',
      address: address || '',
      thumbnail: req.body.thumbnail || 'default-course.jpg',
      rating: 0,
      studentsEnrolled: 0,
      duration: 10,
      language: 'English',
    });

    res.status(201).json({
      success: true,
      data: {
        id: newCourse._id,
        title: newCourse.title,
        price: newCourse.price,
        coachingType: newCourse.coachingType,
        location: newCourse.location,
        thumbnail: newCourse.thumbnail,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all courses (with filtering)
export const getCourses = async (req: Request, res: Response) => {
  try {
    const { coachingType, location } = req.query;
    const filter: any = {};
    if (coachingType && coachingType !== "all") filter.coachingType = coachingType;
    if (location && location !== "all")
      filter.location = new RegExp(location as string, "i");

    const courses = await Course.find(filter).populate("instructor", "name");
    res.json({
      success: true,
      data: courses.map((course) => ({
        id: course._id,
        title: course.title,
        price: course.price,
        coachingType: course.coachingType,
        location: course.location,
        instructor: course.instructor
          ? { name: (course.instructor as any).name }
          : undefined,
        description: course.description,
        topics: course.topics,
        rating: course.rating,
        duration: course.duration,
        language: course.language,
        startDate: course.startDate,
        thumbnail: course.thumbnail,
        availableFrom: course.availableFrom,
        availableTo: course.availableTo,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single course details by ID
export const getCourseDetails = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate<{ instructor: { name: string; profileImage: string } }>("instructor", "name profileImage");

    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }
    const instructorName = typeof course.instructor === "object" ? course.instructor.name : "Unknown";
    const instructorImage = typeof course.instructor === "object" ? course.instructor.profileImage : "default-instructor.jpg";
    res.json({
      success: true,
      data: {
        id: course._id,
        title: course.title,
        description: course.description,
        price: course.price,
        thumbnail: course.thumbnail,
        rating: course.rating,
        duration: course.duration,
        language: course.language,
        coachingType: course.coachingType,
        location: course.location,
        address: course.address,
        instructor: { name: instructorName, profileImage: instructorImage },
        studentsEnrolled: course.studentsEnrolled,
        topics: course.topics,
        startDate: course.startDate,
        availableFrom: course.availableFrom,
        availableTo: course.availableTo,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update course details
export const updateCourseDetails = async (req: Request, res: Response) => {
  try {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID format"
      });
    }
    const { title, description, price, category, duration, language, coachingType, location, address } = req.body;
    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (price) updateData.price = Number(price);
    if (category) updateData.category = category;
    if (duration) updateData.duration = Number(duration);
    if (language) updateData.language = language;
    if (coachingType) updateData.coachingType = coachingType;
    if (location) updateData.location = location;
    if (address) updateData.address = address;

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("instructor", "name profileImage");

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        error: "Course not found"
      });
    }

    res.json({
      success: true,
      data: {
        id: updatedCourse._id,
        title: updatedCourse.title,
        description: updatedCourse.description,
        price: updatedCourse.price,
        category: updatedCourse.category,
        duration: updatedCourse.duration,
        language: updatedCourse.language,
        coachingType: updatedCourse.coachingType,
        location: updatedCourse.location,
        address: updatedCourse.address,
        thumbnail: updatedCourse.thumbnail,
        rating: updatedCourse.rating,
        instructor: {
          name: (updatedCourse.instructor as any).name,
          profileImage: (updatedCourse.instructor as any).profileImage || "default-instructor.jpg"
        },
        topics: updatedCourse.topics,
        startDate: updatedCourse.startDate,
        availableFrom: updatedCourse.availableFrom,
        availableTo: updatedCourse.availableTo,
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message.includes("validation")
        ? "Invalid data: " + error.message
        : "Failed to update course"
    });
  }
};

// Update course rating
export const updateCourseRating = async (req: Request, res: Response) => {
  try {
    const { rating } = req.body;
    if (typeof rating !== "number" || rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 0-5"
      });
    }
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { rating },
      { new: true }
    );
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found"
      });
    }
    res.json({
      success: true,
      data: {
        id: course._id,
        title: course.title,
        newRating: course.rating
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get homepage courses (featured, top, trending)
export const getHomepageCourses = async (req: Request, res: Response) => {
  try {
    const [featured, topRated, trending] = await Promise.all([
      Course.find({ isFeatured: true }).limit(4),
      Course.find({ rating: { $gte: 4 } }).limit(4),
      Course.find().sort({ studentsEnrolled: -1 }).limit(6)
    ]);

    const formatCourse = (course: ICourse) => ({
      id: course._id,
      title: course.title,
      price: course.price,
      thumbnail: course.thumbnail,
      rating: course.rating || 0,
      duration: course.duration || 10,
      coachingType: course.coachingType,
      location: course.location
    });

    res.json({
      success: true,
      data: {
        featured: featured.map(formatCourse),
        topRated: topRated.map(formatCourse),
        trending: trending.map(formatCourse),
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Failed to load courses"
    });
  }
};

// Filter by location
export const getCoursesByLocation = async (req: Request, res: Response) => {
  try {
    const { location } = req.params;
    const courses = await Course.find({
      location: new RegExp(location, 'i'),
      coachingType: { $in: ['offline', 'both'] }
    });
    res.json({ success: true, data: courses });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Filter by coaching type
export const getCoursesByType = async (req: Request, res: Response) => {
  try {
    const { coachingType } = req.params;
    if (!['online', 'offline', 'both'].includes(coachingType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid coaching type. Use: online, offline, or both"
      });
    }
    const courses = await Course.find({ coachingType })
      .populate('instructor', 'name profileImage');
    res.json({
      success: true,
      data: courses.map(course => ({
        id: course._id,
        title: course.title,
        price: course.price,
        thumbnail: course.thumbnail,
        rating: course.rating,
        duration: course.duration,
        coachingType: course.coachingType,
        location: course.location,
        address: course.address,
        instructor: {
          name: (course.instructor as any).name,
          profileImage: (course.instructor as any).profileImage || 'default-instructor.jpg'
        }
      }))
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
