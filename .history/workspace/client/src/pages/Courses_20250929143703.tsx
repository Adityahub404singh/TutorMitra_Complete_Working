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
  online: "bg-cyan-600 text-white",
  offline: "bg-emerald-600 text-white",
  both: "bg-purple-700 text-white",
};

function getInitialsAvatar(name?: string, size = 100): string {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const fetchCourses = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/courses`, {
        params: { page: pageNum, limit: PAGE_SIZE },
      });
      if (res.data && Array.isArray(res.data.data)) {
        setCourses((prev) => (pageNum === 1 ? res.data.data : [...prev, ...res.data.data]));
        if (res.data.data.length < PAGE_SIZE) setPage(-1); // No more pages
        else setPage(pageNum);
        setError(null);
      } else setError("No courses available.");
    } catch {
      setError("Could not load courses. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(1);
  }, []);

  const onBookNow = (course: Course) => {
    if (authLoading) return;
    if (!user) {
      alert("Login as student to book a session.");
      navigate("/login");
      return;
    }
    if (user.role !== "student") {
      alert("Only students can book sessions.");
      return;
    }
    if (!course.instructor?._id) {
      alert("Instructor info missing. Cannot book.");
      return;
    }
    navigate(`/tutors/${course.instructor._id}?courseId=${course._id}`);
  };

  const onTrialBook = (course: Course) => {
    if (authLoading) return;
    if (!user) {
      alert("Login as student to book trial.");
      navigate("/login");
      return;
    }
    if (user.role !== "student") {
      alert("Only students can book trials.");
      return;
    }
    if (!course.instructor?._id) {
      alert("Instructor info missing. Cannot book trial.");
      return;
    }
    navigate(`/tutors/${course.instructor._id}?courseId=${course._id}&type=trial`);
  };

  const loadMore = () => {
    if (page === -1) return;
    fetchCourses(page + 1);
  };

  const breakpoints = {
    320: { slidesPerView: 1, spaceBetween: 20 },
    640: { slidesPerView: 2, spaceBetween: 24 },
    1024: { slidesPerView: 3, spaceBetween: 30 },
    1440: { slidesPerView: 4, spaceBetween: 40 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5fbff] via-[#e0f7f9] to-[#dcedfa] font-sans py-10 px-4 sm:px-12">
      <main className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-blue-900 mb-3">
            Tutor<span className="text-rose-500">Mitra</span> Courses
          </h1>
          <p className="text-lg text-blue-700 max-w-3xl mx-auto">
            Discover & book offline and online courses from top tutors. Trial sessions available.
          </p>
        </header>

        {loading && <p className="text-center text-blue-600 font-semibold">Loading courses...</p>}
        {error && <p className="text-center text-red-600 font-semibold">{error}</p>}

        <Swiper
          breakpoints={breakpoints}
          navigation
          pagination={{ clickable: true }}
          className="pb-10"
        >
          {courses.map((course) => (
            <SwiperSlide key={course._id} className="flex justify-center">
              <article className="relative bg-white shadow-md rounded-xl border border-gray-300 p-6 w-full max-w-xs hover:shadow-xl transition-shadow">
                <div className="mb-4 rounded-lg overflow-hidden h-44 bg-gradient-to-tr from-cyan-200 to-teal-300 shadow-inner relative">
                  <img
                    src={getTutorPhoto(course.instructor?.profileImage, course.instructor?.name)}
                    alt={course.title}
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                  {typeof course.rating === "number" && (
                    <span className="absolute top-3 right-3 bg-yellow-300 text-yellow-800 px-3 py-1 rounded-full shadow font-semibold select-none flex items-center">
                      {course.rating.toFixed(1)}
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.962a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.375 2.455a1 1 0 00-.364 1.118l1.285 3.96c.3.922-.755 1.688-1.54 1.118l-3.375-2.455a1 1 0 00-1.175 0l-3.375 2.455c-.785.57-1.838-.196-1.539-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.03 9.39c-.783-.57-.38-1.81.588-1.81h4.167a1 1 0 00.951-.69l1.285-3.962z" />
                      </svg>
                    </span>
                  )}
                </div>

                <div className="flex items-center mb-3">
                  <img
                    src={getInitialsAvatar(course.instructor?.name, 100)}
                    alt={course.instructor?.name ?? "Tutor"}
                    className="w-16 h-16 rounded-full border-4 border-white shadow mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-blue-900 truncate">{course.instructor?.name ?? "Unknown Instructor"}</h3>
                    <p className="text-sm text-blue-700 truncate">{course.instructor?.city ?? course.location ?? "No City"}</p>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-gray-800 mb-2 truncate">{course.title}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description ?? ""}</p>

                <div className="flex flex-wrap gap-3 mb-4">
                  <span className={`uppercase text-xs font-bold px-3 py-1 rounded-full select-none ${BADGE_COLORS[course.coachingType] ?? "bg-gray-400 text-white"}`}>
                    {course.coachingType}
                  </span>
                  {course.topics?.slice(0, 3).map((topic, idx) => (
                    <span key={idx} className="text-xs bg-blue-200 rounded px-2 py-1 whitespace-nowrap truncate text-blue-800">{topic}</span>
                  ))}
                </div>

                <p className="text-xs text-gray-500 mb-5">
                  <strong>{course.language ?? "English"}</strong> | Available:{" "}
                  {course.availableFrom && course.availableTo
                    ? `${course.availableFrom} - ${course.availableTo}`
                    : "Anytime"}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-extrabold text-green-700">₹{course.price}</span>
                  <button
                    onClick={() => onBookNow(course)}
                    className="bg-gradient-to-r from-rose-400 to-yellow-400 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:from-rose-500 hover:to-yellow-500 transition-colors"
                  >
                    Book Now
                  </button>
                </div>

                <button
                  onClick={() => onTrialBook(course)}
                  className="mt-4 w-full bg-cyan-600 text-white font-bold py-2 rounded-full shadow hover:bg-cyan-700 transition"
                >
                  Book 3-Day Trial
                </button>

                <p className="text-center text-gray-500 italic text-xs mt-2">Trial session risk free for first 3 days</p>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>

        {page !== -1 && (
          <div className="flex justify-center mt-12">
            <button
              onClick={loadMore}
              disabled={loading}
              className={`px-8 py-3 rounded-full font-semibold shadow-md text-white text-lg transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-900"
              }`}
            >
              {loading ? "Loading..." : "Load More Courses"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
