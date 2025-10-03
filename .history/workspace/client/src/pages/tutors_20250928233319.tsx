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
    <div className="flex text-yellow-400">
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

function getAvatarURL(profileImage?: string, name: string = "Tutor") {
  if (!profileImage) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=gray&color=white&rounded=true&size=144`;
  }
  if (profileImage.startsWith("/uploads/")) {
    return `http://localhost:3000${profileImage}`;
  }
  if (profileImage.startsWith("http")) {
    return profileImage;
  }
  return `http://localhost:3000/uploads/${profileImage}`;
}

function TutorCard({ tutor }: { tutor: Tutor }) {
  const navigate = useNavigate();
  const available = isTutorAvailable(tutor);

  return (
    <article className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transition-transform transform hover:scale-105 duration-300 max-w-xs mx-auto">
      <div className="relative w-32 h-32 mb-4">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-300 via-purple-400 to-indigo-500 opacity-40 blur-xl"></div>
        <img
          src={getAvatarURL(tutor.profileImage, tutor.name)}
          alt={tutor.name}
          className="relative w-32 h-32 object-cover rounded-3xl border-4 border-white shadow-md"
        />
      </div>

      <h3 className="text-xl font-semibold text-indigo-900">{tutor.name}</h3>
      <p className="text-indigo-600">{tutor.city}</p>

      <div className="flex flex-wrap justify-center gap-2 my-2">
        {tutor.subjects.map((subject) => (
          <span
            key={subject}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold select-none"
          >
            {subject}
          </span>
        ))}
      </div>

      {tutor.description && (
        <p className="text-gray-700 text-sm mb-4">
          {tutor.description.length > 70
            ? tutor.description.slice(0, 70) + "..."
            : tutor.description}
        </p>
      )}

      <div className="flex items-center space-x-2 my-2">
        <div
          className={`w-3 h-3 rounded-full ${
            available ? "bg-green-500" : "bg-gray-400"
          }`}
        ></div>
        <span className={available ? "text-green-600" : "text-gray-500"}>
          {available ? "Available Now" : "Unavailable"}
        </span>
      </div>

      <div className="flex items-center justify-center space-x-2 my-2">
        <StarRating rating={tutor.rating} />
        <span className="font-semibold text-gray-700">{tutor.rating.toFixed(1)}</span>
      </div>

      <div className="text-green-700 font-bold text-lg my-2">₹{tutor.feePerHour}</div>

      <button
        disabled={!available}
        onClick={() => navigate(`/booking/${tutor._id}`)}
        className={`mb-2 w-full px-4 py-2 rounded-lg text-white font-semibold transition-colors duration-200 ${
          available ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        Book Now
      </button>

      <button
        disabled={!available}
        onClick={() => navigate(`/booking/${tutor._id}?type=trial`)}
        className={`w-full px-4 py-2 rounded-lg text-white font-semibold ${
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
  const searchParams = new URLSearchParams(location.search);
  const subjectFilter = searchParams.get("subject")?.toLowerCase() || "";
  const locationFilter = searchParams.get("location")?.toLowerCase() || "";

  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/tutors")
      .then((response) => {
        const tutorsData = Array.isArray(response.data.tutors)
          ? response.data.tutors
          : [];
        setTutors(tutorsData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredTutors = tutors.filter((tutor) => {
    const subjectMatch =
      !subjectFilter ||
      subjectFilter === "all" ||
      tutor.subjects.some((s) => s.toLowerCase().includes(subjectFilter));
    const locationMatch =
      !locationFilter ||
      tutor.city.toLowerCase().includes(locationFilter);
    return subjectMatch && locationMatch;
  });

  if (loading) {
    return (
      <div className="py-20 text-center font-semibold text-xl">
        Loading tutors...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white p-8 max-w-7xl mx-auto flex flex-col items-center">
      <header className="mb-12 text-center max-w-3xl">
        <h1 className="text-4xl font-extrabold mb-4 text-indigo-900">
          Discover Skilled Tutors Near You
        </h1>
        <p className="text-indigo-700 max-w-xl mx-auto">
          Find verified experienced tutors in your city with easy booking &
          trial options.
        </p>
      </header>

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

      <section className="mt-20 bg-indigo-900 text-white rounded-3xl p-10 max-w-4xl shadow-lg text-center select-none">
        <h2 className="text-3xl font-semibold mb-4">Why Choose TutorMitra?</h2>
        <p className="mb-6 max-w-md mx-auto">
          TutorMitra connects you with trusted local tutors offering quality
          coaching at affordable fees.
        </p>
        <ul className="list-disc list-inside max-w-md mx-auto text-left space-y-3">
          <li>Experienced and verified tutors</li>
          <li>Transparent pricing, no hidden charges</li>
          <li>Easy booking & trial sessions</li>
          <li>Personalized learning support</li>
          <li>Community trust and feedback</li>
        </ul>
      </section>
    </div>
  );
}
