import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../store/AuthProvider";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

interface Tutor {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  subjects?: string[];
  feePerHour?: number;
  city?: string;
  profileImage?: string;
  whatsapp?: string;
}

interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

export default function Booking() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user, loading: authLoading } = useAuth();

  const authUser = user as AuthUser | null;

  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  function getTutorPhoto(profileImage?: string, name?: string) {
    if (profileImage && profileImage.trim().length > 2) {
      if (profileImage.startsWith("http")) return profileImage;
      if (profileImage.startsWith("/uploads/")) return `${API_BASE_URL}${profileImage}`;
      if (!profileImage.includes("http") && !profileImage.startsWith("/")) return `${API_BASE_URL}/uploads/${profileImage}`;
    }
    let initials = "TM";
    if (typeof name === "string" && name.trim().length > 0) {
      const cleaned = name.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim() || "Tutor";
      const parts = cleaned.split(" ").filter(Boolean);
      initials = parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return `https://ui-avatars.com/api/?name=${initials}&background=0080ff&color=fff&size=128&bold=true&rounded=true`;
  }

  useEffect(() => {
    if (tutor) setAvatarSrc(getTutorPhoto(tutor.profileImage, tutor.name));
  }, [tutor]);

  useEffect(() => {
    if (!authLoading) {
      if (!authUser) navigate("/login");
      else if (authUser.role !== "student") navigate("/unauthorized");
    }
  }, [authUser, authLoading, navigate]);

  useEffect(() => {
    if (authLoading || !authUser || authUser.role !== "student") return;
    async function fetchTutor() {
      if (!courseId) {
        setError("Missing tutor ID in URL.");
        return;
      }
      try {
        setError("");
        const res = await axios.get(`${API_BASE_URL}/tutors/${courseId}`);
        const tutorObj = res.data.tutor || res.data.data || res.data;
        if (tutorObj && tutorObj._id) setTutor(tutorObj);
        else {
          setTutor(null);
          setError("Tutor not found. May be deleted.");
        }
      } catch (err: any) {
        setTutor(null);
        setError("Could not load tutor info. " + (err?.response?.data?.message || ""));
      }
    }
    fetchTutor();
  }, [courseId, authUser, authLoading]);

  async function sendChatRequest(studentId: string, tutorId: string, message: string) {
    try {
      const token = localStorage.getItem("tm_token");
      await axios.post(
        `${API_BASE_URL}/chats/request`,
        {
          from: studentId,
          to: tutorId,
          type: "booking",
          message,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
    } catch {
      // Optional: error handling if needed
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBookingLoading(true);

    if (!courseId || !tutor || !authUser) {
      setError("Invalid tutor or user.");
      setBookingLoading(false);
      return;
    }

    // Always use a proper amount (fallback to 500 if not set)
    const bookingAmount = tutor?.feePerHour && tutor.feePerHour > 0 ? tutor.feePerHour : 500;

    try {
      const token = localStorage.getItem("tm_token");
      const res = await axios.post(
        `${API_BASE_URL}/bookings`,
        {
          tutorId: tutor._id,
          sessionDate,
          sessionTime,
          bookingType: "tutor",
          message: `Booking session on ${sessionDate} at ${sessionTime}`,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (!res.data.success || !res.data.data) {
        setError("Booking failed, please try again.");
        setBookingLoading(false);
        return;
      }
      const booking = res.data.data;

      // If backend did NOT set amount, use feePerHour or fallback as amount
      const amountToPay = booking?.amount && booking.amount > 0 ? booking.amount : bookingAmount;

      // Step 2: Create Razorpay order (amount/currency always sent!)
      let orderRes;
      try {
        orderRes = await axios.post(
          `${API_BASE_URL}/payments/create-order`,
          { bookingId: booking._id, amount: amountToPay, currency: "INR" },
          { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
        );
      } catch (err: any) {
        setError("Could not initiate payment. " + (err?.response?.data?.message || ""));
        setBookingLoading(false);
        return;
      }

      if (!orderRes.data?.razorpayKey || !orderRes.data?.orderId) {
        setError("Payment service not available (missing Razorpay configuration)");
        setBookingLoading(false);
        return;
      }

      const options = {
        key: orderRes.data.razorpayKey,
        amount: orderRes.data.amount,
        currency: "INR",
        name: "TutorMitra",
        description: `Payment for booking ID: ${booking._id}`,
        order_id: orderRes.data.orderId,
        handler: async function (response: any) {
          try {
           await axios.post(
  `${API_BASE_URL}/payments/verify`,
  {
    bookingId: booking._id,
    razorpay_order_id: response.razorpay_order_id,
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_signature: response.razorpay_signature,
  },
  { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
);

            await sendChatRequest(authUser._id, tutor._id, `Student ${authUser.name} booked a session and paid.`);
            navigate("/booking-confirmation", {
              state: {
                tutorName: tutor.name,
                date: sessionDate,
                time: sessionTime,
                amount: amountToPay,
                sessionType: tutor.subjects?.join(", ") || "Session",
              },
            });
          } catch (err: any) {
            setError("Payment verification failed: " + (err?.response?.data?.message || ""));
          }
        },
        prefill: {
          name: authUser.name,
          email: authUser.email,
          contact: authUser?.phone ?? "",
        },
        theme: { color: "#0080ff" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError("An error occurred during booking/payment. " + (err?.response?.data?.message || ""));
    } finally {
      setBookingLoading(false);
    }
  }

  if (authLoading)
    return (
      <div className="flex min-h-[60vh] justify-center items-center text-indigo-600 font-bold text-xl animate-pulse">
        Checking login...
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-[60vh] justify-center items-center">
        <span className="bg-red-100 text-red-700 px-6 py-3 rounded border border-red-400 shadow">{error}</span>
      </div>
    );

  if (!tutor)
    return (
      <div className="flex min-h-[60vh] justify-center items-center text-gray-500 font-semibold">
        Loading tutor info...
      </div>
    );

  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center bg-transparent">
      <div className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/80 rounded-2xl shadow-lg border border-blue-300 dark:border-blue-700 p-8 w-full max-w-md mx-auto">
        <div className="flex flex-col items-center mb-6">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={tutor.name}
              onError={() => setAvatarSrc(getTutorPhoto(undefined, tutor.name))}
              className="w-20 h-20 rounded-full border-4 border-indigo-500 shadow-lg mb-3 object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-indigo-500 text-white flex items-center justify-center text-2xl font-bold mb-3">
              {tutor.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h2 className="text-3xl font-bold text-indigo-700 mb-2">Book Your Session</h2>
          <span className="px-3 py-1 rounded-full text-indigo-600 bg-indigo-100 mb-4">{tutor.city || "No City"}</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div>
            <label className="block text-indigo-700 font-semibold mb-1">Tutor</label>
            <div className="p-3 rounded bg-indigo-50 font-medium">{tutor.name}</div>
          </div>
          <div>
            <label className="block text-indigo-700 font-semibold mb-1">Subjects</label>
            <div className="p-3 rounded bg-indigo-50">{tutor.subjects?.join(", ") || "N/A"}</div>
          </div>
          <div>
            <label htmlFor="sessionDate" className="block text-indigo-700 font-semibold mb-1">
              Session Date
            </label>
            <input
              id="sessionDate"
              type="date"
              className="w-full rounded border border-indigo-300 px-3 py-2"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="sessionTime" className="block text-indigo-700 font-semibold mb-1">
              Session Time
            </label>
            <input
              id="sessionTime"
              type="time"
              className="w-full rounded border border-indigo-300 px-3 py-2"
              value={sessionTime}
              onChange={(e) => setSessionTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-indigo-700 font-semibold mb-1">Price (₹)</label>
            <input
              type="number"
              className="w-full rounded border border-indigo-300 px-3 py-2 bg-indigo-50"
              value={tutor.feePerHour || 500}
              disabled
            />
          </div>
          <button
            type="submit"
            disabled={bookingLoading}
            className={`w-full py-3 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition ${
              bookingLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {bookingLoading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </section>
  );
}
