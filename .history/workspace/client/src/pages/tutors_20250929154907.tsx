import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

interface Tutor {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  coachingType: "online" | "offline" | "both";
  instructor?: Tutor;
  featured?: boolean;
}

const BADGE_COLORS: Record<string, string> = {
  online: "bg-blue-600 text-white",
  offline: "bg-green-600 text-white",
  both: "bg-purple-600 text-white",
};

export default function Courses() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const coachingTypeFilter = params.get("coachingType")?.toLowerCase() || "";

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const COURSES_PER_PAGE = 6;
  const [showMoreList, setShowMoreList] = useState(false);

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:3000/api/courses");
        const data = Array.isArray(res.data.courses) ? res.data.courses : [];
        setCourses(data);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(
    (course) =>
      coachingTypeFilter === "" ||
      coachingTypeFilter === "all" ||
      course.coachingType.toLowerCase() === coachingTypeFilter
  );

  // Courses for first 6 (swiper if you want) or for paging
  const coursesForMore = filteredCourses.slice(0, page * COURSES_PER_PAGE);

  const navigate = useNavigate();

  if (loading)
    return (
      <div className="py-20 text-center font-semibold text-xl text-indigo-700 animate-pulse">
        Loading courses...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-10 max-w-7xl mx-auto flex flex-col items-center">
      <header className="mb-14 text-center max-w-3xl">
        <h1 className="mb-6 text-4xl font-extrabold text-indigo-900 leading-tight">
          Find Best Courses For You
        </h1>
        <p className="text-md md:text-lg text-indigo-700 max-w-xl mx-auto">
          Browse courses, view details, and book sessions with trusted tutors.
        </p>
      </header>

      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-10">
        {coursesForMore.map((course) => (
          <article
            key={course._id}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/courses/${course._id}`)}
          >
            <h2 className="text-xl font-bold text-indigo-900">{course.title}</h2>
            <p className="mt-2 text-gray-600 text-sm line-clamp-3">{course.description}</p>
            <div className="mt-4 flex justify-between items-center">
              <span
                className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${BADGE_COLORS[course.coachingType]}`}
              >
                {course.coachingType.charAt(0).toUpperCase() + course.coachingType.slice(1)}
              </span>
              <span className="font-bold text-lg">₹{course.price}</span>
            </div>
            {course.instructor && (
              <p className="mt-3 text-indigo-700 font-semibold">By {course.instructor.name}</p>
            )}
          </article>
        ))}
      </div>

      {!showMoreList && filteredCourses.length > COURSES_PER_PAGE && (
        <button
          className="mb-10 px-8 py-3 rounded-2xl bg-indigo-700 hover:bg-blue-600 transition-colors text-white font-bold text-lg shadow-xl"
          onClick={() => setShowMoreList(true)}
        >
          Show More Courses
        </button>
      )}

      {showMoreList && filteredCourses.length > coursesForMore.length && (
        <button
          className="mb-12 px-7 py-2 rounded-xl bg-indigo-700 hover:bg-blue-700 text-white font-semibold shadow-lg transition-colors"
          onClick={() => setPage((p) => p + 1)}
        >
          Load More Courses
        </button>
      )}
    </div>
  );
}
