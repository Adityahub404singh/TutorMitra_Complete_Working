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
    )}&background=E0E7FF&color=3730A3&rounded=true&size=144`;
  if (profileImage.startsWith("/uploads/")) return `http://localhost:3000${profileImage}`;
  if (profileImage.startsWith("http")) return profileImage;
  return `http://localhost:3000/uploads/${profileImage}`;
}

function TutorCard({ tutor }: { tutor: Tutor }) {
  const navigate = useNavigate();
  const available = isTutorAvailable(tutor);

  return (
    <article className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-center w-36 h-36 mb-6 bg-indigo-100 rounded-[36%] shadow-lg overflow-hidden border-4 border-white relative">
        <img
          src={getTutorAvatar(tutor.profileImage, tutor.name)}
          alt={tutor.name}
          className="object-cover w-full h-full"
          style={{ borderRadius: "36%" }}
        />
      </div>
      <div className="font-semibold text-2xl mb-2">{tutor.name}</div>
      <div className="flex flex-wrap justify-center gap-2 mb-4 text-sm">
        {tutor.subjects.map((subject) => (
          <span
            key={subject}
            className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs sm:text-sm"
          >
            {subject}
          </span>
        ))}
      </div>
      <div className="text-base text-gray-700">{tutor.city}</div>
      <div className="flex items-center justify-center mt-3 text-base">
        <span
          className={`w-3 h-3 rounded-full mr-3 ${
            available ? "bg-green-600" : "bg-gray-400"
          }`}
        ></span>
        <span className={available ? "text-green-800" : "text-gray-500"}>
          {available ? "Available" : "Unavailable"}
        </span>
      </div>
      <div className="flex items-center justify-center mt-4">
        <StarRating rating={tutor.rating} />
        <span className="ml-3 text-gray-700 text-base">
          {tutor.rating.toFixed(1)}
        </span>
      </div>
      <div className="mt-6 font-bold text-green-800 text-2xl">₹{tutor.feePerHour}</div>
      <button
        disabled={!available}
        onClick={() => navigate(`/booking/${tutor._id}`)}
        className={`w-full py-3 px-6 rounded-xl font-semibold mt-4 transition-transform duration-200 ease-in-out ${
          available
            ? "bg-yellow-600 text-white hover:bg-yellow-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Book Now
      </button>
      <button
        disabled={!available}
        onClick={() => navigate(`/booking/${tutor._id}?type=trial`)}
        className={`w-full py-3 px-6 rounded-xl font-semibold mt-2 transition-transform duration-200 ease-in-out ${
          available
            ? "bg-blue-800 text-white hover:bg-blue-900"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
        // initial load first page
        setDisplayedTutors(allTutors.slice(0, PAGE_SIZE));
        setPage(1);
      })
      .catch(() => setLoading(false));
  }, []);

  // filter tutors by query params
  const filteredTutors = tutors.filter((tutor) => {
    const subjectMatch =
      !subjectQuery ||
      subjectQuery === "all" ||
      (tutor.subjects && tutor.subjects.some((s) => s.toLowerCase().includes(subjectQuery)));
    const locationMatch = !locationQuery || (tutor.city || "").toLowerCase().includes(locationQuery);
    return subjectMatch && locationMatch;
  });

  // Load more tutors below list on button click
  function loadMoreTutors() {
    const nextPage = page + 1;
    const start = (nextPage - 1) * PAGE_SIZE;
    const newTutors = filteredTutors.slice(start, start + PAGE_SIZE);
    setDisplayedTutors((prev) => [...prev, ...newTutors]);
    setPage(nextPage);
  }

  if (loading) return <div className="py-20 text-center font-semibold text-xl">Loading tutors...</div>;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-tr from-indigo-50 to-white p-6 max-w-7xl mx-auto flex flex-col items-center">
      {/* Page heading */}
      <h1 className="text-5xl font-extrabold text-indigo-900 my-10 text-center">
        Find Your Perfect Tutor
      </h1>
      {/* Page description */}
      <p className="mb-8 max-w-3xl text-center text-lg text-gray-700">
        Welcome to TutorMitra, your trusted platform to find expert offline tutors with personalized 
        coaching and easy booking options. Select your subject and location to discover the best tutors 
        near you and start learning today!
      </p>

      {/* Tutor cards grid */}
      {displayedTutors.length === 0 ? (
        <p className="text-center text-gray-500 font-semibold text-lg">No tutors found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 w-full">
          {displayedTutors.map((tutor) => (
            <TutorCard key={tutor._id} tutor={tutor} />
          ))}
        </div>
      )}

      {/* Load more button */}
      {displayedTutors.length < filteredTutors.length && (
        <button
          onClick={loadMoreTutors}
          className="mt-12 mb-8 rounded-lg bg-indigo-700 text-white px-8 py-3 text-lg font-semibold hover:bg-indigo-800 transition"
        >
          Load More Tutors
        </button>
      )}

      {/* App description or footer */}
      <footer className="mt-auto bg-indigo-900 p-10 rounded-t-3xl w-full text-indigo-100">
        <h2 className="text-3xl font-semibold mb-4">About TutorMitra</h2>
        <p className="max-w-3xl">
          TutorMitra connects students and expert offline tutors across India, simplifying personalized learning 
          with user-friendly booking and flexible trial options. Whether you want to master academics or develop 
          new skills, TutorMitra is your go-to education partner.
        </p>
      </footer>
    </div>
  );
}
