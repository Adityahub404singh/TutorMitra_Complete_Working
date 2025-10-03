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
  both: "bg-gradient-to-r from-purple-600 via-pink-500 to-purple-400 text-white"
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
        setPage(data.length < PAGE_SIZE ? -1 : pageNum);
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
    navigate(`/tutors/${course.instructor._id}?courseId=${course._id}&type=${trial ? "trial" : "regular"}`);
  };

  const sliderCourses = courses.slice(0, PAGE_SIZE);
  const extraCourses = courses.slice(PAGE_SIZE);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cyan-100 via-indigo-50 to-blue-200 px-4 py-7">
      <section className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-700 mb-4">
          Stay Motivated & Study Smart!
        </h1>
        <p className="text-xl font-semibold text-gray-700 mb-3">
          “Education is the key to unlock the golden door of freedom.”
        </p>
        <p className="max-w-2xl mx-auto text-base italic tracking-tight text-gray-500">
          Every step you take builds the future. With TutorMitra’s verified experts, your success is just one lesson away.
        </p>
      </section>
      <main className="max-w-7xl mx-auto flex-grow">
        {loading && (
          <p className="mb-6 text-center font-medium text-teal-600 animate-pulse">
            Loading courses...
          </p>
        )}
        {error && (
          <p className="mb-6 text-center font-semibold text-red-500">
            {error}
          </p>
        )}
        <Swiper
          modules={[Navigation, Pagination]}
          pagination={{ clickable: true }}
          navigation
          className="pb-10"
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 16 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 22 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
            1280: { slidesPerView: 5, spaceBetween: 26 },
            1536: { slidesPerView: 6, spaceBetween: 28 },
          }}
          spaceBetween={28}
          slidesPerView={6}
        >
          {sliderCourses.map((course) => (
            <SwiperSlide key={course._id}>
              <article
                className="relative flex cursor-pointer flex-col rounded-3xl border-[3px] border-indigo-200 bg-white/80 p-6 shadow-lg transition-transform duration-300 hover:scale-105 max-w-xs w-full"
                onClick={() => navigate(`/courses/${course._id}`)}
              >
                <div className="absolute top-3 right-3 z-10">
                  {typeof course.rating === "number" && (
                    <span className="flex items-center rounded-xl bg-yellow-400 px-4 py-1 text-sm font-bold text-yellow-900 shadow-lg shadow-yellow-300">
                      <svg className="mr-1 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927l1.286 3.962h4.167l-3.375 2.455 1.285 3.96-3.375-2.455-3.375 2.455 1.285-3.96-3.375-2.455h4.167" />
                      </svg>
                      {course.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <img
                  className="mb-4 w-full rounded-2xl bg-gradient-to-tr from-blue-100 to-cyan-300 object-cover shadow-sm"
                  loading="lazy"
                  alt={course.title}
                  src={getTutorPhoto(course.instructor?.profileImage, course.instructor?.name)}
                  style={{ height: 176 }}
                />
                <div className="mb-3 flex items-center gap-3">
                  <img
                    className="h-14 w-14 rounded-full border-4 border-white shadow"
                    loading="lazy"
                    alt={course.instructor?.name}
                    src={getInitialsAvatar(course.instructor?.name)}
                  />
                  <div>
                    <h3 className="truncate text-lg font-semibold text-indigo-700">{course.instructor?.name ?? "Unknown Tutor"}</h3>
                    <p className="truncate text-sm text-gray-500">{course.instructor?.city ?? course.location ?? "Unknown City"}</p>
                  </div>
                </div>
                <h2 className="mb-2 truncate text-2xl font-extrabold text-teal-600">{course.title}</h2>
                <p className="mb-3 line-clamp-2 text-base font-medium text-gray-700">{course.description ?? "No description"}</p>
                <div className="mb-4 flex gap-2">
                  <span className={`uppercase rounded-full px-4 py-1 text-xs font-bold text-white`} style={{ letterSpacing: 2, backgroundColor: BADGE_COLORS[course.coachingType] ?? "bg-indigo-300" }}>
                    {course.coachingType}
                  </span>
                  {course.topics?.slice(0, 3).map((topic, i) => (
                    <span key={i} className="rounded-xl bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 shadow">
                      {topic}
                    </span>
                  ))}
                </div>
                <p className="mb-4 text-xs font-semibold text-gray-500">
                  Language: <span className="font-bold">{course.language ?? "English"}</span>
                  <br />
                  Available: {course.availableFrom && course.availableTo ? `${course.availableFrom} - ${course.availableTo}` : "Anytime"}
                </p>
                <div className="mt-auto flex justify-between">
                  <span className="rounded-2xl bg-green-100 px-4 py-2 text-xl font-extrabold text-green-700 shadow">
                    ₹{course.price}
                  </span>
                  <button
                    className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2 text-md font-bold text-white shadow-lg transition-colors duration-300 hover:from-purple-700 hover:to-indigo-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBooking(course);
                    }}
                  >
                    Book Now
                  </button>
                </div>
                <button
                  className="mt-3 w-full rounded-full bg-indigo-600 py-2 text-white font-bold shadow transition-colors duration-300 hover:bg-indigo-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBooking(course, true);
                  }}
                >
                  Trial 3-Day Session
                </button>
                <p className="mt-2 text-center text-xs italic font-bold text-gray-500">
                  Risk-free trial for 3 days.
                </p>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>

        {extraCourses.length > 0 && (
          <section className="mt-8 grid max-w-7xl grid-cols-1 gap-10 px-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:px-0">
            {extraCourses.map((course) => (
              <article
                key={course._id}
                onClick={() => navigate(`/courses/${course._id}`)}
                className="relative cursor-pointer rounded-2xl border-2 border-indigo-100 bg-white/80 p-5 shadow-xl transition-transform duration-300 hover:scale-105 focus:scale-105"
              >
                <div className="absolute top-2 right-2 z-10">
                  {typeof course.rating === "number" && (
                    <span className="flex items-center rounded-xl bg-yellow-400 px-3 py-1 text-xs font-bold text-yellow-900 shadow">
                      <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927l1.286 3.962h4.167l-3.375 2.455 1.285 3.96-3.375-2.455-3.375 2.455 1.285-3.96-3.375-2.455h4.167"/>
                      </svg>
                      {course.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <h2 className="mb-2 truncate text-xl font-bold text-indigo-900">{course.title}</h2>
                <p className="mb-3 line-clamp-2 text-sm text-gray-700">{course.description ?? "No description"}</p>
                <div className="mb-3 flex gap-2">
                  <span className={`select-none rounded-full px-3 py-1 text-xs font-bold text-white`} style={{ letterSpacing: 2, backgroundColor: BADGE_COLORS[course.coachingType] ?? "bg-indigo-300" }}>
                    {course.coachingType}
                  </span>
                  {course.topics?.slice(0, 2).map((topic, i) => (
                    <span key={i} className="rounded-xl bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 shadow">
                      {topic}
                    </span>
                  ))}
                </div>
                <span className="rounded-xl bg-green-50 px-4 py-2 text-lg font-extrabold text-green-700 shadow">
                  ₹{course.price}
                </span>
              </article>
            ))}
          </section>
        )}

        {page !== -1 && (
          <div className="mt-12 text-center">
            <button
              type="button"
              disabled={loading}
              onClick={() => loadCourses(page + 1)}
              className={`mx-auto rounded-full px-10 py-4 text-xl font-bold text-white shadow-lg transition-colors duration-300 ${
                loading ? "cursor-not-allowed bg-gray-400" : "bg-gradient-to-r from-indigo-700 via-purple-700 to-teal-600 hover:scale-105"
              }`}
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </main>
      <section className="animate-fadeIn mt-16 max-w-2xl rounded-3xl bg-gradient-to-r from-indigo-50 via-teal-100 to-blue-50 p-9 text-center shadow-lg">
        <h2 className="mb-3 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-green-500">
          Keep Pushing Forward!
        </h2>
        <p className="text-gray-600 font-medium">
          “Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing.”
          <br />
          <br />
          At TutorMitra, we're always with you—helping you find the best tutors to fuel your passion and achieve your dreams.
        </p>
      </section>
    </div>
  );
}
