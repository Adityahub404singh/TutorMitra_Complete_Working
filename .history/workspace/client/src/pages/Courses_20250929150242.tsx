import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthProvider";

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

  const handleBookCourse = (course: Course, trial = false) => {
    if (authLoading) return;
    if (!user) {
      alert("Pehele student ke roop me login karo.");
      navigate("/login");
      return;
    }
    if (user.role !== "student") {
      alert("Sirf students courses book kar sakte hain.");
      return;
    }
    if (!course.instructor?._id) {
      alert("Instructor ki jankari missing hai.");
      return;
    }
    const type = trial ? "trial" : "regular";
    navigate(`/tutors/${course.instructor._id}?courseId=${course._id}&type=${type}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50 font-sans px-6 py-10">
      {/* Header */}
      <header className="max-w-5xl mx-auto text-center mb-14">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-3">
          TutorMitra - Perfect Offline Coaching
        </h1>
        <p className="text-lg text-gray-700 mb-2 max-w-3xl mx-auto">
          Apne liye best tutor dhoondo offline coaching ke liye — trusted profiles aur fair pricing ke
          saath.
        </p>
        <p className="text-base text-indigo-700 italic max-w-xl mx-auto">
          "Har din nayi umeed, nayi seekh. Apne goals ko pursue karo, har mushkil ko paar karo!"
        </p>
      </header>

      {/* Main courses container */}
      <main className="flex-grow max-w-7xl mx-auto py-8">
        {loading && <p className="text-center text-blue-600 my-6">Loading courses...</p>}
        {error && <p className="text-center text-red-600 my-6">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-10">
          {courses.map((course) => (
            <article
              key={course._id}
              className="bg-white shadow-lg border border-gray-200 rounded-xl p-5 flex flex-col"
            >
              <div className="relative rounded-md overflow-hidden h-44 mb-4 bg-gradient-to-tr from-blue-100 to-cyan-300 shadow-inner">
                <img
                  src={getTutorPhoto(course.instructor?.profileImage, course.instructor?.name)}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                {typeof course.rating === "number" && (
                  <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-3 py-1 text-sm font-semibold rounded-full shadow select-none flex items-center">
                    {course.rating.toFixed(1)}
                    <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927l1.286 3.962h4.167l-3.375 2.455 1.285 3.96-3.375-2.455-3.375 2.455 1.285-3.96-3.375-2.455h4.167z" />
                    </svg>
                  </span>
                )}
              </div>

              <div className="flex items-center mb-3">
                <img
                  src={getInitialsAvatar(course.instructor?.name)}
                  alt={course.instructor?.name || "Tutor"}
                  className="w-14 h-14 rounded-full border-4 border-white shadow mr-3"
                  loading="lazy"
                />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 truncate">
                    {course.instructor?.name ?? "Unknown Tutor"}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {course.instructor?.city ?? course.location ?? "Unknown City"}
                  </p>
                </div>
              </div>

              <h2 className="text-xl font-bold text-blue-900 mb-1 truncate">{course.title}</h2>
              <p className="mb-3 text-gray-700 text-sm line-clamp-3">
                {course.description ?? "No description available."}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold select-none uppercase ${
                    BADGE_COLORS[course.coachingType]
                  }`}
                >
                  {course.coachingType}
                </span>
                {course.topics?.slice(0, 3).map((topic, idx) => (
                  <span key={idx} className="bg-blue-200 text-blue-800 text-xs rounded px-2 truncate">
                    {topic}
                  </span>
                ))}
              </div>

              <p className="text-xs text-gray-500 mb-4">
                Language: <strong>{course.language ?? "English"}</strong>
                <br />
                Available:{" "}
                {course.availableFrom && course.availableTo
                  ? `${course.availableFrom} - ${course.availableTo}`
                  : "Anytime"}
              </p>

              <div className="mt-auto flex justify-between items-center">
                <span className="text-green-700 font-extrabold text-lg">₹{course.price}</span>
                <button
                  onClick={() => handleBookCourse(course)}
                  className="py-2 px-5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow hover:from-purple-700 hover:to-indigo-700 transition duration-300"
                >
                  Book Now
                </button>
              </div>

              <button
                onClick={() => handleBookCourse(course, true)}
                className="mt-3 w-full py-2 rounded-full bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition duration-300"
              >
                Trial 3-Day Session
              </button>

              <p className="mt-2 text-center text-gray-500 italic text-xs">Risk-free trial for 3 days.</p>
            </article>
          ))}
        </div>

        {page !== -1 && (
          <div className="mt-10 text-center">
            <button
              type="button"
              disabled={loading}
              onClick={() => loadCourses(page + 1)}
              className={`px-8 py-3 rounded-full font-semibold text-white shadow ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-700 hover:bg-indigo-800"
              } transition duration-300`}
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto max-w-3xl mx-auto p-6 bg-indigo-50 rounded-lg shadow text-center">
        <h2 className="text-3xl font-bold text-indigo-700 mb-3">Keep Pushing Forward!</h2>
        <p className="text-gray-600">
          “Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most
          of all, love of what you are doing.”<br />
          <br />
          At TutorMitra, we're with you every step of the way—helping you find the best tutors to fuel
          your passion & achieve your dreams.
        </p>
      </footer>
    </div>
  );
}
