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

const PAGE_SIZE = 6;

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [displayedCourses, setDisplayedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

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

  async function loadCourses(pageNum: number) {
    setLoading(true);
    try {
      // Backend API should support pagination with page & limit query parameters
      const res = await axios.get(`${API_BASE_URL}/api/courses`, { params: { page: pageNum, limit: PAGE_SIZE } });
      if (res.data && Array.isArray(res.data.data)) {
        if (pageNum === 1) {
          setCourses(res.data.data);
          setDisplayedCourses(res.data.data);
        } else {
          setCourses(prev => [...prev, ...res.data.data]);
          setDisplayedCourses(prev => [...prev, ...res.data.data]);
        }
        setError(null);

        // If less than PAGE_SIZE received, no more data to load
        if (res.data.data.length < PAGE_SIZE) {
          setPage(-1); // Mark no more pages
        } else {
          setPage(pageNum);
        }
      } else {
        setError("No courses found.");
      }
    } catch {
      setError("Failed to load courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    loadCourses(1);
  }, []);

  function handleLoadMore() {
    if (page === -1) return; // No more pages
    loadCourses(page + 1);
  }

  const swiperBreakpoints = {
    320: { slidesPerView: 1, spaceBetween: 16 },
    640: { slidesPerView: 2, spaceBetween: 24 },
    1024: { slidesPerView: 3, spaceBetween: 24 },
    1440: { slidesPerView: 4, spaceBetween: 24 },
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-b from-[#e9fbff] via-[#e9fafd] to-[#eef5fe]">
      {/* Header */}
      <header className="w-full bg-gradient-to-r from-teal-800 via-cyan-600 to-blue-600 text-white shadow-md">
        <div className="max-w-7xl px-6 mx-auto text-center pt-10 pb-8 rounded-b-3xl">
          <h1 className="text-5xl md:text-6xl font-black mb-2">
            Tutor<span className="text-yellow-400">Mitra</span>
          </h1>
          <div className="text-lg md:text-xl font-bold my-3 text-yellow-100 drop-shadow">
            Find Your Perfect Teacher for <span className="text-yellow-300">Offline Coaching</span>
          </div>
          <div className="text-sky-100/90 font-medium max-w-2xl mx-auto mb-2">
            Browse verified tutors for in-person and online coaching, compare profiles, book trial sessions, and learn anything!
          </div>
          <div className="text-base text-cyan-50 italic">
            Scroll below and use <b>"Load More Tutors"</b> to see more expert tutors.
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto pt-8 px-2 sm:px-6 w-full">
          {loading && <p className="text-center text-indigo-700 font-bold my-8">Loading courses...</p>}
          {error && <p className="text-center text-red-600 font-semibold my-8">{error}</p>}

          {/* Swiper */}
          <Swiper
            breakpoints={swiperBreakpoints}
            navigation
            pagination={{ clickable: true }}
            className="pb-8"
          >
            {displayedCourses.map((course) => (
              <SwiperSlide key={course._id} className="flex justify-center">
                <div className="flex flex-col rounded-xl bg-white shadow-xl border border-gray-200 p-6 hover:shadow-2xl w-full max-w-xs min-h-[430px]">
                  <div className="relative mb-5 rounded-lg overflow-hidden h-40 bg-gradient-to-br from-sky-100 to-teal-100 shadow-inner">
                    <img
                      src={getTutorPhoto(course.instructor?.profileImage, course.instructor?.name)}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    {typeof course.rating === "number" && (
                      <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full flex items-center font-semibold shadow select-none">
                        {course.rating.toFixed(1)}
                        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.962a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.375 2.455a1 1 0 00-.364 1.118l1.285 3.96c.3.922-.755 1.688-1.54 1.118l-3.375-2.455a1 1 0 00-1.175 0l-3.375 2.455c-.785.57-1.838-.196-1.539-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.03 9.39c-.783-.57-.38-1.81.588-1.81h4.167a1 1 0 00.951-.69l1.285-3.962z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center mb-2">
                    <img
                      src={getInitialsAvatar(course.instructor?.name, 96)}
                      alt={course.instructor?.name || "Tutor"}
                      className="w-14 h-14 rounded-full shadow border-4 border-white mr-4"
                    />
                    <div className="flex flex-col justify-center">
                      <h4 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600">
                        {course.instructor?.name ?? "Unknown Instructor"}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {course.instructor?.city || course.location || "No city"}
                      </p>
                    </div>
                  </div>

                  <h3 className="font-semibold text-xl mb-1 text-gray-900 truncate">{course.title}</h3>
                  <p className="text-gray-700 text-sm mb-3 line-clamp-3">{course.description || ""}</p>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className={`text-xs font-bold uppercase px-3 py-1 rounded-full select-none ${
                        BADGE_COLORS[course.coachingType] || "bg-gray-400 text-white"
                      }`}
                    >
                      {course.coachingType}
                    </span>
                    {course.topics?.slice(0, 2).map((topic, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded select-none">
                        {topic}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 mb-5">
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

          {/* Load More */}
          {page !== -1 && (
            <div className="flex justify-center mt-4 md:mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className={`px-7 py-3 rounded-full shadow text-white font-bold tracking-wide text-lg transition
                  ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-700 hover:bg-emerald-900"}`}
              >
                {loading ? "Loading..." : "Load More Tutors"}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-teal-900 to-teal-800 text-white py-10 mt-16 rounded-t-3xl shadow-inner">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center px-7">
          <span className="text-4xl font-black mb-4 tracking-tight select-none cursor-default">🎓 TutorMitra</span>
          <p className="text-teal-100 font-bold mb-2 max-w-xl">
            For Students: Find &amp; book top offline and online tutors in your city near you. Experience risk-free trials and quality coaching with ease.
          </p>
          <p className="text-teal-100 font-bold max-w-xl">
            For Tutors: Join TutorMitra to connect with eager students, grow your tutoring business, and share your knowledge comfortably.
          </p>
          <div className="mt-4 text-xs text-slate-300 select-none cursor-default">
            &copy; {new Date().getFullYear()} TutorMitra. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
