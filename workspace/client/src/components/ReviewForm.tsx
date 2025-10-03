import React, { useState } from "react";
import axios from "axios";

interface ReviewFormProps {
  tutorId: string;
  onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ tutorId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submitReview = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    try {
      await axios.post("/review", { tutorId, rating, comment });
      setRating(0);
      setComment("");
      setError(null);
      onReviewSubmitted();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit review");
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Submit a Review</h3>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <div>
        <label>Rating:</label>
        <select value={rating} onChange={(e) => setRating(parseInt(e.target.value, 10))}>
          <option value={0}>Select rating</option>
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>
              {r} Star{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Comment:</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} />
      </div>
      <button onClick={submitReview} className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded">
        Submit
      </button>
    </div>
  );
};

export default ReviewForm;
