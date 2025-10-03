import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getAvatar(name) {
  let initials = "ST";
  if (name && name.trim()) {
    const words = name.trim().split(" ");
    initials = words.length === 1
      ? words[0][0].toUpperCase()
      : words[0][0].toUpperCase() + words[words.length - 1][0].toUpperCase();
  }
  return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=96&bold=true&rounded=true`;
}

export default function StudentHome() {
  const [tutors, setTutors] = useState([]);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTutors();
  }, [query, subject, sort]);

  async function fetchTutors() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/tutors`, {
        params: { search: query, subject, sort }
      });
      setTutors(res.data?.data ?? []);
    } catch {
      setError("Could not load tutors.");
      setTutors([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-bl from-blue-50 via-cyan-100 to-green-50">
      <header className="flex flex-col items-center py-12 bg-gradient-to-r from-indigo-200 to-teal-200 shadow-sm mb-4">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-tr from-indigo-700 to-emerald-500 text-transparent bg-clip-text mb-3 tracking-tight">
          Welcome, future achiever!
        </h1>
        <p className="text-lg text-gray-700 font-semibold mb-1">
          Find your perfect teacher—learn, chat, book instantly.
        </p>
        <p className="italic text-indigo-700 font-bold text-md">With TutorMitra Anything is Possible!</p>
      </header>

      {/* Search + Filter */}
      <section className="max-w-5xl mx-auto px-3 py-7 flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white/60 rounded-2xl shadow">
        <input
          placeholder="Search by tutor, subject..."
          className="flex-1 border px-5 py-3 rounded-full shadow outline-none text-lg focus:border-indigo-500 transition"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <select
          className="border rounded-full px-5 py-3 ml-0 md:ml-4 text-base focus:border-teal-500 outline-none"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        >
          <option value="all">All Subjects</option>
          <option value="maths">Maths</option>
          <option value="science">Science</option>
          <option value="english">English</option>
          {/* More subjects */}
        </select>
        <button
          className="inline-block font-bold rounded-full px-7 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg text-lg hover:scale-105 ml-0 md:ml-4 transition"
          onClick={() => setSort(sort === "recent" ? "popular" : "recent")}
        >
          {sort === "recent" ? "Recently Joined 👉" : "Most Popular 🔥"}
        </button>
      </section>

      {/* Tutors List */}
      <section className="mt-10 max-w-6xl mx-auto px-2 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {loading && (
          <div className="col-span-full text-center text-indigo-700 font-semibold text-xl animate-pulse py-9">Loading tutors...</div>
        )}
        {error && (
          <div className="col-span-full text-center text-rose-700 font-bold text-lg py-8">{error}</div>
        )}
        {!loading && tutors.length === 0 && !error && (
          <div className="col-span-full text-center text-gray-500 font-semibold text-lg py-8">
            No tutors found for your search.
          </div>
        )}
        {tutors.map(tutor => (
          <div key={tutor._id} className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-3xl shadow-xl border-2 border-indigo-700/10 hover:scale-105 transition duration-300 flex flex-col items-center p-7 relative cursor-pointer">
            <img src={getAvatar(tutor.name)} alt={tutor.name} className="w-20 h-20 rounded-full shadow-lg mb-2 border-4 border-white" />
            <div className="font-bold text-xl text-indigo-900">{tutor.name}</div>
            <div className="text-sm text-gray-600">{tutor.city ?? "City not set"}</div>

            {/* Location & Active Badge */}
            <div className="flex gap-2 mt-1">
              <span className="text-teal-700 px-3 py-1 rounded-full text-xs bg-teal-100 font-semibold">Near You</span>
              {tutor.isActive ? (
                <span className="text-green-700 px-3 py-1 rounded-full text-xs bg-green-100 font-semibold">Active Now</span>
              ) : (
                <span className="text-gray-500 px-3 py-1 rounded-full text-xs bg-gray-100 font-semibold">Offline</span>
              )}
            </div>

            {/* Subjects Tags */}
            <div className="flex flex-wrap gap-2 justify-center my-3">
              {tutor.subjects?.map((subj, i) => (
                <span key={i} className="bg-gradient-to-r from-indigo-200 via-blue-200 to-green-200 text-indigo-900 rounded-full px-3 py-1 text-xs font-bold">{subj}</span>
              ))}
            </div>

            {/* Police Verification */}
            <div className="flex items-center gap-1 text-xs font-bold">
              {tutor.policeVerified
                ? <span className="text-green-600">✔ Police Verified</span>
                : <span className="text-rose-700">✖ Not Police Verified</span>
              }
            </div>

            {/* View Profile Button */}
            <button
              className="mt-3 w-full py-3 rounded-full bg-gradient-to-r from-indigo-600 to-blue-400 text-white font-bold text-lg shadow hover:scale-105 hover:from-indigo-700 hover:to-blue-500 transition"
              onClick={e => { e.stopPropagation(); navigate(`/tutor-profile/${tutor._id}`); }}
            >
              View Profile
            </button>

            {/* Bottom Info */}
            <p className="text-xs text-gray-500 mt-2 text-center">Chat and booking available once you open the profile.<br /></p>
          </div>
        ))}
      </section>

      {/* Student Reviews */}
      <section className="max-w-3xl mx-auto my-16 bg-gradient-to-r from-white via-indigo-50 to-blue-50 rounded-xl shadow-xl p-9 text-center flex flex-col items-center">
        <h2 className="text-3xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-green-600">Latest Student Reviews</h2>
        <div className="bg-white/80 w-full rounded shadow-md py-6 mt-1">
          {/* Replace with reviews map */}
          <div className="text-rose-700 font-semibold">Could not load student reviews.</div>
        </div>
      </section>

    </div>
  );
}
