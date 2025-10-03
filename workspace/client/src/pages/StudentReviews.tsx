import React, { useEffect, useState } from "react";
import axios from "axios";

interface Review {
  _id: string;
  tutorId: string;
  studentId: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center space-x-0.5 text-yellow-400" aria-label={`Rating: ${rating} out of 5`}>
      {[...Array(fullStars)].map((_, i) => (
        <svg key={"full" + i} xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M10 15l-5.878 3.09 1.124-6.55L.49 6.91l6.561-.954L10 0l2.949 5.957 6.561.954-4.756 4.63 1.124 6.55z" />
        </svg>
      ))}
      {halfStar && (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current" viewBox="0 0 20 20" aria-hidden="true">
          <defs>
            <linearGradient id="halfGradient">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#halfGradient)" d="M10 15l-5.878 3.09 1.124-6.55L.49 6.91l6.561-.954L10 0l2.949 5.957 6.561.954-4.756 4.63 1.124 6.55z" />
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={"empty" + i} xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 15l-5.878 3.09 1.124-6.55L.49 6.91l6.561-.954L10 0l2.949 5.957 6.561.954-4.756 4.63 1.124 6.55z" />
        </svg>
      ))}
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("tm_token");
        if (!token) throw new Error("No auth token found");

        const response = await axios.get("http://localhost:3000/api/reviews", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(response.data.reviews)) {
          setReviews(response.data.reviews);
        } else {
          setReviews([]);
          setError("Invalid response from server");
        }
      } catch (err) {
        setError("Failed to load reviews.");
        console.error("Error loading reviews: ", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  if (loading) return <div className="text-center p-6">Loading reviews...</div>;
  if (error) return <div className="text-center p-6 text-red-600">{error}</div>;
  if (reviews.length === 0) return <p className="text-center p-6">No reviews yet.</p>;

  return (
    <section className="max-w-3xl mx-auto p-6 space-y-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Student Reviews</h1>
      {reviews.map(({ _id, studentId, rating, comment, createdAt }) => (
        <article key={_id} className="p-4 rounded-lg shadow-sm border border-gray-200 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{studentId?.name || "Unknown Student"}</h2>
            <StarRating rating={rating} />
          </div>
          <p className="text-gray-700 italic">"{comment}"</p>
          <time className="text-sm text-gray-500">{new Date(createdAt).toLocaleDateString()}</time>
        </article>
      ))}
    </section>
  );
}
