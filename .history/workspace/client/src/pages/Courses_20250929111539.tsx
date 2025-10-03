import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// If you use Context, swap getCurrentUser() with your useUser()!

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
  duration?: number;
  language?: string;
  category?: string;
  startDate?: string;
  thumbnail?: string;
  availableFrom?: string;
  availableTo?: string;
}

const BADGE_COLORS: Record<string, string> = {
  online: "bg-blue-600 text-white",
  offline: "bg-green-600 text-white",
  both: "bg-purple-600 text-white",
};
const fallbackThumb =
  "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80";
const courseCovers: Record<string, string> = {
  mathematics:
    "https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?auto=format&fit=crop&w=400&q=80",
  science:
    "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80",
  english:
    "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=400&q=80",
};
function getThumbnailUrl(thumbnail?: string, category?: string): string {
  if (!thumbnail || thumbnail === "default-course.jpg") {
    if (category && courseCovers[category.toLowerCase()]) {
      return courseCovers[category.toLowerCase()];
    }
    return fallbackThumb;
  }
  if (thumbnail.startsWith("http")) return thumbnail;
  return `${API_BASE_URL}/uploads/${thumbnail}`;
}
function getInitialsAvatar(name?: string, size: number = 96): string {
  if (!name || !name.trim())
    return `https://ui-avatars.com/api/?name=TM&background=random&color=fff&size=${size}&bold=true&rounded=true`;
  const words = name.trim().split(" ");
  let initials = "";
  if (words.length === 1) initials = words[0].slice(0, 2).toUpperCase();
  else
    initials =
      words[0][0].toUpperCase() + words[words.length - 1][0].toUpperCase();
  return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=${size}&bold=true&rounded=true`;
}
function getTutorPhoto(profileImage?: string, name?: string): string {
  if (profileImage && profileImage.trim().length) {
    if (profileImage.startsWith("http")) return profileImage;
    if (profileImage.startsWith("/uploads/"))
      return `${API_BASE_URL}${profileImage}`;
    return `${API_BASE_URL}/uploads/${profileImage}`;
  }
  return getInitialsAvatar(name, 240);
}

// Replace this with your real user/auth context/hook!
function getCurrentUser() {
  // If you use context/provider, replace this with useUser()
  const saved = localStorage.getItem("user");
  return saved ? JSON.parse(saved) : null;
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const user = getCurrentUser(); // swap with useUser() if you use context

  function handleBookNow(course: Course) {
    // Only block if NOT logged in or NOT a student
    if (!user) {
      alert("Please log in as a student to book a session.");
      navigate("/login");
      return;
    }
    if (user?.role !== "student") {
      alert("Only student accounts can book. Please login as a student.");
      return;
    }
    navigate(`/book/${course._id}`);
  }

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/courses`)
      .then((res) => {
        if (res.data && Array.isArray(res.data.data)) setCourses(res.data.data);
        else setCourses([]);
      })
      .catch(() =>
        setError("Failed to load courses. Please try again later.")
      )
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
        <header className="text-center mb-9">
          <h1
            style={{
              background:
                "linear-gradient(90deg,#7077F7 44%, #fbda61 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 900,
              letterSpacing: 0.5,
            }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2"
          >
            Tutor<span style={{ color: "#FDBA1B" }}>Mitra</span>
          </h1>
          <div className="text-zinc-500 text-xl font-semibold mb-1">
            Find your <span className="text-accent">offline</span> coaching expert near you
          </div>
        </header>
        <div className="border-b border-gray-200 shadow-sm mb-8"></div>
        {loading && (
          <p className="text-primary font-semibold text-center animate-pulse">
            Loading courses...
          </p>
        )}
        {error && (
          <p className="text-red-600 text-center font-semibold">{error}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {courses.map((course) => (
            <div
              key={course._id}
              className="rounded-3xl shadow-xl border border-white/70 transition-all duration-300 hover:scale-[1.034] hover:border-accent/30 hover:ring-2 hover:ring-accent/30 flex flex-col p-6 sm:p-8 group fade-in"
              style={{
                background:
                  "linear-gradient(135deg, #fffbe2 70%, #e4f3ff 110%)",
                boxShadow:
                  "0px 16px 40px -16px rgba(37,99,235,.09), 0 1.5px 1.5px rgba(0,0,0,.03)",
              }}
            >
              <div className="relative h-40 w-full rounded-xl flex items-center justify-center mb-5 overflow-hidden shadow-lg bg-gradient-to-br from-sky-100 via-teal-100 to-white">
                <img
                  src={getTutorPhoto(
                    course.instructor?.profileImage,
                    course.instructor?.name
                  )}
                  alt={course.title}
                  className="object-cover w-full h-full rounded-xl border-2 border-white/80"
                  style={{
                    boxShadow: "0 6px 32px -4px rgba(100,100,130,0.14)",
                  }}
                />
                <div className="absolute top-4 right-4 z-10 flex items-center text-yellow-500 font-black text-[15px] bg-yellow-50 px-4 py-1 rounded-full shadow">
                  {course.rating?.toFixed(1) || "0.0"}
                  <svg className="ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.962a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.375 2.455a1 1 0 00-.364 1.118l1.285 3.96c.3.922-.755 1.688-1.54 1.118l-3.375-2.455a1 1 0 00-1.175 0l-3.375 2.455c-.785.57-1.838-.196-1.539-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.03 9.39c-.783-.57-.38-1.81.588-1.81h4.167a1 1 0 00.951-.69l1.285-3.962z" />
                  </svg>
                </div>
              </div>
              <div className="relative flex items-center mb-3">
                <div className="relative">
                  <span
                    className="absolute inset-0 rounded-full z-0"
                    style={{
                      background:
                        "conic-gradient(from 180deg at 50% 50%, #fff, #ffe684 30%, #5be9ff 60%, #c77dff 100%, #fff 130%)",
                      filter: "blur(7px)",
                      opacity: 0.73,
                    }}
                  ></span>
                  <img
                    src={getInitialsAvatar(course.instructor?.name, 96)}
                    alt={course.instructor?.name || "Tutor"}
                    className="w-14 h-14 mx-auto rounded-full z-10 relative shadow-inner border-4 border-white bg-white"
                    style={{
                      boxShadow:
                        "0 2px 16px -3px #60a5fa44, 0 4px 40px -10px #beabea33, 0 0 0 2px #fff",
                    }}
                  />
                  <span className="pointer-events-none absolute left-0 top-2 w-full h-2 rounded-full opacity-20 bg-white blur-[1.5px]"></span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="font-extrabold text-primary text-lg group-hover:text-accent transition-all duration-200">
                    {course.instructor?.name ?? "Unknown Instructor"}
                  </div>
                  <div className="text-xs text-gray-400 flex flex-col">
                    <span className="text-[12px]">
                      {course.instructor?.city || course.location || "No city"}
                    </span>
                  </div>
                </div>
              </div>
              <h3 className="text-[1.2rem] font-heading font-bold text-neutral capitalize mb-1 group-hover:text-accent transition">
                {course.title}
              </h3>
              <div className="mb-1 text-[15px] text-gray-600 line-clamp-2">
                {course.description ?? ""}
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                <span
                  className={`px-4 py-1 rounded-full text-xs font-bold uppercase shadow-sm tracking-wide ${BADGE_COLORS[course.coachingType] || "bg-gray-400"}`}
                  style={{ letterSpacing: "1px" }}
                >
                  {course.coachingType}
                </span>
                {course.topics &&
                  course.topics.slice(0, 2).map((topic, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-700 rounded px-3 py-0.5 text-xs font-medium"
                    >
                      {topic}
                    </span>
                  ))}
              </div>
              <div className="text-xs text-gray-400 mb-3">
                <span className="font-semibold">
                  {course.language || "English"}
                </span>{" | "}
                Available: {course.availableFrom && course.availableTo ? `${course.availableFrom} - ${course.availableTo}` : "Anytime"}
              </div>
              <div className="mt-auto flex flex-col items-center gap-1 pt-3 border-t border-dashed">
                <div className="w-full flex justify-between items-center">
                  <span className="text-xl font-extrabold text-green-600">
                    ₹{course.price}
                  </span>
                  <button
                    onClick={() => handleBookNow(course)}
                    className="px-7 py-2 text-base rounded-full font-extrabold shadow-md border-none"
                    style={{
                      background: "linear-gradient(90deg,#fbda61,#ff5acd)",
                      color: "#fff",
                      transition: "all .2s cubic-bezier(.7,.2,.11,1.1)",
                      boxShadow:
                        "0 6px 40px -6px #be2afc11, 0 2px 8px 0 #fff9c022",
                    }}
                  >
                    Book Now <span className="text-xl font-black">→</span>
                  </button>
                </div>
                <div className="mt-1 text-xs text-gray-400 font-semibold italic text-center">
                  Tutor contact details & chat will appear after successful booking.
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
