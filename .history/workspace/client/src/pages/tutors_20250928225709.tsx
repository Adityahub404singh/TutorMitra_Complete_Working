import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const PAGE_SIZE = 6;

interface Tutor {
  _id: string;
  name: string;
  subjects: string[];
  city: string;
  rating: number;
  feePerHour: number;
  profileImage?: string;
  mode?: string;
  availableFrom?: string;
  availableTo?: string;
}

function isTutorAvailable(tutor: Tutor): boolean {
  if (!tutor.availableFrom || !tutor.availableTo) return true;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = tutor.availableFrom.split(":").map(Number);
  const [endH, endM] = tutor.availableTo.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-5 h-5"
          fill={i < Math.round(rating) ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.124-6.55L.49 6.91
          6.561-.954L10 0l2.949 5.957
          6.561.954-4.756 4.63 1.124
          6.55z" />
        </svg>
      ))}
    </div>
  );
}

function getTutorAvatar(profileImage?: string, name: string = "Tutor") {
  if (!profileImage)
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E0E7FF&color=3730A3&rounded=true&size=96`;
  if (profileImage.startsWith("/uploads/")) return `http://localhost:3000${profileImage}`;
  if (profileImage.startsWith("http")) return profileImage;
  return `http://localhost:3000/uploads/${profileImage}`;
}

function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <img
        src="/logo512.png"
        alt="TutorMitra Logo"
        className="w-24 h-24 mb-4 animate-spin"
        style={{ filter: "drop-shadow(0 0 16px #3b82f6)" }}
      />
      <h2 className="text-2xl font-bold text-indigo-700 mb-2">TutorMitra</h2>
      <div className="animate-pulse text-indigo-600 text-sm">Loading tutors...</div>
    </div>
  );
}

export default function Tutors() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const subjectQuery = queryParams.get("subject")?.toLowerCase() || "";
  const locationQuery = queryParams.get("location")?.toLowerCase() || "";

  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/tutors`)
      .then((res) => setTutors(Array.isArray(res.data.tutors) ? res.data.tutors : []))
      .catch(() => setError("Failed to load tutors. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  const filteredTutors = tutors.filter((tutor) => {
    const subjectMatch =
      !subjectQuery ||
      subjectQuery === "all" ||
      (tutor.subjects && tutor.subjects.some((s) => s.toLowerCase().includes(subjectQuery)));
    const locationMatch = !locationQuery || (tutor.city || "").toLowerCase().includes(locationQuery);
    return subjectMatch && locationMatch;
  });

  const totalPages = Math.ceil(filteredTutors.length / PAGE_SIZE);
  const paginatedTutors = filteredTutors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-tr from-indigo-50 to-white p-4 sm:p-8 max-w-6xl mx-auto flex flex-col items-center">
      {loading && <SplashScreen />}

      <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-900 mt-6 mb-8 text-center">
        Find Your Perfect Tutor
      </h1>

      {error && (
        <div className="text-center text-red-600 py-10 font-semibold text-lg">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full">
        {paginatedTutors.length === 0 && !loading ? (
          <p className="col-span-full text-center text-gray-500 font-semibold">
            No tutors found.
          </p>
        ) : (
          paginatedTutors.map((tutor) => (
            <article
              key={tutor._id}
              className="bg-white rounded-lg shadow-xl p-7 flex flex-col items-center text-center hover:scale-[1.03] transition-transform duration-300"
            >
              <img
                src={getTutorAvatar(tutor.profileImage, tutor.name)}
                alt={tutor.name}
                className="w-24 h-24 rounded-full mb-3 object-cover border shadow"
              />

              <div className="font-semibold text-lg mb-1">{tutor.name}</div>

              <div className="flex flex-wrap justify-center gap-1 mb-2">
                {tutor.subjects.map((subject) => (
                  <span
                    className="bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs"
                    key={subject}
                  >
                    {subject}
                  </span>
                ))}
              </div>

              <div className="text-sm text-gray-500">{tutor.city}</div>

              <div className="flex items-center justify-center mt-2">
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${
                    isTutorAvailable(tutor) ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></span>
                <span
                  className={`text-sm ${
                    isTutorAvailable(tutor) ? "text-green-700" : "text-gray-400"
                  }`}
                >
                  {isTutorAvailable(tutor) ? "Available" : "Unavailable"}
                </span>
              </div>

              <div className="flex items-center justify-center mt-2">
                <StarRating rating={tutor.rating} />
                <span className="ml-2 text-gray-600 text-sm">{tutor.rating.toFixed(1)}</span>
              </div>

              <div className="mt-3 flex flex-col items-center w-full gap-2">
                <div className="font-bold text-green-700 text-lg">₹{tutor.feePerHour}</div>

                {/* Animated Buttons */}
                <button
                  className={`w-full py-2 px-4 rounded-full font-semibold mt-2 transition-transform duration-200 ease-in-out ${
                    isTutorAvailable(tutor)
                      ? "bg-yellow-500 text-white hover:bg-yellow-600 active:scale-95 focus:ring-2 focus:ring-yellow-400"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!isTutorAvailable(tutor)}
                  onClick={() => navigate(`/booking/${tutor._id}`)}
                >
                  Book Now
                </button>

                <button
                  className={`w-full py-2 px-4 rounded-full font-semibold transition-transform duration-200 ease-in-out ${
                    isTutorAvailable(tutor)
                      ? "bg-blue-700 text-white hover:bg-blue-800 active:scale-95 focus:ring-2 focus:ring-blue-500"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!isTutorAvailable(tutor)}
                  onClick={() => navigate(`/booking/${tutor._id}?type=trial`)}
                >
                  Book 3-Day Trial
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className={`px-4 py-2 rounded-md ${
            page === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
          }`}
        >
          Previous
        </button>
        <span className="text-lg font-semibold">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className={`px-4 py-2 rounded-md ${
            page === totalPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
          }`}
        >
          Next
        </button>
      </div>

      <div className="h-10"></div>
    </div>
  );
}
