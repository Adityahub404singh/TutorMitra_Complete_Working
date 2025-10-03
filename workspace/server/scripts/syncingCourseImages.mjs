import mongoose from "mongoose";
import Tutor from "../src/models/Tutor.js";
import Course from "../src/models/Course.js";

async function run() {
  await mongoose.connect("mongodb://localhost:27017/tutoring");

  const courses = await Course.find({}).lean();
  for (const course of courses) {
    if (!course.instructor) continue;
    const tutor = await Tutor.findById(course.instructor).lean();
    if (tutor) {
      let img = tutor.profileImage || "";
      if (img && !img.startsWith("http") && !img.startsWith("/uploads/")) {
        img = `/uploads/${img}`;
      }
      let name = tutor.name || "Unknown Instructor";
      await Course.findByIdAndUpdate(course._id, {
        instructorImage: img,        // Sets correct image
        instructorName: name,        // Sets correct name
      });
      console.log(`Updated "${course.title}" with image: ${img} and name: ${name}`);
    }
  }
  console.log("Done syncing all course images and names.");
  await mongoose.disconnect();
  process.exit(0);
}
run();
