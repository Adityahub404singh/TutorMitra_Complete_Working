import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

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
        <svg
          key={`full-${i}`}
          className="w-5 h-5 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          aria-hidden="true"
          role="img"
        >
          <path d="M10 15l-5.878 3.09 1.124-6.55L.49 6.91l6.561-.954L10 0l2.949 5.957 6.561.954-4.756 4.63 1.124 6.55z" />
        </svg>
      ))}
      {halfStar && (
        <svg
          className="w-5 h-5 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          aria-hidden="true"
          role="img"
        >
          <defs>
            <linearGradient id="halfGrad">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            fill="url(#halfGrad)"
            d="M10 15l-5.878 3.09 1.124-6.55L.49 6.91l6.561-.954L10 0l2.949 5.957 6.561.954-4.756 4.63 1.124 6.55z"
          />
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg
          key={`empty-${i}`}
          className="w-5 h-5 text-gray-300"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 20 20"
          aria-hidden="true"
          role="img"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 15l-5.878 3.09 1.124-6.55L.49 6.91l6.561-.954L10 0l2.949 5.957 6.561.954-4.756 4.63 1.124 6.55z"
          />
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

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`${API_BASE_URL}/tutors`)
      .then(res => setTutors(Array.isArray(res.data.tutors) ? res.data.tutors : []))
      .catch(() => setError("Failed to load tutors. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  const filteredTutors = tutors.filter((tutor) => {
    const subjectMatch =
      !subjectQuery || subjectQuery === "all" || (tutor.subjects && tutor.subjects.some((s) => s.toLowerCase().includes(subjectQuery)));
    const locationMatch = !locationQuery || (tutor.city || "").toLowerCase().includes(locationQuery);
    return subjectMatch && locationMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold text-indigo-900 mb-10 text-center">Find Your Perfect Tutor</h1>
      {(subjectQuery || locationQuery) && (
        <div className="mb-10 text-center text-gray-600" aria-live="polite">
          {subjectQuery && (
            <span>
              Subject: <strong>{subjectQuery}</strong>
            </span>
          )}
          {locationQuery && (
            <>
              {subjectQuery ? " | " : ""}
              <span>
                Location: <strong>{locationQuery}</strong>
              </span>
            </>
          )}
        </div>
      )}
      {loading && (
        <div className="text-center font-semibold text-indigo-700 animate-pulse py-12">
          Loading tutors...
        </div>
      )}
      {error && (
        <div className="text-center text-red-600 py-10 font-semibold text-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(!loading && !error && filteredTutors.length === 0) ? (
          <p className="col-span-full text-center text-gray-500 font-semibold">No tutors found matching your criteria.</p>
        ) : (
          filteredTutors.map((tutor) => {
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
                  <span className={`w-3 h-3 rounded-full ${availableNow ? "bg-green-500" : "bg-gray-400"}`} aria-label={availableNow ? "Available" : "Unavailable"}></span>
                  <span className={`text-sm ${availableNow ? "text-green-700" : "text-gray-500"}`}>
                    {availableNow ? "Available" : "Unavailable"}
                  </span>
                </div>
                <div className="flex items-center mt-2 mb-3">
                  <StarRating rating={tutor.rating} />
                  <span className="ml-2 font-bold text-yellow-600">{tutor.rating.toFixed(1)}</span>
                </div>
                <p className="text-lg font-semibold mb-4">₹{tutor.feePerHour} / hour</p>
                {tutor.bio && <p className="text-gray-600 mb-4 line-clamp-3">{tutor.bio}</p>}
                <p className="text-sm italic mb-5">
                  Available:{" "}
                  {tutor.availableFrom && tutor.availableTo
                    ? `${formatTime(tutor.availableFrom)} - ${formatTime(tutor.availableTo)}`
                    : "Anytime"}
                </p>

                <div className="flex space-x-2 w-full">
                  <button
                    aria-label={`Book a session with ${tutor.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (availableNow) navigate(`/booking/${tutor._id}`);
                    }}
                    disabled={!availableNow}
                    className={`flex-1 py-2 rounded-md text-white font-semibold transition ${
                      availableNow ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {availableNow ? "Book Now" : "Unavailable Now"}
                  </button>
                  {availableNow && (
                    <button
                      aria-label={`Book a 3-day trial with ${tutor.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/booking/${tutor._id}?type=trial`);
                      }}
                      className="flex-1 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-semibold transition"
                    >
                      Book 3-Day Trial
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
