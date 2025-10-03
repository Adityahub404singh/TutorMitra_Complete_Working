import React, { useState, useEffect } from "react";
import axios from "axios";

const PAGE_SIZE = 6;

interface Tutor {
  _id: string;
  name: string;
  subjects: string[];
  city: string;
  rating: number;
  feePerHour: number;
  profileImage?: string;
  description?: string;
}

function TutorAvatar({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-36 h-36 relative flex items-center justify-center mb-4">
      <div className="absolute w-full h-full bg-gradient-to-tr rounded-[40%] from-blue-200 to-indigo-200 shadow-lg blur-md"></div>
      <img
        src={src}
        alt={alt}
        className="object-cover w-32 h-32 z-10 rounded-[35%] border-4 border-indigo-100 shadow-xl"
        style={{ borderRadius: "35%" }}
      />
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < Math.round(rating) ? "text-yellow-500" : "text-gray-300"}>★</span>
      ))}
      <span className="ml-2 font-bold text-gray-800">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function Tutors() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    axios.get("http://localhost:3000/api/tutors")
      .then((res) => {
        setTutors(Array.isArray(res.data.tutors) ? res.data.tutors : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const paginatedTutors = tutors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(tutors.length / PAGE_SIZE);

  if (loading) return <div className="py-20 text-center font-semibold text-xl">Loading tutors...</div>;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-tr from-blue-100 via-indigo-50 to-white p-6 max-w-7xl mx-auto flex flex-col items-center">
      <h1 className="text-5xl font-extrabold text-indigo-900 mt-12 mb-8 text-center animate-fade-in">Find Your Perfect Tutor</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 w-full">
        {paginatedTutors.length === 0 ? (
          <p className="text-center text-gray-500 font-semibold text-lg">No tutors found.</p>
        ) : (
          paginatedTutors.map((tutor) => (
            <article
              key={tutor._id}
              className="bg-white rounded-3xl shadow-[0_8px_32px_rgba(22,22,110,0.12)] p-8 flex flex-col items-center text-center border-2 border-blue-50 hover:scale-105 transition-all duration-300"
            >
              <TutorAvatar src={tutor.profileImage || "https://ui-avatars.com/api/?name=" + encodeURIComponent(tutor.name)} alt={tutor.name} />
              <div className="font-bold text-2xl mb-1">{tutor.name}</div>
              <div className="text-indigo-600 mb-1">{tutor.city}</div>
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                {tutor.subjects.map((subject, idx) => (
                  <span key={idx} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-xl text-xs font-semibold">{subject}</span>
                ))}
              </div>
              <div className="my-1">{tutor.description || "No biography provided by this tutor yet."}</div>
              <StarRating rating={tutor.rating || 0} />

              <div className="mt-5 font-bold text-green-700 text-xl">₹{tutor.feePerHour}</div>
              <button className="w-full py-3 px-6 rounded-xl font-semibold mt-3 bg-indigo-600 text-white hover:bg-indigo-700 transition-transform duration-200 active:scale-95 focus:ring-4 focus:ring-indigo-300">Book Now</button>
              <button className="w-full py-3 px-6 rounded-xl font-semibold mt-2 bg-yellow-500 text-white hover:bg-yellow-600 transition duration-200">Book 3-Day Trial</button>
            </article>
          ))
        )}
      </div>
      <div className="flex justify-center items-center gap-6 mt-14 mb-8">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className={`text-lg font-semibold px-6 py-3 rounded-lg ${page === 1 ? "bg-gray-200 cursor-not-allowed" : "bg-indigo-700 text-white hover:bg-indigo-800"}`}
        >
          Previous
        </button>
        <span className="text-xl font-bold text-indigo-900">Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className={`text-lg font-semibold px-6 py-3 rounded-lg ${page === totalPages ? "bg-gray-200 cursor-not-allowed" : "bg-indigo-700 text-white hover:bg-indigo-800"}`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
