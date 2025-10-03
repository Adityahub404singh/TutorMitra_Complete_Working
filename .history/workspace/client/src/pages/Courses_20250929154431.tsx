import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthProvider";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";


import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
  featured?: boolean;
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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    loadCourses(1);
  }, []);

  async function loadCourses(pageNum: number) {
    if (page === -1) return;
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
        setError("Courses nahi mile.");
        setPage(-1);
      }
    } catch {
      setError("Courses load karne me error, dobara try karo.");
    } finally {
      setLoading(false);
    }
  }

  function handleBook(course: Course, trial = false) {
    if (authLoading) return;
    if (!user) {
      alert("Login pehle karo as student.");
      navigate("/login");
      return;
    }
    if (user.role !== "student") {
      alert("Sirf student hi courses book kar sakte hai.");
      return;
    }
    if (!course.instructor?._id) {
      alert("Instructor ki jankari nahi mili.");
      return;
    }
    const bookingType = trial ? "trial" : "regular";
    navigate(`/tutors/${course.instructor._id}?courseId=${course._id}&type=${bookingType}`);
  }

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredCourses = filteredCourses.filter((course) => course.featured);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50 font-sans p-6">
      <header className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-2">TutorMitra - Best Offline Coaching</h1>
        <p className="text-lg text-gray-700">Apne liye best tutor dhundo, online aur offline dono.</p>
      </header>

      <section className="max-w-6xl mx-auto mb-8">
        <input
          type="search"
          placeholder="Search courses or tutors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md p-3 rounded border border-gray-300 focus:outline-none focus:ring focus:ring-blue-300"
        />
      </section>

      {featuredCourses.length > 0 && (
        <section className="max-w-6xl mx-auto mb-12">
          <Swiper
            spaceBetween={30}
            slidesPerView={1}
            navigation={true}
            pagination={{ clickable: true }}
            modules={[Navigation, Pagination]}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {featuredCourses.map((course) => (
              <SwiperSlide key={course._id}>
                <article className="bg-white rounded-lg overflow-hidden shadow-lg p-4">
                  <img
                    src={getTutorPhoto(course.instructor?.profileImage, course.instructor?.name)}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded"
                  />
                  <h2 className="mt-4 text-xl font-bold">{course.title}</h2>
                  <p className="mt-2 text-gray-700">{course.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-semibold">₹{course.price}</span>
                    <button
                      onClick={() => handleBook(course)}
                      className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Book Now
                    </button>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      <main className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredCourses.map((course) => (
          <article
            key={course._id}
            className="bg-white rounded-lg p-4 shadow flex flex-col justify-between"
          >
            <div>
              <img
                src={getTutorPhoto(course.instructor?.profileImage, course.instructor?.name)}
                alt={course.title}
                className="w-full h-40 rounded object-cover"
              />
              <h3 className="mt-2 text-lg font-semibold">{course.title}</h3>
              <p className="text-gray-700 mt-2">{course.description}</p>
              <div className="mt-3 flex gap-2 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded ${BADGE_COLORS[course.coachingType]} text-white`}>
                  {course.coachingType}
                </span>
                {course.topics && course.topics.slice(0, 3).map((topic, i) => (
                  <span key={i} className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <span className="font-semibold text-lg">₹{course.price}</span>
              <button
                onClick={() => handleBook(course)}
                className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Book Now
              </button>
            </div>

            <button
              onClick={() => handleBook(course, true)}
              className="mt-4 block w-full py-2 rounded bg-indigo-500 text-white hover:bg-indigo-600"
            >
              Trial 3 Days
            </button>
          </article>
        ))}
      </main>

      <div className="max-w-6xl mx-auto text-center my-8">
        {page !== -1 && (
          <button
            onClick={() => loadCourses(page + 1)}
            disabled={loading}
            className={`px-6 py-3 rounded ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-700 text-white"
            }`}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        )}
      </div>

      <footer className="bg-blue-50 p-6 text-center mt-auto">
        <h2 className="text-2xl font-bold text-indigo-700 mb-2">Keep Learning with TutorMitra</h2>
        <p>Success aur hard work ke sath, aapke sapne sach honge!</p>
      </footer>
    </div>
  );
}
