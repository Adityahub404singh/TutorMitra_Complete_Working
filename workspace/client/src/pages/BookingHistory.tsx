import React, { useEffect, useState } from "react";
import http from "../api/http";
import { useNavigate } from "react-router-dom";

interface Booking {
  _id: string;
  tutorId: { name: string } | null;
  subject: string;
  sessionDate: string;
  sessionTime: string;
  status: string;
  price: number;
}

export default function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await http.get("/booking/my");
        if (res.data.success) {
          setBookings(res.data.bookings);
        }
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return <p className="text-center mt-8">Loading your booking history...</p>;
  }

  if (bookings.length === 0) {
    return <p className="text-center mt-8 text-gray-500">You have no bookings yet.</p>;
  }

  return (
    <main className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Bookings</h2>
      <ul>
        {bookings.map(({ _id, tutorId, subject, sessionDate, sessionTime, status, price }) => (
          <li
            key={_id}
            className="border-b py-4 cursor-pointer hover:bg-yellow-50"
            onClick={() => navigate(`/booking/${_id}`)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{tutorId?.name || "Unknown Tutor"}</h3>
                <p className="text-gray-600">{subject}</p>
                <p className="text-sm text-gray-500">
                  {new Date(sessionDate).toLocaleDateString()} | {sessionTime}
                </p>
              </div>
              <div>
                <span
                  className={`py-1 px-3 rounded-full text-white text-xs font-semibold ${
                    status === "confirmed"
                      ? "bg-green-600"
                      : status === "pending"
                      ? "bg-yellow-600"
                      : "bg-red-600"
                  }`}
                >
                  {status}
                </span>
                <p className="text-right font-bold mt-1">₹{price}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
