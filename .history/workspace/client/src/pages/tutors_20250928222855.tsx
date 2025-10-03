import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import AboutPage from "./components/AboutPage.";
// fir render karo:
<AboutPage />


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

interface Tutor {
  _id: string;
  name: string;
  subjects: string[];
  city: string;
  rating: number;
  feePerHour: number;
  profileImage?: string;
  bio?: string;
  mode?: string;
  availableFrom?: string;
  availableTo?: string;
}

const PAGE_SIZE = 6;

const BADGE_COLORS: Record<string, string> = {
  online: "bg-blue-500",
  offline: "bg-green-600",
  both: "bg-purple-600",
};

function formatTime(time?: string) {
  if (!time) return "";
  const [hourStr, min] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${min} ${ampm}`;
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
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <div className="flex items-center space-x-0.5 text-yellow-400" aria-label={`Rating: ${rating} out of 5`}>
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" aria-hidden="true" role="img">
          <path d="M10 15l-5.878 3.09 1.124-6.55L.49 6.91l6.561-.954L10 0l2.949 5.957 6.561.954-4.756 4.63 1.124 6.55z" />
        </svg>
      ))}
      {halfStar && (
        <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" aria-hidden="true" role="img">
          <defs>
            <linearGradient id="halfGrad">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#halfGrad)" d="M10 15l-5.878 3.09 1.124-6.55L.49 6.91l6.561-.954L10 0l2.949 5.957 6.561.954-4.756 4.63 1.124 6.55z" />
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 20 20" aria-hidden="true" role="img">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 15l-5.878 3.09 1.124-6.55L.49 6.91l6.561-.954L10 0l2.949 5.957 6.561.954-4.756 4.63 1.124 6.55z" />
        </svg>
      ))}
    </div>
  );
}

function getTutorAvatar(profileImage?: string) {
  if (!profileImage) {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAv c3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4=";
  }
  if (profileImage.startsWith("/uploads/")) return `http://localhost:3000${profileImage}`;
  if (profileImage.startsWith("http")) return profileImage;
  return `http://localhost:3000/uploads/${profileImage}`;
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
    setError(null);
    axios
      .get(`${API_BASE_URL}/tutors`)
      .then((res) => setTutors(Array.isArray(res.data.tutors) ? res.data.tutors : []))
      .catch(() => setError("Failed to load tutors. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  const filteredTutors = tutors.filter((tutor) => {
    const subjectMatch =
      !subjectQuery || subjectQuery === "all" || (tutor.subjects && tutor.subjects.some((s) => s.toLowerCase().includes(subjectQuery)));
    const locationMatch = !locationQuery || (tutor.city || "").toLowerCase().includes(locationQuery);
    return subjectMatch && locationMatch;
  });

  const totalPages = Math.ceil(filteredTutors.length / PAGE_SIZE);
  const paginatedTutors = filteredTutors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold text-indigo-900 mb-10 text-center">Find Your Perfect Tutor</h1>

      {(subjectQuery || locationQuery) && (
        <div className="mb-10 text-center text-gray-600" aria-live="polite">
          {subjectQuery && <span>Subject: <strong>{subjectQuery}</strong></span>}
          {locationQuery && (
            <>
              {subjectQuery ? " | " : ""}
              <span>Location: <strong>{locationQuery}</strong></span>
            </>
          )}
        </div>
      )}

      {loading && <div className="text-center font-semibold text-indigo-700 animate-pulse py-12">Loading tutors...</div>}
      {error && <div className="text-center text-red-600 py-10 font-semibold text-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {!loading && !error && paginatedTutors.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 font-semibold">No tutors found matching your criteria.</p>
        ) : (
          paginatedTutors.map((tutor) => {
            const availableNow = isTutorAvailable(tutor);
            return (
              <article
                key={tutor._id}
                className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center cursor-pointer hover:shadow-lg"
                tabIndex={0}
                aria-label={`Tutor ${tutor.name}, subjects: ${tutor.subjects.join(", ")}, located in ${tutor.city}, rating ${tutor.rating} stars, price ${tutor.feePerHour} rupees per hour`}
                onClick={() => navigate(`/tutors/${tutor._id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigate(`/tutors/${tutor._id}`);
                  }
                }}
              >
                <img
                  src={getTutorAvatar(tutor.profileImage)}
                  alt={`${tutor.name} avatar`}
                  className="w-28 h-28 rounded-full mb-5 object-cover border shadow"
                  loading="lazy"
                />
                <h3 className="text-xl font-semibold mb-3">{tutor.name}</h3>
                <div className="flex flex-wrap justify-center mb-4 space-x-2" role="list" aria-label="Subjects taught">
                  {tutor.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm font-semibold"
                      aria-label={`Subject: ${subject}`}
                    >
                      {subject}
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 mb-2">{tutor.city}</p>
                <div className="flex items-center justify-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full font-bold text-white text-xs uppercase ${
                      BADGE_COLORS[tutor.mode ?? "offline"]
                    }`}
                  >
                    {tutor.mode === "both" ? "Offline & Online" : tutor.mode?.toUpperCase() ?? "OFFLINE"}
                  </span>
                  <span
                    className={`w-3 h-3 rounded-full ${availableNow ? "bg-green-500" : "bg-gray-400"}`}
                    aria-label={availableNow ? "Available" : "Unavailable"}
                  ></span>
                  <span className={`text-sm ${availableNow ? "text-green-700" : "text-gray-500"}`}>
                    {availableNow ? "Available" : "Unavailable"}
                  </span>
                </div>
                <div className="flex items-center mt-2 mb-3">
                  <StarRating rating={tutor.rating} />
                  <span className="ml-2 font-bold text-yellow-600">{tutor.rating.toFixed(1)}</span>
                </div>

                {/* Buttons With Price and Trusted badge */}
                <div className="flex flex-col items-center gap-2 mt-3 w-full max-w-xs mx-auto">
                  <div className="flex items-center w-full gap-3">
                    <span className="font-bold text-green-700 text-xl">
                      ₹{tutor.feePerHour}
                    </span>
                    <button
                      aria-label={`Book Now for ${tutor.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (availableNow) navigate(`/booking/${tutor._id}`);
                      }}
                      disabled={!availableNow}
                      className={`px-5 py-2 rounded-full font-semibold shadow transition ${
                        availableNow
                          ? "bg-gradient-to-r from-yellow-400 to-pink-400 text-white hover:from-yellow-500 hover:to-pink-500"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Book Now
                    </button>
                  </div>
                  <div className="flex flex-col items-center w-full gap-2">
                    <button
                      aria-label={`Book 3-Day Trial for ${tutor.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/booking/${tutor._id}?type=trial`);
                      }}
                      disabled={!availableNow}
                      className={`w-full py-2 rounded-full font-semibold transition ${
                        availableNow
                          ? "bg-blue-700 hover:bg-blue-800 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Book 3-Day Trial
                    </button>
                    <span className="mt-2 bg-green-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow select-none">
                      Trusted
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Trial session is risk free for first 3 days.
                  </div>
                </div>

              </article>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className={`px-4 py-2 rounded-md ${
            page === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"
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
            page === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
