import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthProvider";

import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

SwiperCore.use([Navigation, Pagination]);

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface Tutor {
  _id?: string;
  name?: string;
  profileImage?: string;
  city?: string;
}

interface Course {
  _id: string;
  title: string;
  price: number;
  coachingType: "online" | "offline" | "both";
  location?: string;
  instructor?: Tutor;
  description?: string;
  topics?: string[];
  rating?: number;
  language?: string;
  availableFrom?: string;
  availableTo?: string;
}

const BADGE_COLORS: Record<string, string> = {
  online: "bg-blue-600 text-white",
  offline: "bg-green-600 text-white",
  both: "bg-purple-600 text-white",
};

function getInitialsAvatar(name?: string, size = 96): string {
  if (!name || !name.trim())
    return `https://ui-avatars.com/api/?name=TM&background=random&color=fff&size=${size}&bold=true&rounded=true`;
  const words = name.trim().split(" ");
  let initials = "";
  if (words.length === 1) initials = words[0].slice(0, 2).toUpperCase();
  else initials = words[0][0].toUpperCase() + words[words.length - 1][0].toUpperCase();
  return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=${size}&bold=true&rounded=true`;
}

function getTutorPhoto(profileImage?: string, name?: string) {
  if (profileImage && profileImage.trim()) {
    if (profileImage.startsWith("http")) return profileImage;
    if (profileImage.startsWith("/uploads/")) return `${API_BASE_URL}${profileImage}`;
    return `${API_BASE_URL}/uploads/${profileImage}`;
  }
  return getInitialsAvatar(name, 240);
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  function handleBookNow(course: Course) {
    if (authLoading) return;
    if (!user) {
      alert("Please log in as a student to book a session.");
      navigate("/login");
      return;
    }
    if (user.role !== "student") {
      alert("Only students can book sessions. Please log in as student.");
      return;
    }
    if (!course.instructor || !course.instructor._id) {
      alert("Booking unavailable: Instructor info missing.");
      return;
    }
    navigate(`/booking/${course.instructor._id}?courseId=${course._id}`);
  }

  function handleTrialBook(course: Course) {
    if (authLoading) return;
    if (!user) {
      alert("Please log in as a student to book a trial.");
      navigate("/login");
      return;
    }
    if (user.role !== "student") {
      alert("Only students can book trial sessions. Please log in as student.");
      return;
    }
    if (!course.instructor || !course.instructor._id) {
      alert("Trial booking unavailable: Instructor info missing.");
      return;
    }
    navigate(`/booking/${course.instructor._id}?courseId=${course._id}&type=trial`);
  }

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/courses`)
      .then(res => {
        if (res.data && Array.isArray(res.data.data)) setCourses(res.data.data);
        else setCourses([]);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load courses. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="min-h-screen py-10 font-sans"
      style={{
        background:
          "radial-gradient(ellipse at 40% 10%, #dbeafe 0 30%, #f9fafb 55%, #fff 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <header className="text-center mb-9">
          <h1
            style={{
              background: "linear-gradient(90deg,#7077F7 44%, #fbda61 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "900",
              letterSpacing: 0.5,
            }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2"
          >
            Tutor<span style={{ color: "#FDBA1B" }}>Mitra</span>
          </h1>
          <p className="text-xl font-semibold text-zinc-500">
            Find your <span className="text-accent font-bold">offline</span> coaching expert near you
          </p>
        </header>

        <div className="border-b border-gray-200 mb-10"></div>

        {/* Show loading or error */}
        {loading && <p className="text-center text-primary font-semibold animate-pulse">Loading courses...</p>}
        {error && <p className="text-center text-red-600 font-semibold">{error}</p>}

        {/* Swiper Slider */}
        <Swiper
          slidesPerView={"auto"}
          spaceBetween={20}
          navigation
          pagination={{ clickable: true }}
          className="mb-14"
        >
          {courses.map(course => (
            <SwiperSlide key={course._id} className="w-[320px] flex justify-center">
              <div
                className="rounded-3xl shadow-xl border border-white/70 transition-all duration-300 flex flex-col p-6 sm:p-8 group fade-in hover:scale-105 hover:border-accent hover:ring-2 hover:ring-accent"
                style={{
                  background:
                    "linear-gradient(135deg, #fffbe2 70%, #e4f3ff 110%)",
                  boxShadow:
                    "0 0 10px rgba(100, 150, 240, 0.3), 0 4px 10px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Image & Rating */}
                <div className="relative h-40 w-full rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-sky-100 via-teal-100 to-white mb-5">
                  <img
                    src={getTutorPhoto(course.instructor?.profileImage, course.instructor?.name)}
                    alt={course.title}
                    className="object-cover w-full h-full rounded-xl border-2 border-white/80"
                    style={{ boxShadow: "0 6px 20px rgba(100,100,130,0.2)" }}
                  />
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-yellow-100 rounded-full shadow text-yellow-600 font-bold text-sm z-10">
                    {course.rating?.toFixed(1) || "0.0"}
                    <svg
                      className="w-5 h-5 text-yellow-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.962a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.375 2.455a1 1 0 00-.364 1.118l1.285 3.96c.3.922-.755 1.688-1.54 1.118l-3.375-2.455a1 1 0 00-1.175 0l-3.375 2.455c-.785.57-1.838-.196-1.539-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.03 9.39c-.783-.57-.38-1.81.588-1.81h4.167a1 1 0 00.951-.69l1.285-3.962z" />
                    </svg>
                  </div>
                </div>

                {/* Instructor info */}
                <div className="flex items-center mb-3">
                  <img
                    src={getInitialsAvatar(course.instructor?.name, 96)}
                    alt={course.instructor?.name || "Tutor"}
                    className="w-14 h-14 rounded-full border-4 border-white shadow-inner mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-lg text-primary group-hover:text-accent">
                      {course.instructor?.name ?? "Unknown Instructor"}
                    </h4>
                    <p className="text-sm text-neutral-600">{course.instructor?.city || course.location || "No city"}</p>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-neutral-900 group-hover:text-accent truncate">
                  {course.title}
                </h3>
                <p className="text-neutral-700 mt-1 mb-3 line-clamp-2">{course.description || ""}</p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`uppercase text-xs font-bold px-3 py-1 rounded-full ${BADGE_COLORS[course.coachingType] || "bg-gray-400"}`}>
                    {course.coachingType}
                  </span>
                  {course.topics?.slice(0, 2).map((topic, idx) => (
                    <span key={idx} className="px-3 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
                      {topic}
                    </span>
                  ))}
                </div>

                {/* Language & Availability */}
                <p className="text-xs mb-3 text-neutral-600">
                  <span className="font-semibold">{course.language || "English"}</span> | Available:{" "}
                  {course.availableFrom && course.availableTo
                    ? `${course.availableFrom} - ${course.availableTo}`
                    : "Anytime"}
                </p>

                {/* Buttons */}
                <div className="mt-auto pt-3 border-t border-neutral-300 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-extrabold text-xl">
                      ₹{course.price}
                    </span>
                    <button
                      onClick={() => handleBookNow(course)}
                      className="px-6 py-2 rounded-full text-white font-extrabold"
                      style={{
                        background: "linear-gradient(90deg, #fbda61 0%, #ff5acd 100%)",
                        boxShadow: "0 6px 20px -5px rgba(251,218,97,0.7), 0 4px 10px rgba(255,92,173,0.5)",
                      }}
                    >
                      Book Now
                    </button>
                  </div>

                  <button
                    onClick={() => handleTrialBook(course)}
                    className="w-full rounded-full py-2 bg-blue-600 text-white font-extrabold hover:bg-blue-700 transition"
                  >
                    Book 3-Day Trial
                  </button>

                  <p className="text-center text-xs italic text-neutral-500">
                    Trial session is risk free for first 3 days.
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
