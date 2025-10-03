import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Pagination } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

SwiperCore.use([Navigation, Pagination]);

interface Tutor {
  _id: string;
  name: string;
  subjects: string[];
  city: string;
  rating: number;
  feePerHour: number;
  profileImage?: string;
  availableFrom?: string;
  availableTo?: string;
  description?: string;
}

function isTutorAvailable(tutor: Tutor) {
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
        <svg
          key={i}
          className="w-5 h-5"
          fill={i < Math.round(rating) ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.124-6.55L.49 6.91 6.561-.954 10 0l2.949 5.957 6.561.954-4.756 4.63 1.124 6.55" />
        </svg>
      ))}
    </div>
  );
}

function getTutorAvatar(profileImage?: string, name: string = "Tutor") {
  if (!profileImage)
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=F3F4F6&color=2563EB&rounded=true&size=144`;
  if (profileImage.startsWith("/uploads/")) return `http://localhost:3000${profileImage}`;
  if (profileImage.startsWith("http")) return profileImage;
  return `http://localhost:3000/uploads/${profileImage}`;
}

function TutorCard({ tutor }: { tutor: Tutor }) {
  const navigate = useNavigate();
  const available = isTutorAvailable(tutor);

  return (
    <article className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transition-all transform hover:scale-105 hover:shadow-2xl duration-300 max-w-xs mx-auto">
      <div className="relative w-32 h-32 mb-4">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-200 via-blue-300 to-indigo-400 opacity-40 blur-lg"></div>
        <img
          src={getTutorAvatar(tutor.profileImage, tutor.name)}
          alt={tutor.name}
          className="relative object-cover w-32 h-32 rounded-3xl border-4 border-white shadow-md"
        />
      </div>

      <h3 className="text-xl font-semibold text-indigo-900 mb-1">{tutor.name}</h3>
      <p className="text-indigo-600 mb-2">{tutor.city}</p>

      <div className="flex flex-wrap justify-center gap-1 mb-3">
        {tutor.subjects.map((subj) => (
          <span
            key={subj}
            className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold select-none"
          >
            {subj}
          </span>
        ))}
      </div>

      {tutor.description && (
        <p className="mb-3 text-gray-700 text-xs">
          {tutor.description.length > 80
            ? tutor.description.slice(0, 80) + "..."
            : tutor.description}
        </p>
      )}

      <div className="flex items-center justify-center mb-2">
        <span
          className={`w-3 h-3 rounded-full mr-2 ${
            available ? "bg-green-600" : "bg-gray-400"
          }`}
        />
        <span className={available ? "text-green-700 font-semibold" : "text-gray-500"}>
          {available ? "Available Now" : "Unavailable"}
        </span>
      </div>

      <div className="flex items-center justify-center mb-2 space-x-1">
        <StarRating rating={tutor.rating} />
        <span className="text-gray-600 font-medium text-sm">{tutor.rating.toFixed(1)}</span>
      </div>

      <div className="text-lg font-bold text-green-700 mb-4">₹{tutor.feePerHour}</div>

      <button
        disabled={!available}
        onClick={() => navigate(`/booking/${tutor._id}`)}
        className={`w-full py-2 rounded-lg text-white font-semibold transition-colors duration-300 ${
          available ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        Book Now
      </button>

      <button
        disabled={!available}
        onClick={() => navigate(`/booking/${tutor._id}?type=trial`)}
        className={`w-full py-2 mt-2 rounded-lg text-white font-semibold transition-colors duration-300 ${
          available ? "bg-indigo-700 hover:bg-indigo-800" : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        Book 3-Day Trial
      </button>
    </article>
  );
}

export default function Tutors() {
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const subjectQuery = queryParams.get("subject")?.toLowerCase() || "";
  const locationQuery = queryParams.get("location")?.toLowerCase() || "";

  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/tutors")
      .then((res) => {
        const allTutors = Array.isArray(res.data.tutors) ? res.data.tutors : [];
        setTutors(allTutors);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredTutors = tutors.filter((tutor) => {
    const subjectMatch =
      !subjectQuery ||
      subjectQuery === "all" ||
      (tutor.subjects && tutor.subjects.some((s) => s.toLowerCase().includes(subjectQuery)));
    const locationMatch = !locationQuery || (tutor.city || "").toLowerCase().includes(locationQuery);
    return subjectMatch && locationMatch;
  });

  if (loading)
    return <div className="py-20 text-center font-semibold text-xl">Loading tutors...</div>;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-indigo-50 via-blue-50 to-white p-8 max-w-7xl mx-auto flex flex-col items-center">
      <header className="mb-10 text-center max-w-2xl">
        <h1 className="text-4xl font-extrabold text-indigo-900 mb-4">
          Discover Skilled Tutors Near You
        </h1>
        <p className="text-indigo-700 mb-6">
          Explore multiple expert tutors from your city with easy booking and trial options.
        </p>
      </header>

      {/* Swiper Slider */}
      <Swiper
        slidesPerView={1}
        spaceBetween={20}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="w-full max-w-7xl"
      >
        {filteredTutors.map((tutor) => (
          <SwiperSlide key={tutor._id}>
            <TutorCard tutor={tutor} />
          </SwiperSlide>
        ))}
      </Swiper>

      <section className="mt-20 bg-indigo-900 text-white rounded-3xl p-12 max-w-5xl shadow-lg text-center select-none">
        <h2 className="mb-6 text-3xl font-semibold">Why Choose TutorMitra?</h2>
        <p className="mb-6 max-w-xl mx-auto text-lg">
          TutorMitra connects you with verified and experienced offline tutors in your local city. Book trial sessions and happy learning guaranteed!
        </p>
        <ul className="list-disc list-inside max-w-md mx-auto space-y-2 text-md text-left">
          <li>Experienced and verified tutors.</li>
          <li>No hidden charges, transparent pricing.</li>
          <li>Simple trial and full booking.</li>
          <li>Personalized coaching support.</li>
          <li>Community feedback and trust.</li>
        </ul>
      </section>
    </div>
  );
}
