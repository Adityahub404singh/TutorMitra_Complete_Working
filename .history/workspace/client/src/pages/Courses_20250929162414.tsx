import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthProvider";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const BADGE_COLORS: Record<string, string> = {
  online: "bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 text-white",
  offline: "bg-gradient-to-r from-green-600 via-lime-500 to-green-400 text-white",
  both: "bg-gradient-to-r from-purple-600 via-pink-500 to-purple-400 text-white",
};

function getInitialsAvatar(name?: string, size = 96): string {
  if (!name || !name.trim())
    return `https://ui-avatars.com/api/?name=TM&background=random&color=fff&size=${size}&bold=true&rounded=true`;
  const words = name.trim().split(" ");
  let initials =
    words.length === 1
      ? words[0].slice(0, 2).toUpperCase()
      : words[0][0].toUpperCase() + words[words.length - 1][0].toUpperCase();
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

export default function MotivationalCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    loadCourses(1);
  }, []);

  async function loadCourses(pageNum: number) {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/courses`, {
        params: { page: pageNum, limit: PAGE_SIZE },
      });
      const data = res.data?.data;
      if (Array.isArray(data)) {
        setCourses((prev) => (pageNum === 1 ? data : [...prev, ...data]));
        setError(null);
        setPage(data.length < PAGE_SIZE ? -1 : pageNum); // -1 means no more pages
      } else {
        setError("No courses found.");
      }
    } catch {
      setError("Failed to load courses, try later.");
    } finally {
      setLoading(false);
    }
  }

  const handleBooking = (course: any, trial = false) => {
    if (authLoading) return;
    if (!user) {
      alert("Please login as student to book.");
      navigate("/login");
      return;
    }
    if (user.role !== "student") {
      alert("Only students can book sessions.");
      return;
    }
    if (!course.instructor?._id) {
      alert("Instructor info missing.");
      return;
    }
    navigate(
      `/tutors/${course.instructor._id}?courseId=${course._id}&type=${trial ? "trial" : "regular"}`
    );
  };

  // Slider hamesha pehle 3 courses dikhaaye (slice)
  const sliderCourses = courses.slice(0, 3);
  // Baaki courses slide ke neeche grid me dikhaye
  const extraCourses = courses.slice(3);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cyan-100 via-indigo-50 to-blue-200 px-4 py-7">
      <section className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-700 mb-4">
          Stay Motivated & Study Smart!
        </h1>
        <p className="text-xl text-gray-700 mb-3 font-semibold">
          “Education is the key to unlock the golden door of freedom.”
        </p>
        <p className="text-base text-gray-500 italic max-w-2xl mx-auto tracking-tight">
          Every step you take builds the future. With TutorMitra’s verified
          experts, your success is just one lesson away.
        </p>
      </section>

      <main className="flex-grow max-w-7xl mx-auto">
        {loading && (
          <p className="text-center text-teal-600 mb-6 font-medium animate-pulse">
            Loading courses...
          </p>
        )}
        {error && (
          <p className="text-center text-red-500 font-semibold mb-6">{error}</p>
        )}

        <Swiper
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 16 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 }, // max 3 slides always here
          }}
          navigation
          pagination={{ clickable: true }}
          className="pb-10"
          modules={[Navigation, Pagination]}
        >
          {sliderCourses.map((course) => (
            <SwiperSlide key={course._id}>
              <article
                className="bg-white/80 rounded-3xl shadow-lg border-[3px] border-indigo-200 p-6 flex flex-col max-w-xs w-full relative hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => navigate(`/courses/${course._id}`)}
              >
                <div className="absolute top-3 right-3 z-10">
                  {typeof course.rating === "number" && (
                    <span className="bg-yellow-400 text-yellow-900 text-sm font-bold rounded-xl px-4 py-1 shadow-lg shadow-yellow-300 flex items-center">
                      <svg
                        className="w-5 h-5 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927l1.286 3.962h4.167l-3.375 2.455 1.285 3.96-3.375-2.455-3.375 2.455 1.285-3.96-3.375-2.455h4.167z" />
                      </svg>
                      {course.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <img
                  src={getTutorPhoto(
                    course.instructor?.profileImage,
                    course.instructor?.name
                  )}
                  alt={course.title}
                  className="w-full h-44 object-cover rounded-2xl bg-gradient-to-tr from-blue-100 to-cyan-300 shadow-sm mb-4"
                />
                <div className="flex items-center mb-3 gap-3">
                  <img
                    src={getInitialsAvatar(course.instructor?.name)}
                    alt={course.instructor?.name || "Tutor"}
                    className="w-14 h-14 rounded-full border-[4px] border-white shadow"
                    loading="lazy"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-700 truncate">
                      {course.instructor?.name ?? "Unknown Tutor"}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {course.instructor?.city ?? course.location ?? "Unknown City"}
                    </p>
                  </div>
                </div>
                <h2 className="text-2xl font-extrabold mb-2 truncate text-teal-600">
                  {course.title}
                </h2>
                <p className="text-gray-700 text-base mb-3 font-medium line-clamp-2">
                  {course.description ?? "No description"}
                </p>
                <div className="flex gap-2 mb-4">
                  <span
                    className={`uppercase text-xs font-bold px-4 py-1 rounded-full ${
                      BADGE_COLORS[course.coachingType]
                    }`}
                    style={{ letterSpacing: "2px" }}
                  >
                    {course.coachingType}
                  </span>
                  {course.topics?.slice(0, 3).map((topic, i) => (
                    <span
                      key={i}
                      className="bg-indigo-50 text-indigo-700 text-xs rounded-xl px-3 py-1 shadow font-semibold"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mb-4 font-semibold">
                  Language:{" "}
                  <span className="font-bold">{course.language ?? "English"}</span>
                  <br />
                  Available:{" "}
                  {course.availableFrom && course.availableTo
                    ? `${course.availableFrom} - ${course.availableTo}`
                    : "Anytime"}
                </p>
                <div className="mt-auto flex justify-between items-center">
                  <span className="text-green-700 font-extrabold text-xl bg-green-100 px-4 py-2 rounded-2xl shadow">
                    ₹{course.price}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBooking(course);
                    }}
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-md shadow-lg hover:from-purple-700 hover:to-indigo-700 transition duration-300"
                  >
                    Book Now
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBooking(course, true);
                  }}
                  className="mt-3 w-full py-2 rounded-full bg-indigo-600 text-white font-bold shadow hover:bg-indigo-700 transition duration-300"
                >
                  Trial 3-Day Session
                </button>
                <p className="mt-2 text-center text-gray-500 italic text-xs font-bold">
                  Risk-free trial for 3 days.
                </p>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>

        {extraCourses.length > 0 && (
          <section className="max-w-7xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {extraCourses.map((course) => (
              <article
                key={course._id}
                className="bg-white/80 rounded-2xl shadow-xl border-2 border-blue-100 p-5 flex flex-col max-w-xs w-full relative transition transform hover:-translate-y-2 hover:scale-105 focus:scale-105 duration-300 cursor-pointer"
                onClick={() => navigate(`/courses/${course._id}`)}
              >
                <div className="absolute top-2 right-2 z-10">
                  {typeof course.rating === "number" && (
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold rounded-xl px-3 py-1 shadow flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927l1.286 3.962h4.167l-3.375 2.455 1.285 3.96-3.375-2.455-3.375 2.455 1.285-3.96-3.375-2.455h4.167z" />
                      </svg>
                      {course.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-indigo-900 truncate">
                  {course.title}
                </h2>
                <p className="text-gray-700 text-sm mt-1 mb-2 line-clamp-2">
                  {course.description ?? "No description"}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span
                    className={`uppercase text-xs font-bold px-3 py-1 rounded-full ${
                      BADGE_COLORS[course.coachingType]
                    } select-none`}
                    style={{ letterSpacing: "2px" }}
                  >
                    {course.coachingType}
                  </span>
                  {course.topics?.slice(0, 2).map((topic: string, i: number) => (
                    <span
                      key={i}
                      className="bg-blue-50 text-blue-800 text-xs rounded px-2 py-1 shadow"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <span className="font-extrabold text-green-700 text-lg bg-green-50 px-3 py-2 rounded-xl shadow">
                  ₹{course.price}
                </span>
              </article>
            ))}
          </section>
        )}

        {page !== -1 && (
          <div className="mt-10 text-center">
            <button
              type="button"
              disabled={loading}
              onClick={() => loadCourses(page + 1)}
              className={`px-10 py-4 rounded-full font-bold text-white shadow-lg text-xl ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-700 via-purple-700 to-teal-600 hover:scale-105"
              } transition duration-300`}
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </main>

      <section className="max-w-2xl mt-16 mx-auto p-9 bg-gradient-to-r from-indigo-50 via-teal-100 to-blue-50 rounded-3xl shadow-lg text-center animate-fadeIn">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-green-500 mb-3">
          Keep Pushing Forward!
        </h2>
        <p className="text-md text-gray-600 font-medium">
          “Success is no accident. It is hard work, perseverance, learning,
          studying, sacrifice and most of all, love of what you are doing.”
          <br />
          <br />
          At TutorMitra, we're always with you—helping you find the best tutors to
          fuel your passion and achieve your dreams.
        </p>
      </section>
    </div>
  );
}

