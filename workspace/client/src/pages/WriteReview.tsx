import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function WriteReview() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (rating === 0) {
      setError("Please provide a rating.");
      return;
    }
    if (!reviewText.trim()) {
      setError("Please write your review.");
      return;
    }

    setError("");
    // TODO: send review to backend for bookingId

    alert("Thank you for your review!");
    navigate("/my-bookings");
  }

  return (
    <main className="max-w-md mx-auto p-6 bg-white rounded shadow mt-12">
      <h1 className="text-2xl font-bold mb-6">Write a Review</h1>
      <p className="mb-4">Booking ID: <strong>{bookingId}</strong></p>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Rating:</label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              onClick={() => setRating(star)}
              className={`text-3xl cursor-pointer ${
                rating >= star ? "text-yellow-400" : "text-gray-300"
              } focus:outline-none`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="review" className="block font-semibold mb-1">
          Review:
        </label>
        <textarea
          id="review"
          rows={5}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Write your comments here..."
        ></textarea>
      </div>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition font-semibold"
      >
        Submit Review
      </button>
    </main>
  );
}
