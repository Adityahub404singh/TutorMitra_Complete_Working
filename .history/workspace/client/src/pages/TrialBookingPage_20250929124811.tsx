import React, { useState } from "react";
import axios from "axios";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthProvider";

export default function TrialBookingPage() {
  const [params] = useSearchParams();
  const { tutorId } = useParams();
  const courseId = params.get("courseId");
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [price, setPrice] = useState(99); // Trial price
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await axios.post("/api/trial-bookings", {
        tutorId,
        courseId,
        sessionDate,
        sessionTime,
        studentId: user._id,
        price
      });
      alert("Trial booked! Valid for 3 days. WhatsApp/email details sent.");
      navigate("/my-bookings");
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
          <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)} required className="block w-full mt-1" />
        </label>
        <label className="block mb-3 text-white">
          Session Time
          <input type="time" value={sessionTime} onChange={e => setSessionTime(e.target.value)} required className="block w-full mt-1" />
        </label>
        <div className="mb-3">
          <span className="text-white">Trial Price (₹):</span>
          <span className="text-yellow-200 font-bold ml-2">{price}</span>
        </div>
        <button type="button" disabled={loading} onClick={handleConfirm} className="bg-blue-500 text-white py-3 px-8 rounded-lg font-bold w-full">
          {loading ? "Booking..." : "Confirm Trial (3-Day)"}
        </button>
        <div className="text-xs mt-2 text-white/80">
          Trial session valid till: <span className="font-bold">{sessionDate ? (new Date(new Date(sessionDate).getTime() + 3*24*60*60*1000)).toLocaleDateString() : '-'}</span>
        </div>
      </form>
    </div>
  );
}
