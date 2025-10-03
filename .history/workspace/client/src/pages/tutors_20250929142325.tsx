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
        className="w-6 h-6"
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
        className="w-36 h-36 md:w-40 md:h-40 object-cover rounded-3xl border-4 border-white shadow-md mx-auto"
      />
    );
  }
  const firstWord = name.split(" ")[0] || "T";
  return (
    <div className="w-36 h-36 md:w-40 md:h-40 rounded-3xl border-4 border-white shadow-md bg-indigo-500 text-white text-5xl font-extrabold select-none flex justify-center items-center mx-auto">
      {firstWord.charAt(0).toUpperCase()}
    </div>
  );
};

const TutorCard = ({ tutor }: { tutor: Tutor }) => {
  const navigate = useNavigate();
  const available = isTutorAvailable(tutor);
  // Button click par profile par le jao, booking ke liye yaha nahi!
  return (
    <article className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transform transition-transform duration-300 max-w-xs mx-auto">
      <div className="relative mb-6 cursor-pointer" onClick={() => navigate(`/tutors/${tutor._id}`)}>
        <Avatar profileImage={tutor.profileImage} name={tutor.name} />
      </div>
      <h3 className="text-2xl font-bold text-indigo-900 cursor-pointer" onClick={() => navigate(`/tutors/${tutor._id}`)}>
        {tutor.name}
      </h3>
      <p className="text-indigo-700 my-1">{tutor.city}</p>
      <div className="flex flex-wrap justify-center gap-3 my-3">
        {tutor.subjects.map((s) => (
          <span key={s} className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-semibold select-none">{s}</span>
        ))}
      </div>
      {tutor.description && (
        <p className="text-gray-700 mb-3 max-w-[20rem] text-sm">
          {tutor.description.length > 100 ? tutor.description.slice(0, 100) + "..." : tutor.description}
        </p>
      )}
      <div className="flex items-center space-x-3 my-2">
        <div className={`w-4 h-4 rounded-full ${available ? "bg-green-600" : "bg-gray-400"}`}></div>
        <span className={available ? "text-green-700 font-semibold" : "text-gray-500"}>
          {available ? "Available Now" : "Unavailable"}
        </span>
      </div>
      <StarRating rating={tutor.rating} />
      <p className="text-green-800 font-extrabold text-2xl mt-3 mb-4">₹{tutor.feePerHour}</p>
      <button
        className="mb-3 w-full rounded-lg py-3 font-semibold text-white bg-yellow-500 hover:bg-yellow-600"
        onClick={() => navigate(`/tutors/${tutor._id}`)}
      >
        Book Now
      </button>
      <button
        className="w-full rounded-lg py-3 font-semibold text-white bg-indigo-700 hover:bg-indigo-800"
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
    return <div className="py-20 text-center font-semibold text-xl">Loading tutors...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-10 max-w-7xl mx-auto flex flex-col items-center">
      <header className="mb-16 text-center max-w-4xl">
        <h1 className="mb-6 text-5xl font-extrabold text-indigo-900 leading-tight">
          Discover Skilled Tutors Near You
        </h1>
        <p className="text-lg md:text-xl text-indigo-700 max-w-3xl mx-auto">
          TutorMitra app lets you find verified and experienced tutors for offline coaching in your city. Easily book your sessions, try 3-day trials, and learn better.
        </p>
      </header>

      {/* Swiper slider */}
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
        className="w-full mb-16"
      >
        {tutorsForSwiper.map((tutor) => (
          <SwiperSlide key={tutor._id} className="flex justify-center">
            <TutorCard tutor={tutor} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Show More toggle */}
      {!showMoreList && filteredTutors.length > 6 && (
        <button
          className="mb-16 px-10 py-4 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xl shadow-xl transition-colors"
          onClick={() => setShowMoreList(true)}
        >
          Show More Tutors
        </button>
      )}

      {/* Vertical list below after show more clicked */}
      {showMoreList && (
        <>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-7xl mb-10">
            {tutorsForMore.map((tutor) => (
              <TutorCard key={tutor._id} tutor={tutor} />
            ))}
          </div>

          {6 + page * TUTORS_PER_PAGE < filteredTutors.length && (
            <button
              className="mb-16 px-8 py-3 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white font-semibold shadow-lg transition-colors"
              onClick={() => setPage((p) => p + 1)}
            >
              Load More Tutors
            </button>
          )}
        </>
      )}

      {/* Attractive page info section */}
      <section className="w-full max-w-5xl p-12 rounded-3xl bg-indigo-900 shadow-lg text-white select-none text-center">
        <h2 className="text-4xl font-extrabold mb-6">Why TutorMitra is the Best Choice</h2>
        <p className="text-lg max-w-3xl mx-auto mb-8">
          With TutorMitra, you get access to trusted, verified, and experienced local tutors focused on giving high-quality offline coaching. Transparent pricing and easy booking help you learn without any hassle.
        </p>
        <ul className="max-w-3xl mx-auto text-left list-disc list-inside space-y-3 text-lg ">
          <li><strong>Experienced and Verified Tutors:</strong> Only trusted tutors with proven track records.</li>
          <li><strong>Transparent Pricing:</strong> No hidden fees or charges, what you see is what you pay.</li>
          <li><strong>Easy & Flexible Booking:</strong> Book sessions online and even try short 3-day trial classes.</li>
          <li><strong>Personalized Learning Support:</strong> Tutors tailor coaching for your unique learning needs.</li>
          <li><strong>Community Trust:</strong> Real feedback and ratings from students in your city.</li>
        </ul>
      </section>
    </div>
  );
}
