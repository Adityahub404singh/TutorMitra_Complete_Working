import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Types
interface Tutor {
  _id: string;
  userId: {
    _id: string;
    name: string;
    city?: string;
    profileImage?: string;
    bio?: string;
    experience?: number;
  };
  subjects: any;
  policeVerified: boolean;
  createdAt: string;
  city?: string;
  distance?: number;
}

interface Review {
  _id: string;
  studentId: { _id: string; name: string };
  rating: number;
  comment: string;
  createdAt: string;
}

// Utilities
function getCurrentUser() {
  try {
    const str = localStorage.getItem("tm_user");
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
}

function getAuthToken() {
  return localStorage.getItem("tm_token") || "";
}

function parseSubjects(subjects: any): string[] {
  if (!subjects) return [];
  if (typeof subjects === "string") {
    try {
      let clean = subjects.replace(/\\+/g, "");
      if (clean[0] !== "[" && clean[clean.length - 1] !== "]")
        clean = "[" + clean + "]";
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed)) {
        return parsed.map((s: any) => String(s).replace(/['"]+/g, "").trim()).filter(Boolean);
      }
    } catch {}
    return subjects.replace(/[\[\]'"]+/g, "").split(",").map((s: string) => s.trim()).filter(Boolean);
  }
  if (Array.isArray(subjects)) {
    return subjects.flatMap((s) =>
      typeof s === "string" ? parseSubjects(s) : String(s)
    );
  }
  return [String(subjects)];
}

function formatDate(dateStr: string) {
  try {
    const dt = new Date(dateStr);
    return isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString();
  } catch {
    return "—";
  }
}

function getInitialsAvatar(name?: string, size = 92) {
  if (!name)
    return `https://ui-avatars.com/api/?name=TM&background=4fd1c5&color=fff&size=${size}`;
  const words = name.trim().split(" ");
  const initials = (words[0]?.[0] || "") + (words[1]?.[0] || words[0][1] || "");
  return `https://ui-avatars.com/api/?name=${initials.toUpperCase()}&background=0099E6&color=fff&size=${size}`;
}

interface StarRatingProps {
  rating: number;
}

function StarRating({ rating }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <span className="flex items-center gap-0.5 text-yellow-400">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={"full-" + i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.124-6.55L.49 6.91l6.561-.954L10 0l2.949 5.957 6.561.954-4.756 4.63 1.124 6.55z" />
        </svg>
      ))}

      {hasHalfStar && (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <defs>
            <linearGradient id="half-grad">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#fff" />
            </linearGradient>
          </defs>
          <path fill="url(#half-grad)" d="M10 15l-5.878 3.09 1.124-6.55L.49 6.91l6.561-.954L10 0l2.949 5.957 6.561.954-4.756 4.63 1.124 6.55z" />
        </svg>
      )}

      {[...Array(emptyStars)].map((_, i) => (
        <svg key={"empty-" + i} className="w-5 h-5" fill="none" stroke="gray" strokeWidth="2" viewBox="0 0 20 20">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 15l-5.878 3.09 1.124-6.55L.49 6.91l6.561-.954L10 0l2.949 5.957 6.561.954-4.756 4.63 1.124 6.55z" />
        </svg>
      ))}
    </span>
  );
}

export default function StudentHome() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [sort, setSort] = useState<"recent" | "name" | "distance">("recent");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const tutorsPerPage = 6;
  const navigate = useNavigate();

  // Guard access for students only
  const user = getCurrentUser();
  if (!user || user.role !== "student") {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center text-red-600 font-semibold" role="alert">
        Access denied.
        <div className="mt-4">
          <button onClick={() => navigate("/login")} className="px-5 py-3 bg-yellow-400 text-white rounded-lg shadow font-bold">Go to Login</button>
        </div>
      </div>
    );
  }

  // Fetch tutors list
  useEffect(() => {
    setLoading(true);
    setError("");
    axios
      .get("http://localhost:3000/api/tutors", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      })
      .then((res) => setTutors(Array.isArray(res.data.tutors) ? res.data.tutors : []))
      .catch(() => setError("Could not load tutors."))
      .finally(() => setLoading(false));
  }, []);

  // Fetch reviews list
  useEffect(() => {
    setReviewLoading(true);
    setReviewError("");
    axios
      .get("http://localhost:3000/api/reviews", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      })
      .then((res) => setReviews(Array.isArray(res.data.reviews) ? res.data.reviews : []))
      .catch(() => setReviewError("Could not load student reviews."))
      .finally(() => setReviewLoading(false));
  }, []);

  // Subject options 
  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    tutors.forEach((t) => parseSubjects(t.subjects).forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [tutors]);

  // Filter tutors list
  const filteredTutors = useMemo(() => {
    let result = tutors;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.userId.name.toLowerCase().includes(q) ||
          parseSubjects(t.subjects).some((s) => s.toLowerCase().includes(q))
      );
    }
    if (subject) {
      result = result.filter((t) =>
        parseSubjects(t.subjects).some((s) => s.toLowerCase() === subject.toLowerCase())
      );
    }
    switch (sort) {
      case "distance":
        // Demo sorting, pushes tutors in 'delhi' to top
        result = [...result].sort((a, b) => (a.city === "delhi" ? -1 : 0) - (b.city === "delhi" ? -1 : 0));
        break;
      case "name":
        result = [...result].sort((a, b) => a.userId.name.localeCompare(b.userId.name));
        break;
      case "recent":
      default:
        result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    return result;
  }, [tutors, search, subject, sort]);

  // Pagination calc
  const totalPages = Math.ceil(filteredTutors.length / tutorsPerPage);
  const displayedTutors = filteredTutors.slice((page - 1) * tutorsPerPage, page * tutorsPerPage);

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 pb-10 space-y-10 bg-gradient-to-t from-cyan-50 via-blue-50 to-white min-h-screen">
      {/* Banner */}
      <section className="mb-6 rounded-xl bg-gradient-to-br from-sky-300 via-cyan-200 to-emerald-100 p-7 shadow-lg border border-cyan-200">
        <h1 className="text-4xl md:text-5xl font-black text-blue-900 mb-2 tracking-tight">
          Find the Best Teacher Near You
        </h1>
        <p className="text-lg md:text-xl text-blue-900 font-semibold">
          Search tutors by subject, connect, chat & book your best-fit teacher in seconds.
        </p>
      </section>

      {/* Filters */}
      <section className="flex flex-wrap gap-3 justify-between items-center bg-gradient-to-r from-blue-200 to-cyan-200 rounded-lg shadow-lg p-4 mb-8 border border-cyan-300">
        <input
          type="text"
          className="px-4 py-2 rounded border border-cyan-300 shadow-sm min-w-[180px]"
          placeholder="Search by tutor or subject..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          aria-label="Search tutors"
        />
        <select
          className="px-3 py-2 rounded border border-cyan-300 shadow-sm"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by subject"
        >
          <option value="">All Subjects</option>
          {allSubjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="px-3 py-2 rounded border border-cyan-300 shadow-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value as "recent" | "name" | "distance")}
          aria-label="Sort tutors"
        >
          <option value="recent">Recently Joined</option>
          <option value="name">Name (A-Z)</option>
          <option value="distance">Near Me (Demo)</option>
        </select>
      </section>

      {/* Tutor Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse py-10">
          {[...Array(tutorsPerPage)].map((_, i) => (
            <div key={i} className="h-52 rounded-xl bg-slate-200"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-700 font-semibold text-lg py-20">{error}</div>
      ) : displayedTutors.length === 0 ? (
        <div className="text-center text-gray-500 font-semibold text-xl py-20">No tutors found matching your filters.</div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {displayedTutors.map((tutor) => (
            <div
              key={tutor._id}
              className="relative rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-md border border-cyan-300 hover:shadow-lg transition ease-in-out duration-200"
            >
              <div className="flex gap-4 items-center mb-2">
                <img
                  src={tutor.userId.profileImage || getInitialsAvatar(tutor.userId.name, 80)}
                  alt={`Profile of ${tutor.userId.name}`}
                  className="rounded-full w-20 h-20 object-cover border border-cyan-300"
                />
                <div>
                  <div className="text-xl font-semibold capitalize">
                    {tutor.userId.name}
                  </div>
                  <div className="text-sm text-cyan-800">
                    {tutor.userId.city || tutor.city || "Unknown City"}
                    <span className="ml-2 bg-cyan-300 text-cyan-900 px-2 py-0.5 rounded-full shadow text-xs font-medium">Near You</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-sm mb-2">
                {parseSubjects(tutor.subjects).slice(0, 5).map((subj, i) => (
                  <span
                    key={i}
                    className="bg-cyan-200 text-cyan-800 px-2 py-0.5 rounded-full border border-cyan-300 font-medium truncate max-w-full"
                    title={subj}
                  >
                    {subj}
                  </span>
                ))}
                {parseSubjects(tutor.subjects).length > 5 && (
                  <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                    +{parseSubjects(tutor.subjects).length - 5} more
                  </span>
                )}
              </div>
              {tutor.userId.bio && <p className="italic text-sm text-cyan-700 line-clamp-2 mb-1">{tutor.userId.bio}</p>}
              <div className="flex justify-between items-center text-xs text-cyan-900 mb-4">
                {tutor.policeVerified ? (
                  <span className="text-green-600 font-semibold">✅ Police Verified</span>
                ) : (
                  <span className="text-red-600 font-semibold">❌ Not Police Verified</span>
                )}
                <span>{formatDate(tutor.createdAt)}</span>
              </div>
              <button
                className="bg-blue-600 text-white rounded-lg py-2 w-full font-semibold shadow hover:bg-blue-700 transition"
                onClick={() => navigate(`/tutors/${tutor._id}`)}
              >
                View Profile
              </button>
              <p className="text-xs italic text-gray-600 mt-2 max-w-sm">
                Chat and booking are available once you open the profile page.
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            className="px-3 py-1 rounded bg-cyan-300 text-cyan-900 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            aria-label="Previous page"
          >
            Prev
          </button>
          <span className="font-semibold text-lg">{page} / {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-cyan-300 text-cyan-900 disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}

      {/* Reviews Section */}
      <section className="max-w-3xl mx-auto mt-12 p-6 rounded-xl shadow-lg border border-cyan-200 bg-white">
        <h2 className="text-xl font-bold text-cyan-800 mb-4">Latest Student Reviews</h2>
        {reviewLoading ? (
          <p className="text-gray-500 italic">Loading reviews...</p>
        ) : reviewError ? (
          <p className="text-red-600 font-semibold">{reviewError}</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-600 font-semibold">No student reviews available yet.</p>
        ) : (
          reviews.slice(0, 4).map(({ _id, studentId, rating, comment, createdAt }) => (
            <article
              key={_id}
              className="border-b border-cyan-200 last:border-none py-2"
            >
              <div className="flex items-center gap-2 text-cyan-800 mb-1">
                <span className="font-semibold">{studentId.name}</span>
                <StarRating rating={rating} />
                <time className="text-xs text-cyan-500">{formatDate(createdAt)}</time>
              </div>
              <p className="italic text-gray-700">&ldquo;{comment}&rdquo;</p>
            </article>
          ))
        )}
        {reviews.length > 4 && (
          <div className="text-right mt-4">
            <button
              onClick={() => navigate("/reviews")}
              className="text-cyan-800 underline hover:text-cyan-900 font-semibold text-sm"
              aria-label="View all reviews"
            >
              View all reviews &rarr;
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
