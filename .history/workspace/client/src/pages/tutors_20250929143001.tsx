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
  <div className="flex text-yellow-400 items-center justify-center mt-1">
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
    <span className="ml-2 font-semibold text-gray-800">{rating.toFixed(1)}</span>
  </div>
);

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
        className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-full border-4 border-indigo-600 shadow-xl mx-auto transition-transform duration-300 hover:scale-110"
      />
    );
  }
  const firstWord = name.split(" ")[0] || "T";
  return (
    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-indigo-600 shadow-xl bg-indigo-500 text-white text-4xl font-extrabold select-none flex justify-center items-center mx-auto transition-transform duration-300 hover:scale-110">
      {firstWord.charAt(0).toUpperCase()}
    </div>
  );
};

const TutorCard = ({ tutor }: { tutor: Tutor }) => {
  const navigate = useNavigate();
  const available = isTutorAvailable(tutor);
  return (
    <article className="bg-gradient-to-br from-indigo-100 to-white rounded-2xl shadow-xl p-7 flex flex-col items-center text-center hover:scale-105 transform transition-transform duration-300 max-w-xs mx-auto border-2 border-indigo-200">
      <div className="relative mb-4 cursor-pointer" onClick={() => navigate(`/tutors/${tutor._id}`)}>
        <Avatar profileImage={tutor.profileImage} name={tutor.name} />
        {available && (
          <span className="absolute -right-2 -bottom-2 px-3 py-1 bg-green-600 text-white rounded-full text-xs shadow-md animate-bounce">
            Available
          </span>
        )}
      </div>
      <h3 className="text-xl font-bold text-indigo-900 cursor-pointer" onClick={() => navigate(`/tutors/${tutor._id}`)}>
        {tutor.name}
      </h3>
      <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium mt-1">{tutor.city}</span>
      <div className="flex flex-wrap justify-center gap-2 my-2">
        {tutor.subjects.map((s) => (
          <span key={s} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">{s}</span>
        ))}
      </div>
      {tutor.description && (
        <p className="text-gray-700 mb-2 max-w-[16rem] text-xs">
          {tutor.description.length > 80 ? tutor.description.slice(0, 80) + "..." : tutor.description}
        </p>
      )}
      <StarRating rating={tutor.rating} />
      <p className="text-green-700 font-bold text-xl mt-2 mb-2">₹{tutor.feePerHour}/hr</p>
      <button
        className="mb-2 w-full rounded-lg py-2 text-white font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 shadow-md transition-colors"
        onClick={() => navigate(`/tutors/${tutor._id}`)}
      >
        Book Now
      </button>
      <button
        className="w-full rounded-lg py-2 text-white font-bold bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 shadow-md transition-colors"
        onClick={() => navigate(`/tutors/${tutor._id}`)}
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

  const filteredTutors = tutors.filter(
    (tutor) =>
      (subjectFilter === "" ||
        subjectFilter === "all" ||
        tutor.subjects.some((s) => s.toLowerCase().includes(subjectFilter))) &&
      (locationFilter === "" || tutor.city.toLowerCase().includes(locationFilter))
  );

  const tutorsForSwiper = filteredTutors.slice(0, 6);
  const tutorsForMore = filteredTutors.slice(6, 6 + page * TUTORS_PER_PAGE);

  if (loading)
    return <div className="py-20 text-center font-semibold text-xl text-indigo-700 animate-pulse">Loading tutors...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-10 max-w-7xl mx-auto flex flex-col items-center">
      <header className="mb-14 text-center max-w-3xl">
        <h1 className="mb-6 text-4xl font-extrabold text-indigo-900 leading-tight">
          Find Top Tutors Near You
        </h1>
        <p className="text-md md:text-lg text-indigo-700 max-w-xl mx-auto">
          Search, view profiles, and book sessions or free trials with trusted teachers. Enjoy best offline learning experience, guaranteed!
        </p>
      </header>
      <Swiper
        slidesPerView={1}
        spaceBetween={30}
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
          <SwiperSlide key={tutor._id} className="flex justify-center">
            <TutorCard tutor={tutor} />
          </SwiperSlide>
        ))}
      </Swiper>
      {!showMoreList && filteredTutors.length > 6 && (
        <button
          className="mb-10 px-8 py-3 rounded-2xl bg-indigo-700 hover:bg-blue-600 transition-colors text-white font-bold text-lg shadow-xl"
          onClick={() => setShowMoreList(true)}
        >
          Show More Tutors
        </button>
      )}
      {showMoreList && (
        <>
          <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-10">
            {tutorsForMore.map((tutor) => (
              <TutorCard key={tutor._id} tutor={tutor} />
            ))}
          </div>
          {6 + page * TUTORS_PER_PAGE < filteredTutors.length && (
            <button
              className="mb-12 px-7 py-2 rounded-xl bg-indigo-700 hover:bg-blue-700 text-white font-semibold shadow-lg transition-colors"
              onClick={() => setPage((p) => p + 1)}
            >
              Load More Tutors
            </button>
          )}
        </>
      )}
      <section className="w-full max-w-3xl p-10 rounded-2xl bg-indigo-900 shadow-lg text-white select-none text-center mt-10">
        <h2 className="text-3xl font-extrabold mb-5">Why Choose TutorMitra?</h2>
        <ul className="list-disc list-inside space-y-2 text-md text-left max-w-xl mx-auto">
          <li><span className="text-yellow-400">Verified & Qualified Tutors</span> — Only trusted teachers onboard.</li>
          <li><span className="text-blue-300">Transparent Pricing</span> — ₹500/hr, no hidden charges.</li>
          <li><span className="text-green-300">Book Instantly</span> — Super-fast profile navigation and booking flow.</li>
          <li><span className="text-indigo-300">Personalized Support</span> — Trial sessions and custom learning help.</li>
          <li><span className="text-pink-200">Community Feedback</span> — Real student ratings for confidence.</li>
        </ul>
      </section>
    </div>
  );
}
