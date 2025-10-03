import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthProvider";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";  // <-- Correct import for both modules
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

  const handleBook = (course: Course, trial = false) => {
    if (authLoading) return;
    if (!user) {
      alert("Login pehle karo as student.");
      navigate("/login");
      return;
    }
    if (user.role !== "student") {
      alert("Sirf student courses book kar sakta hai.");
      return;
    }
    if (!course.instructor?._id) {
      alert("Instructor ki info missing hai.");
      return;
    }
    const bookingType = trial ? "trial" : "regular";
    navigate(`/tutors/${course.instructor._id}?courseId=${course._id}&type=${bookingType}`);
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredCourses = filteredCourses.filter((c) => c.featured);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50 font-sans px-6 py-10">
      <header className="max-w-5xl mx-auto text-center mb-14">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-3">
          TutorMitra - Best Offline Coaching
        </h1>
        <p className="text-lg text-gray-700 mb-2">
          Apne liye best tutor dhundo offline coaching ke liye.
        </p>
      </header>

      <div className="max-w-7xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Search by course or tutor"
          className="w-full max-w-md px-4 py-3 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {featuredCourses.length > 0 && (
        <Swiper
          navigation={true}
          pagination={{ clickable: true }}
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
          className="rounded-lg mb-10 max-w-7xl mx-auto"
        >
          {featuredCourses.map((course) => (
            <SwiperSlide key={course._id}>
              <article className="bg-white shadow p-5 rounded">
                <img
                  src={getTutorPhoto(course.instructor?.profileImage, course.instructor?.name)}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded"
                />
                <h2 className="text-xl font-bold mt-2">{course.title}</h2>
                <p>{course.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="font-semibold">₹{course.price}</span>
                  <button
                    onClick={() => handleBook(course)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded"
                  >
                    Book Now
                  </button>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {filteredCourses.map((course) => (
          <article key={course._id} className="bg-white p-4 rounded shadow">
            <img
              src={getTutorPhoto(course.instructor?.profileImage, course.instructor?.name)}
              alt={course.title}
              className="w-full h-44 object-cover rounded"
            />
            <h3 className="text-lg mt-2 font-bold">{course.title}</h3>
            <p>{course.description}</p>
            <span className={`inline-block px-2 py-1 rounded text-white ${BADGE_COLORS[course.coachingType]}`}>
              {course.coachingType}
            </span>
            <div className="mt-2 flex justify-between items-center">
              <span className="font-semibold">₹{course.price}</span>
              <button
                onClick={() => handleBook(course)}
                className="bg-indigo-600 text-white px-3 py-1 rounded"
              >
                Book Now
              </button>
            </div>
            <button
              onClick={() => handleBook(course, true)}
              className="w-full mt-2 py-1 bg-indigo-500 text-white rounded"
            >
              Trial 3 Days
            </button>
          </article>
        ))}
      </main>

      <div className="text-center my-6">
        {page !== -1 && (
          <button
            onClick={() => loadCourses(page + 1)}
            disabled={loading}
            className={`px-6 py-2 rounded ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-700 text-white"
            }`}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        )}
      </div>

      <footer className="p-6 text-center bg-blue-50 mt-auto">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">Keep Learning with TutorMitra</h2>
        <p>Success comes from hard work and perseverance. We are here to help you all the way!</p>
      </footer>
    </div>
  );
}
