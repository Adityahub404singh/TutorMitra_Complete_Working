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
    <div className="min-h-screen py-10 font-sans bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text mb-2">
            Tutor<span className="text-yellow-500">Mitra</span>
          </h1>
          <p className="text-gray-700 text-lg font-semibold">
            Find your <span className="text-yellow-500 font-bold">offline</span> coaching expert near you
          </p>
        </header>

        {loading && <p className="text-center text-indigo-600 animate-pulse font-semibold">Loading courses...</p>}
        {error && <p className="text-center text-red-600 font-semibold">{error}</p>}

        <Swiper
          slidesPerView="auto"
          spaceBetween={24}
          navigation
          pagination={{ clickable: true }}
          className="pb-8"
          style={{ paddingLeft: "12px", paddingRight: "12px" }}
        >
          {courses.map((course) => (
            <SwiperSlide key={course._id} className="w-[340px] flex justify-center">
              <div className="flex flex-col rounded-xl bg-white shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300 w-full max-w-xs min-h-[400px]">
                <div className="relative mb-5 rounded-lg overflow-hidden h-40 bg-gradient-to-br from-sky-100 to-teal-100 shadow-inner">
                  <img
                    src={getTutorPhoto(course.instructor?.profileImage, course.instructor?.name)}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  {course.rating !== undefined && (
                    <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full flex items-center font-semibold shadow">
                      {course.rating.toFixed(1)}
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.962a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.375 2.455a1 1 0 00-.364 1.118l1.285 3.96c.3.922-.755 1.688-1.54 1.118l-3.375-2.455a1 1 0 00-1.175 0l-3.375 2.455c-.785.57-1.838-.196-1.539-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.03 9.39c-.783-.57-.38-1.81.588-1.81h4.167a1 1 0 00.951-.69l1.285-3.962z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex items-center mb-3">
                  <img
                    src={getInitialsAvatar(course.instructor?.name, 96)}
                    alt={course.instructor?.name || "Tutor"}
                    className="w-14 h-14 rounded-full shadow border-4 border-white mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600">
                      {course.instructor?.name ?? "Unknown Instructor"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {course.instructor?.city || course.location || "No city"}
                    </p>
                  </div>
                </div>

                <h3 className="font-semibold text-xl mb-1 text-gray-900 truncate">{course.title}</h3>
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">{course.description || ""}</p>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                      BADGE_COLORS[course.coachingType] || "bg-gray-400 text-white"
                    }`}
                  >
                    {course.coachingType}
                  </span>
                  {course.topics?.slice(0, 2).map((topic, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                      {topic}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  <strong>{course.language || "English"}</strong> | Available:{" "}
                  {course.availableFrom && course.availableTo
                    ? `${course.availableFrom} - ${course.availableTo}`
                    : "Anytime"}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-green-700 font-extrabold text-lg">₹{course.price}</span>
                  <button
                    onClick={() => handleBookNow(course)}
                    className="bg-gradient-to-r from-pink-400 to-yellow-400 text-white font-extrabold px-5 py-2 rounded-full shadow-lg hover:from-pink-500 hover:to-yellow-500 transition-colors duration-300"
                  >
                    Book Now
                  </button>
                </div>

                <button
                  onClick={() => handleTrialBook(course)}
                  className="mt-4 w-full bg-blue-600 text-white font-extrabold py-2 rounded-full shadow hover:bg-blue-700 transition-colors duration-300"
                >
                  Book 3-Day Trial
                </button>

                <p className="mt-2 text-center text-gray-500 text-xs italic">
                  Trial session is risk free for first 3 days.
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
