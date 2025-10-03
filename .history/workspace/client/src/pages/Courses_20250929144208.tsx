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

export default function MotivationalCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => { loadCourses(1); }, []);

  async function loadCourses(pageNum: number) {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/courses`, { params: { page: pageNum, limit: PAGE_SIZE } });
      if (res.data && Array.isArray(res.data.data)) {
        setCourses((p) => (pageNum === 1 ? res.data.data : [...p, ...res.data.data]));
        setError(null);
        if (res.data.data.length < PAGE_SIZE) setPage(-1);
        else setPage(pageNum);
      } else {
        setError("No Courses Found");
      }
    } catch {
      setError("Failed to load courses, try again later.");
    } finally {
      setLoading(false);
    }
  }

  function handleBook(course: Course, trial = false) {
    if (authLoading) return;
    if (!user) {
      alert("Login as student to book");
      navigate("/login");
      return;
    }
    if (user.role !== "student") {
      alert("Only students can book");
      return;
    }
    if (!course.instructor?._id) {
      alert("Instructor info missing");
      return;
    }
    const type = trial ? "trial" : "regular";
    navigate(`/tutors/${course.instructor._id}?courseId=${course._id}&type=${type}`);
  }

  const swiperBreakpoints = {
    320: { slidesPerView: 1, spaceBetween: 16 },
    640: { slidesPerView: 2, spaceBetween: 24 },
    1024: { slidesPerView: 3, spaceBetween: 24 },
    1440: { slidesPerView: 4, spaceBetween: 30 },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white font-sans">
      <section className="text-center py-16 px-4 max-w-5xl mx-auto">
        <h1 className="text-5xl font-extrabold text-blue-700 mb-6">Stay Motivated & Study Hard with TutorMitra</h1>
        <p className="max-w-xl mx-auto text-lg text-gray-700 mb-6 leading-relaxed">
          Success is not final, failure is not fatal: It is the courage to continue that counts. 
          Explore our vast selection of expert tutors ready to help you learn anything—online or offline.
        </p>
        <p className="max-w-lg mx-auto text-base italic text-gray-500">
          “Education is the most powerful weapon which you can use to change the world.” – Nelson Mandela
        </p>
      </section>

      <main className="flex-1 px-4 sm:px-12 max-w-7xl mx-auto">
        {loading && <p className="text-center text-blue-600 font-semibold my-6">Loading courses...</p>}
        {error && <p className="text-center text-red-600 font-semibold my-6">{error}</p>}

        <Swiper breakpoints={swiperBreakpoints} navigation pagination={{ clickable: true }} className="pb-12">
          {courses.map((course) => (
            <SwiperSlide key={course._id} className="flex justify-center">
              <article className="bg-white rounded-lg p-6 shadow border border-gray-200 max-w-xs w-full flex flex-col">
                <div className="relative h-44 rounded-md overflow-hidden mb-4 bg-gradient-to-tr from-blue-100 to-blue-300 shadow-inner">
                  <img src={getTutorPhoto(course.instructor?.profileImage, course.instructor?.name)} alt={course.title} className="w-full h-full object-cover" />
                  {typeof course.rating === "number" && (
                    <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 rounded-full px-3 py-1 flex items-center font-semibold shadow select-none">
                      {course.rating.toFixed(1)}
                      <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927l1.286 3.962h4.167l-3.375 2.455 1.285 3.96-3.375-2.455-3.375 2.455 1.285-3.96-3.375-2.455h4.167z"/></svg>
                    </span>
                  )}
                </div>

                <div className="flex items-center mb-3">
                  <img src={getInitialsAvatar(course.instructor?.name)} className="w-16 h-16 rounded-full border-4 border-white shadow mr-4" alt="Instructor" loading="lazy"/>
                  <div>
                    <h3 className="text-xl font-semibold truncate">{course.instructor?.name || "Unknown Instructor"}</h3>
                    <p className="text-gray-500">{course.instructor?.city || course.location || "Unknown City"}</p>
                  </div>
                </div>

                <h2 className="font-bold text-lg mb-1 truncate">{course.title}</h2>
                <p className="text-gray-700 text-sm mb-3 line-clamp-3">{course.description || "No description available."}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`uppercase px-3 py-1 rounded-full text-xs font-bold select-none ${BADGE_COLORS[course.coachingType]}`}>
                    {course.coachingType}
                  </span>
                  {course.topics?.slice(0, 3).map((topic, idx) => (
                    <span key={idx} className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs truncate">{topic}</span>
                  ))}
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  Language: <strong>{course.language || "English"}</strong><br />
                  Available: {course.availableFrom && course.availableTo ? `${course.availableFrom} - ${course.availableTo}` : "Anytime"}
                </p>

                <div className="flex justify-between items-center mt-auto">
                  <span className="text-green-700 font-extrabold text-lg">₹{course.price}</span>
                  <button onClick={() => handleBook(course)} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2 rounded-full font-semibold shadow hover:from-purple-700 hover:to-indigo-700 transition">
                    Book Now
                  </button>
                </div>
                
                <button onClick={() => handleBook(course, true)} className="mt-4 w-full bg-indigo-600 text-white rounded-full py-2 font-semibold shadow hover:bg-indigo-700 transition">
                  Book Trial 3 Days
                </button>

                <p className="text-center mt-2 text-gray-500 italic text-xs">Trial is risk free for first 3 days.</p>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>

        {page !== -1 && (
          <div className="flex justify-center mt-10">
            <button disabled={loading} onClick={() => loadCourses(page + 1)} 
              className={`px-8 py-3 rounded-full font-semibold shadow text-white bg-indigo-700 hover:bg-indigo-800 transition disabled:cursor-not-allowed disabled:bg-gray-400`}>
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </main>

      <section className="p-8 text-center max-w-4xl mx-auto mt-16 bg-indigo-50 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-4 text-indigo-700">Empower Your Study Journey</h2>
        <p className="text-gray-600 leading-relaxed text-lg max-w-3xl mx-auto">
          Education strengthens your mindset, builds confidence, and opens doors to unlimited opportunities. Keep pushing yourself, stay consistent, and remember: every small effort counts.<br /><br />
          TutorMitra is your partner in this journey, helping you find the perfect mentor to keep you inspired and guide your learning path.<br /><br />
          Let’s make your study time effective, exciting, and rewarding together.
        </p>
      </section>
    </div>
  );
}
