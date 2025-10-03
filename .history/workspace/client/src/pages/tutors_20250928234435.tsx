import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation, Pagination } from "swiper/modules";

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

const StarRating = ({ rating }: { rating: number }) => (
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

// Avatar with either profile image or first letter of first name in circle
const Avatar = ({ profileImage, name }: { profileImage?: string; name: string }) => {
  if (profileImage) {
    const url =
      profileImage.startsWith("/uploads/")
        ? `http://localhost:3000${profileImage}`
        : profileImage.startsWith("http")
        ? profileImage
        : `http://localhost:3000/uploads/${profileImage}`;
    return (
      <img
        src={url}
        alt={name}
        className="w-20 h-20 object-cover rounded-3xl border-4 border-white shadow-md"
      />
    );
  }
  // No image fallback: circle with first letter of first name
  const firstWord = name.split(" ")[0] || "T";
  return (
    <div className="flex items-center justify-center w-20 h-20 rounded-3xl border-4 border-white shadow-md bg-indigo-500 text-white text-3xl font-bold">
      {firstWord.charAt(0).toUpperCase()}
    </div>
  );
};

const TutorCard = ({ tutor }: { tutor: Tutor }) => {
  const navigate = useNavigate();
  const available = isTutorAvailable(tutor);
  return (
    <article className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transition-transform transform hover:scale-105 duration-300 max-w-xs mx-auto">
      <div className="relative w-20 h-20 mb-4">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-300 via-purple-400 to-indigo-500 opacity-30 blur-xl"></div>
        <Avatar profileImage={tutor.profileImage} name={tutor.name} />
      </div>
      <h3 className="text-xl font-semibold text-indigo-900">{tutor.name}</h3>
      <p className="text-indigo-600">{tutor.city}</p>
      <div className="flex flex-wrap justify-center gap-2 my-2">
        {tutor.subjects.map((s) => (
          <span
            key={s}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold select-none"
          >
            {s}
          </span>
        ))}
      </div>
      {tutor.description && (
        <p className="text-gray-700 my-2 max-w-[18rem]">
          {tutor.description.length > 80 ? tutor.description.slice(0, 80) + "..." : tutor.description}
        </p>
      )}
      <div className="flex items-center space-x-2 my-2">
        <div className={`w-3 h-3 rounded-full ${available ? "bg-green-500" : "bg-gray-400"}`}></div>
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
        className={`mb-2 w-full rounded-lg py-2 font-semibold text-white transition-colors duration-200 ${
          available ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-300 cursor-not-allowed"
        }`}
        onClick={() => available && navigate(`/booking/${tutor._id}`)}
      >
        Book Now
      </button>
      <button
        disabled={!available}
        className={`w-full rounded-lg py-2 font-semibold text-white ${
          available ? "bg-indigo-700 hover:bg-indigo-800" : "bg-gray-300 cursor-not-allowed"
        }`}
        onClick={() => available && navigate(`/booking/${tutor._id}?type=trial`)}
      >
        Book 3-Day Trial
      </button>
    </article>
  );
};

export default function Tutors() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const subjectFilter = params.get("subject")?.toLowerCase() || "";
  const locationFilter = params.get("location")?.toLowerCase() || "";

  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);

  // For pagination of "Load More" vertical list
  const [page, setPage] = useState(1);
  const TUTORS_PER_PAGE = 6;

  const [showMoreList, setShowMoreList] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/tutors")
      .then((res) => {
        const data = Array.isArray(res.data.tutors) ? res.data.tutors : [];
        setTutors(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Apply filter
  const filteredTutors = tutors.filter(
    (tutor) =>
      (subjectFilter === "" ||
        subjectFilter === "all" ||
        tutor.subjects.some((s) => s.toLowerCase().includes(subjectFilter))) &&
      (locationFilter === "" || tutor.city.toLowerCase().includes(locationFilter))
  );

  // Tutors for Swiper (fixed number, e.g. 6)
  const tutorsForSwiper = filteredTutors.slice(0, 6);

  // Tutors for More List - paginated by page*6
  const tutorsForMore = filteredTutors.slice(6, 6 + page * TUTORS_PER_PAGE);

  if (loading)
    return <div className="py-20 text-center font-semibold text-xl">Loading tutors...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-8 max-w-7xl mx-auto flex flex-col items-center">
      <header className="mb-12 text-center max-w-3xl">
        <h1 className="mb-4 text-4xl font-extrabold text-indigo-900">Discover Skilled Tutors Near You</h1>
        <p className="mx-auto max-w-xl text-indigo-700">
          Find verified experienced tutors in your city with easy booking & trial options.
        </p>
      </header>

      {/* Swiper slider showing first 6 tutors */}
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
        className="w-full mb-12"
      >
        {tutorsForSwiper.map((tutor) => (
          <SwiperSlide key={tutor._id}>
            <TutorCard tutor={tutor} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* "Show More" button toggles below list */}
      {!showMoreList && filteredTutors.length > 6 && (
        <button
          className="mb-12 rounded-xl bg-indigo-700 px-8 py-3 font-semibold text-white hover:bg-indigo-800 transition-colors"
          onClick={() => setShowMoreList(true)}
        >
          Show More Tutors
        </button>
      )}

      {/* Vertical list with pagination load inside */}
      {showMoreList && (
        <>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-6">
            {tutorsForMore.map((tutor) => (
              <TutorCard key={tutor._id} tutor={tutor} />
            ))}
          </div>

          {/* Show more button for loading next page */}
          {6 + page * TUTORS_PER_PAGE < filteredTutors.length && (
            <button
              className="mb-12 rounded-xl bg-indigo-700 px-6 py-3 font-semibold text-white hover:bg-indigo-800 transition-colors"
              onClick={() => setPage((p) => p + 1)}
            >
              Load More
            </button>
          )}
        </>
      )}

      <section className="mt-20 w-full max-w-4xl rounded-3xl bg-indigo-900 p-10 text-center text-white shadow-lg select-none">
        <h2 className="mb-4 text-3xl font-semibold">Why Choose TutorMitra?</h2>
        <p className="mb-6 max-w-md mx-auto">
          TutorMitra connects you with trusted local tutors offering quality coaching at affordable fees.
        </p>
        <ul className="mx-auto max-w-md space-y-2 text-left list-disc list-inside">
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
