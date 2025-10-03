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
        <svg key={i} className="w-6 h-6"
          fill={i < Math.round(rating) ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 20 20"
        >
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
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E0E7FF&color=3730A3&rounded=true&size=144`;
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
        className="w-28 h-28 mb-4 animate-spin"
        style={{ filter: "drop-shadow(0 0 20px #3b82f6)" }}
      />
      <h2 className="text-3xl font-bold text-indigo-700 mb-2">TutorMitra</h2>
      <div className="animate-pulse text-indigo-600 text-base">Loading tutors...</div>
    </div>
  );
}

function TutorAvatar({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="flex items-center justify-center w-36 h-36 mb-6 bg-indigo-100 rounded-[36%] shadow-lg overflow-hidden border-4 border-white relative">
      <img
        src={src}
        alt={alt}
        className="object-cover w-full h-full"
        style={{
          borderRadius: "36%",
        }}
      />
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
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-tr from-indigo-50 to-white p-6 sm:p-12 max-w-7xl mx-auto flex flex-col items-center">
      {loading && <SplashScreen />}

      <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-900 mt-10 mb-10 text-center">
        Find Your Perfect Tutor
      </h1>

      {error && (
        <div className="text-center text-red-600 py-12 font-semibold text-xl">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 w-full">
        {paginatedTutors.length === 0 && !loading ? (
          <p className="col-span-full text-center text-gray-500 font-semibold text-lg">
            No tutors found.
          </p>
        ) : (
          paginatedTutors.map((tutor) => (
            <article
              key={tutor._id}
              className="bg-white rounded-2xl shadow-2xl p-12 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300"
            >
              <TutorAvatar src={getTutorAvatar(tutor.profileImage, tutor.name)} alt={tutor.name} />

              <div className="font-semibold text-2xl mb-2">{tutor.name}</div>

              <div className="flex flex-wrap justify-center gap-2 mb-4 text-sm">
                {tutor.subjects.map((subject) => (
                  <span
                    className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs sm:text-sm"
                    key={subject}
                  >
                    {subject}
                  </span>
                ))}
              </div>

              <div className="text-base text-gray-700">{tutor.city}</div>

              <div className="flex items-center justify-center mt-4 text-base">
                <span
                  className={`w-3 h-3 rounded-full mr-3 ${
                    isTutorAvailable(tutor) ? "bg-green-600" : "bg-gray-400"
                  }`}
                ></span>
                <span
                  className={`${
                    isTutorAvailable(tutor) ? "text-green-800" : "text-gray-500"
                  }`}
                >
                  {isTutorAvailable(tutor) ? "Available" : "Unavailable"}
                </span>
              </div>

              <div className="flex items-center justify-center mt-4">
                <StarRating rating={tutor.rating} />
                <span className="ml-3 text-gray-700 text-base">{tutor.rating.toFixed(1)}</span>
              </div>

              <div className="mt-6 flex flex-col items-center w-full gap-4">
                <div className="font-bold text-green-800 text-2xl">₹{tutor.feePerHour}</div>

                <button
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-transform duration-200 ease-in-out ${
                    isTutorAvailable(tutor)
                      ? "bg-yellow-600 text-white hover:bg-yellow-700 active:scale-95 focus:ring-4 focus:ring-yellow-500"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!isTutorAvailable(tutor)}
                  onClick={() => navigate(`/booking/${tutor._id}`)}
                >
                  Book Now
                </button>

                <button
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-transform duration-200 ease-in-out ${
                    isTutorAvailable(tutor)
                      ? "bg-blue-800 text-white hover:bg-blue-900 active:scale-95 focus:ring-4 focus:ring-blue-600"
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

      <div className="flex justify-center items-center gap-6 mt-14 mb-8">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className={`text-lg font-semibold px-6 py-3 rounded-lg ${
            page === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-indigo-700 text-white hover:bg-indigo-800 focus:ring-4 focus:ring-indigo-600"
          }`}
        >
          Previous
        </button>
        <span className="text-xl font-bold text-indigo-900">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className={`text-lg font-semibold px-6 py-3 rounded-lg ${
            page === totalPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-indigo-700 text-white hover:bg-indigo-800 focus:ring-4 focus:ring-indigo-600"
          }`}
        >
          Next
        </button>
      </div>

      <div className="h-14"></div>
    </div>
  );
}
