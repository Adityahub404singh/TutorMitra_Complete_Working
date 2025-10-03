import React, { useEffect, useState } from "react";
import axios from "axios";

interface Booking {
  _id: string;
  studentId: {
    name: string;
    email: string;
  };
  sessionDate: string;
  sessionTime: string;
  subject: string;
  price: number;
  status: string;
}

const TutorBookingList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/tutor/bookings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("tm_token")}` },
      });
      setBookings(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId: string, status: string) => {
    try {
      await axios.patch(
        `/api/tutor/bookings/${bookingId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem("tm_token")}` } }
      );
      fetchBookings(); // refresh list
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update status");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
      {bookings.length === 0 && <p>No bookings found.</p>}
      <ul>
        {bookings.map((booking) => (
          <li key={booking._id} className="border p-4 mb-3 rounded shadow">
            <p><strong>Student:</strong> {booking.studentId.name} ({booking.studentId.email})</p>
            <p><strong>Subject:</strong> {booking.subject}</p>
            <p><strong>Date & Time:</strong> {booking.sessionDate} at {booking.sessionTime}</p>
            <p><strong>Price:</strong> ₹{booking.price}</p>
            <p><strong>Status:</strong> {booking.status}</p>
            <div className="mt-2">
              {booking.status === "pending" && (
                <>
                  <button
                    className="mr-2 px-3 py-1 bg-green-500 text-white rounded"
                    onClick={() => updateStatus(booking._id, "confirmed")}
                  >
                    Confirm
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded"
                    onClick={() => updateStatus(booking._id, "cancelled")}
                  >
                    Cancel
                  </button>
                </>
              )}
              {booking.status !== "pending" && <span>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TutorBookingList;
