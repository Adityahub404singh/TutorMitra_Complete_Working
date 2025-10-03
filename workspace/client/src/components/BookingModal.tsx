import React, { useState } from "react";
import http from "../api/http";

interface BookingModalProps {
  tutorId: string;
  tutorName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const slots = ["10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM", "5:00 PM - 6:00 PM"];

export default function BookingModal({ tutorId, tutorName, onClose, onConfirm }: BookingModalProps) {
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!selectedSlot) {
      alert("Please select a slot");
      return;
    }
    setLoading(true);
    try {
      // Step 1: Create booking in DB FIRST (returns bookingId)
      const bookingRes = await http.post("/bookings", {
        tutorId,
        tutorName,
        slot: selectedSlot,
        // add more info as needed
      });

      const bookingId = bookingRes.data.data?._id;
      if (!bookingId) {
        alert("Failed to create booking. Try again.");
        setLoading(false);
        return;
      }

      // Step 2: Create Razorpay order for payment
      const orderRes = await http.post("/payments/create-order", {
        bookingId,
        amount: 500, // or pull dynamic fee
        currency: "INR",
      });

      const razorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        order_id: orderRes.data.orderId,
        name: "TutorMitra",
        description: `Booking for ${tutorName}`,
        handler: async (response: any) => {
          try {
            // Step 3: Verify payment and unlock chat/details
            await http.post("/payments/verify", {
              bookingId,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            alert("Payment successful! Booking confirmed.");
            onConfirm(); // can close modal or reload parent
          } catch (err) {
            alert("Payment verification failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        theme: { color: "#4f46e5" },
      };

      const rzp = new (window as any).Razorpay(razorpayOptions);
      rzp.open();
    } catch {
      alert("Failed to initiate payment. Try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
      aria-labelledby="booking-modal-title"
    >
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg space-y-6">
        <h2 id="booking-modal-title" className="text-xl font-semibold">
          Book {tutorName}
        </h2>

        <label htmlFor="slot-select" className="block mb-2 font-medium">
          Select Booking Slot
        </label>
        <select
          id="slot-select"
          value={selectedSlot}
          onChange={(e) => setSelectedSlot(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-required="true"
        >
          <option value="">Select a slot</option>
          {slots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {loading ? "Processing..." : "Pay & Book"}
          </button>
        </div>
      </div>
    </div>
  );
}
