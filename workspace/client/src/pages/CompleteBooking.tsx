
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CompleteBooking() {
  const navigate = useNavigate();

  // Example state for form fields, expand for full form as needed
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionType, setSessionType] = useState("Online");
  const [amountPaid] = useState(500); // Assume fixed for demo

  function handleBookingSuccess() {
    if (!selectedDate || !selectedTime) {
      alert("Please select date and time");
      return;
    }
    const bookingDetails = {
      tutorName: "Sneha Sharma",  // Replace dynamically as needed
      date: selectedDate,
      time: selectedTime,
      sessionType,
      amountPaid,
    };
    navigate("/booking-confirmation", { state: bookingDetails });
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-indigo-900 mb-6">Complete Your Booking</h1>

      <label className="mb-1 font-semibold">Select Date</label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded w-60"
      />

      <label className="mb-1 font-semibold">Select Time</label>
      <input
        type="time"
        value={selectedTime}
        onChange={(e) => setSelectedTime(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded w-60"
      />

      <label className="mb-1 font-semibold">Session Type</label>
      <select
        value={sessionType}
        onChange={(e) => setSessionType(e.target.value)}
        className="mb-6 p-2 border border-gray-300 rounded w-60"
      >
        <option value="Online">Online</option>
        <option value="In-Person">In-Person</option>
        <option value="Group">Group Session</option>
        <option value="One-on-One">One-on-One</option>
      </select>

      <button
        onClick={handleBookingSuccess}
        className="bg-blue-600 text-white px-8 py-3 rounded shadow hover:bg-blue-700 transition font-semibold"
      >
        Confirm Booking
      </button>
    </div>
  );
}
