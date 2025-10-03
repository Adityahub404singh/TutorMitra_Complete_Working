import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// Tutor interface
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
  <div className="flex text-yellow-400 mx-auto">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className="w-4 h-4" fill={i < Math.round(rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 20 20">
        <path d="M10 15l-5.878 3.09 1.124-6.55L.49 6.91 6.561-.954 10 0l2.949 5.957 6.561.954-4.756 4.63 1.124 6.55" />
      </svg>
    ))}
    <span className="text-sm text-gray-700 ml-1">{rating.toFixed(1)}</span>
  </div>
);

function getAvatarUrl(profileImage?: string, name: string = "Tutor") {
  if (!profileImage)
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6666ff&color=fff&rounded=true&size=144`;
  if (profileImage.startsWith("/uploads/")) return `http://localhost:3000${profileImage}`;
  if (profileImage.startsWith("http")) return profileImage;
  return `http://localhost:3000/uploads/${profileImage}`;
}

const TutorCard = ({ tutor }: { tutor: Tutor }) => {
  const navigate = useNavigate();
  const available = isTutorAvailable(tutor);
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center hover:shadow-2xl group transition-all duration-300">
      <img
        src={getAvatarUrl(tutor.profileImage, tutor.name)}
        alt={tutor.name}
        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow mb-3 group-hover:scale-105 transition-all duration-300"
      />
      <h3 className="text-lg font-bold text-indigo-800">{tutor.name}</h3>
      <p className="text-indigo-500">{tutor.city}</p>
      <div className="flex flex-wrap gap-1 mt-2 mb-1 justify-center">
        {tutor.subjects.map((s) => (
          <span key={s} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">{s}</span>
        ))}
      </div>
      {tutor.description && (
        <p className="text-gray-600 mt-1 mb-1 text-xs max-w-xs">{tutor.description.slice(0, 60)}{tutor.description.length > 60 ? "..." : ""}</p>
      )}
      <div className="flex items-center gap-1 my-1">
        <span className={available ? "text-green-600 text-xs flex items-center" : "text-gray-500 text-xs flex items-center"}>
          <span className={`w-2 h-2 rounded-full mr-1 ${available ? "bg-green-500" : "bg-gray-400"}`}></span>
          {available ? "Available Now" : "Unavailable"}
        </span>
      </div>
      <StarRating rating={tutor.rating} />
      <div className="text-green-700 font-bold mt-1 mb-1">₹{tutor.feePerHour}</div>
      <button
        disabled={!available}
        className={`w-full py-1.5 rounded-md font-semibold text-white mb-1 transition-all duration-200 ${available ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-300 cursor-not-allowed"}`}
        onClick={() => available && navigate(`/booking/${tutor._id}`)}
      >
        Book Now
      </button>
      <button
        disabled={!available}
        className={`w-full py-1 rounded-md font-semibold text-white ${available ? "bg-indigo-700 hover:bg-indigo-800" : "bg-gray-300 cursor-not-allowed"}`}
        onClick={() => available && navigate(`/booking/${tutor._id}?type=trial`)}
      >
        Book 3-Day Trial
      </button>
    </div>
  );
};

const TUTORS_PER_PAGE = 6; // ya 9 bhi rakh sakte hain

export default function Tutors() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const subjectFilter = params.get("subject")?.toLowerCase() || "";
  const locationFilter = params.get("location")?.toLowerCase() || "";

  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

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

  // Pagination logic
  const totalShown = page * TUTORS_PER_PAGE;
  const tutorsToShow = filteredTutors.slice(0, totalShown);

  if (loading)
    return <div className="py-20 text-center font-semibold text-xl">Loading tutors...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-4 md:p-8 max-w-7xl mx-auto flex flex-col items-center">
      <header className="mb-8 md:mb-12 text-center max-w-3xl">
        <h1 className="mb-3 md:mb-4 text-3xl md:text-4xl font-extrabold text-indigo-900">
          Discover Skilled Tutors Near You
        </h1>
        <p className="mx-auto max-w-xl text-indigo-700">
          Find verified tutors in your city with easy booking & trial options.
        </p>
      </header>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {tutorsToShow.map((tutor) => (
          <TutorCard key={tutor._id} tutor={tutor} />
        ))}
      </div>
      {totalShown < filteredTutors.length && (
        <button
          className="mt-8 px-6 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-lg"
          onClick={() => setPage((p) => p + 1)}
        >
          Show More
        </button>
      )}
      {filteredTutors.length === 0 && (
        <div className="py-20 text-center text-lg text-gray-600 font-semibold">No tutors found.</div>
      )}
      <section className="mt-14 md:mt-20 w-full max-w-4xl rounded-3xl bg-indigo-900 p-8 md:p-10 text-center text-white shadow-lg select-none">
        <h2 className="mb-4 text-2xl md:text-3xl font-semibold">Why Choose TutorMitra?</h2>
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
