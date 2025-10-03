import React, { useState, useEffect } from "react";
import http from "../api/http";

interface Review {
  _id: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
}

interface RatingsReviewsProps {
  tutorId: string;
}

export default function RatingsReviews({ tutorId }: RatingsReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await http.get(`/reviews/tutor/${tutorId}`);
        setReviews(res.data.reviews || []);
      } catch (e) {
        console.error("Failed to load reviews", e);
      }
    })();
  }, [tutorId]);

  const submitReview = async () => {
    if (newRating === 0) {
      alert("Please select a rating");
      return;
    }
    setLoading(true);
    try {
      await http.post("/reviews", {
        tutorId,
        rating: newRating,
        comment: newComment,
      });
      setNewRating(0);
      setNewComment("");
      // Reload reviews
      const res = await http.get(`/reviews/tutor/${tutorId}`);
      setReviews(res.data.reviews || []);
    } catch (e) {
      alert("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded-2xl shadow-smooth space-y-6">
      <h2 className="text-2xl font-semibold">Ratings & Reviews</h2>

      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="p-4 border rounded shadow-sm">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{r.studentName}</span>
                <span className="text-yellow-500">{`⭐`.repeat(r.rating)}</span>
              </div>
              <p className="mt-2">{r.comment}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(r.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      <div className="pt-6 border-t space-y-4">
        <h3 className="font-semibold">Add Your Review</h3>
        <select
          value={newRating}
          onChange={(e) => setNewRating(Number(e.target.value))}
          className="p-2 border rounded w-24"
        >
          <option value={0}>Select Rating</option>
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>
              {r} Star{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={4}
          placeholder="Write your review..."
          className="w-full p-3 border rounded"
        />
        <button
          onClick={submitReview}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-indigo-800"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}
