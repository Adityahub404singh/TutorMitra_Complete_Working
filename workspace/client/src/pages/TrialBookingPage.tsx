import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthProvider";

// Props type sahi define karo
export interface TrialBookingPageProps {
  price: number;
  btnLabel: string;
  bookingTypes: { value: string; label: string }[];
  defaultBookingType?: string;
}

const TrialBookingPage: React.FC<TrialBookingPageProps> = ({
  price,
  btnLabel,
  bookingTypes,
  defaultBookingType = "trial"
}) => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [bookingType, setBookingType] = useState(defaultBookingType);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      if (user && user._id) {
        await axios.post("/api/trial-bookings", {
          courseId,
          sessionDate,
          sessionTime,
          bookingType,
          studentId: user._id,
          price,
        });
        navigate("/my-bookings");
      } else {
        alert("User not logged in.");
      }
    } catch {
      alert("Failed to book trial.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center mt-12">
      <form className="bg-indigo-900 p-8 rounded-xl shadow w-full max-w-md mx-auto">
        <h2 className="text-lg font-bold text-white mb-4">Trial Session Booking</h2>
        <label className="block mb-3 text-white">
          Session Date
          <input
            type="date"
            value={sessionDate}
            onChange={e => setSessionDate(e.target.value)}
            required
            className="block w-full mt-1"
          />
        </label>
        <label className="block mb-3 text-white">
          Session Time
          <input
            type="time"
            value={sessionTime}
            onChange={e => setSessionTime(e.target.value)}
            required
            className="block w-full mt-1"
          />
        </label>
        <label className="block mb-3 text-white">
          Booking Type
          <select
            value={bookingType}
            onChange={e => setBookingType(e.target.value)}
            className="block w-full mt-1"
          >
            {bookingTypes.map(bt => (
              <option key={bt.value} value={bt.value}>{bt.label}</option>
            ))}
          </select>
        </label>
        <div className="mb-3">
          <span className="text-white">Price (₹):</span>
          <input
            type="number"
            readOnly
            value={price}
            className="ml-2 bg-gray-100 px-2 py-1 rounded"
          />
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={handleConfirm}
          className="bg-blue-500 text-white py-3 px-8 rounded-lg font-bold w-full"
        >
          {loading ? "Booking..." : btnLabel}
        </button>
      </form>
    </div>
  );
};

export default TrialBookingPage;
