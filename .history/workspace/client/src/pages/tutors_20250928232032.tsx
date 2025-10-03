import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

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

const PAGE_SIZE = 6;

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
          strokeWidth="1.5"
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.124-6.55L.49 6.91 6.561-.954 10 0l2.949 5.957 6.561.954-4.756 4.63 1.124 6.55z" />
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
    <article className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center transition-all transform hover:scale-105 hover:shadow-2xl duration-300">
      <div className="relative w-36 h-36 mb-6">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-200 via-blue-300 to-indigo-400 opacity-40 blur-lg"></div>
        <img
          src={getTutorAvatar(tutor.profileImage, tutor.name)}
          alt={tutor.name}
          className="relative object-cover w-36 h-36 rounded-3xl border-4 border-white shadow-md"
        />
      </div>

      <h3 className="text-2xl font-semibold text-indigo-900 mb-1">{tutor.name}</h3>
      <p className="text-indigo-600 mb-2">{tutor.city}</p>

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {tutor.subjects.map((subj) => (
          <span
            key={subj}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold select-none"
          >
            {subj}
          </span>
        ))}
      </div>

      {tutor.description && (
        <p className="mb-4 text-gray-700 text-sm">
          {tutor.description.length > 100
            ? tutor.description.slice(0, 100) + "..."
            : tutor.description}
        </p>
      )}

      <div className="flex items-center justify-center mb-3">
        <span
          className={`w-4 h-4 rounded-full mr-2 ${
            available ? "bg-green-600" : "bg-gray-400"
          }`}
        />
        <span className={available ? "text-green-700 font-semibold" : "text-gray-500"}>
          {available ? "Available Now" : "Currently Unavailable"}
        </span>
      </div>

      <div className="flex items-center justify-center mb-4 space-x-2">
        <StarRating rating={tutor.rating} />
        <span className="text-gray-600 font-medium">{tutor.rating.toFixed(1)}</span>
      </div>

      <div className="text-2xl font-bold text-green-700 mb-6">₹{tutor.feePerHour}</div>

      <button
        disabled={!available}
        onClick={() => navigate(`/booking/${tutor._id}`)}
        className={`w-full py-3 font-semibold rounded-lg text-white transition-colors duration-300 ${
          available ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        Book Now
      </button>

      <button
        disabled={!available}
        onClick={() => navigate(`/booking/${tutor._id}?type=trial`)}
        className={`w-full py-3 mt-3 font-semibold rounded-lg text-white transition-colors duration-300 ${
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
  const [displayedTutors, setDisplayedTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/tutors")
      .then((res) => {
        const allTutors = Array.isArray(res.data.tutors) ? res.data.tutors : [];
        setTutors(allTutors);
        setLoading(false);
        setDisplayedTutors(allTutors.slice(0, PAGE_SIZE));
        setPage(1);
      })
      .catch(() => setLoading(false));
  }, []);

  // filtered by queries
  const filteredTutors = tutors.filter((tutor) => {
    const subjectMatch =
      !subjectQuery ||
      subjectQuery === "all" ||
      (tutor.subjects && tutor.subjects.some((s) => s.toLowerCase().includes(subjectQuery)));

    const locationMatch = !locationQuery || (tutor.city || "").toLowerCase().includes(locationQuery);

    return subjectMatch && locationMatch;
  });

  function loadMore() {
    const nextPage = page + 1;
    const nextTutors = filteredTutors.slice(page * PAGE_SIZE, nextPage * PAGE_SIZE);
    setDisplayedTutors((old) => [...old, ...nextTutors]);
    setPage(nextPage);
  }

  if (loading)
    return <div className="py-20 text-center font-semibold text-xl">Loading tutors...</div>;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-indigo-50 via-blue-50 to-white p-8 max-w-7xl mx-auto flex flex-col items-center">
      {/* Headline and tagline */}
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-indigo-900 tracking-wide drop-shadow-lg mb-3">
          Your Personalized Offline Tutor Finder
        </h1>
        <p className="text-indigo-700 text-lg max-w-lg mx-auto select-none">
          Connect with skilled tutors from your city. Flexible payment options, easy booking, and trial classes make learning simple & comfortable.
        </p>
      </header>

      {/* Tutors grid */}
      {displayedTutors.length === 0 ? (
        <p className="text-center font-semibold text-gray-500 text-lg">No tutors available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14 w-full">
          {displayedTutors.map((tutor) => (
            <TutorCard key={tutor._id} tutor={tutor} />
          ))}
        </div>
      )}

      {/* Load more */}
      {displayedTutors.length < filteredTutors.length && (
        <button
          onClick={loadMore}
          className="mt-12 px-12 py-3 bg-indigo-700 hover:bg-indigo-800 text-white text-lg rounded-xl font-semibold transition-colors duration-300 shadow-lg"
        >
          More Tutors
        </button>
      )}

      {/* App mission and benefits */}
      <section className="mt-24 bg-indigo-900 text-white p-12 rounded-3xl max-w-5xl text-center select-none shadow-lg">
        <h2 className="text-3xl font-semibold mb-6">Why Choose TutorMitra?</h2>
        <p className="max-w-3xl mx-auto mb-6 text-lg leading-relaxed">
          With TutorMitra, finding the right offline tutor is now easy and trustworthy. We focus on personalized learning experiences with verified experts, transparent pricing, and hassle-free booking.
        </p>
        <ul className="list-disc list-inside text-left max-w-md mx-auto space-y-2 text-md font-medium">
          <li>Personalized one-on-one coaching with expert tutors</li>
          <li>Flexible payment and trial class options</li>
          <li>Transparent pricing with no hidden charges</li>
          <li>Easy communication and booking process</li>
          <li>Trusted by thousands of students across India</li>
        </ul>
      </section>
    </div>
  );
}
