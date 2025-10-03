import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { CheckCircle, Clock, XCircle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

interface Tutor {
  _id: string;
  name: string;
  city?: string;
  profileImage?: string;
  whatsapp?: string;
  phone?: string;
}

interface Booking {
  _id: string;
  tutor: Tutor;
  course?: {
    title?: string;
    description?: string;
    price?: number;
  };
  sessionDate: string;
  sessionTime: string;
  amount: number;
  status: "pending" | "accepted" | "confirmed" | "rejected" | "completed" | "cancelled";
  paymentStatus: "pending" | "success" | "failed";
  createdAt: string;
  canChat?: boolean;
  privateDetailsUnlocked?: boolean;
}

interface PaymentMeta {
  label: string;
  icon: React.ReactNode;
  color: string;
  action?: string;
}

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  confirmed: {
    label: "Confirmed",
    icon: <CheckCircle className="inline-block w-6 h-6 mr-1.5 text-green-600" />,
    color: "bg-green-50 text-green-800 border-green-700",
  },
  accepted: {
    label: "Accepted",
    icon: <CheckCircle className="inline-block w-6 h-6 mr-1.5 text-blue-600" />,
    color: "bg-blue-50 text-blue-800 border-blue-700",
  },
  pending: {
    label: "Pending",
    icon: <Clock className="inline-block w-6 h-6 mr-1.5 text-yellow-600" />,
    color: "bg-yellow-50 text-yellow-800 border-yellow-700",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircle className="inline-block w-6 h-6 mr-1.5 text-green-700" />,
    color: "bg-green-100 text-green-800 border-green-300",
  },
  rejected: {
    label: "Rejected",
    icon: <XCircle className="inline-block w-6 h-6 mr-1.5 text-red-600" />,
    color: "bg-red-50 text-red-800 border-red-700",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle className="inline-block w-6 h-6 mr-1.5 text-gray-600" />,
    color: "bg-gray-50 text-gray-800 border-gray-700",
  },
};

const PAYMENT_META: Record<Booking["paymentStatus"], PaymentMeta> = {
  pending: {
    label: "Payment Unpaid",
    icon: <Clock className="inline-block w-5 h-5 mr-1 text-yellow-600" />,
    color: "bg-yellow-100 text-yellow-700 border-yellow-400",
    action: "Pay Now",
  },
  success: {
    label: "Payment Paid",
    icon: <ShieldCheck className="inline-block w-5 h-5 mr-1 text-green-600" />,
    color: "bg-green-100 text-green-700 border-green-400",
  },
  failed: {
    label: "Payment Failed",
    icon: <XCircle className="inline-block w-5 h-5 mr-1 text-red-600" />,
    color: "bg-red-100 text-red-700 border-red-400",
    action: "Retry Payment",
  },
};

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
function formatTime(timeStr: string) {
  return timeStr;
}

const handlePayNow = async (booking: Booking) => {
  try {
    const token = localStorage.getItem("tm_token");
    const res = await axios.post(
      `${API_BASE_URL}/payments/create-order`,
      { bookingId: booking._id, amount: booking.amount },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const { orderId, razorpayKey, amount } = res.data;
    const options = {
      key: razorpayKey,
      amount: amount,
      currency: "INR",
      name: "TutorMitra",
      description: "Session Booking Payment",
      order_id: orderId,
      handler: async function (response: any) {
        await axios.post(
          `${API_BASE_URL}/payments/verify`,
          {
            bookingId: booking._id,
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        window.location.reload();
      },
      theme: { color: "#0080ff" },
    };
    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    alert("Payment could not be started. Please try again!");
  }
};

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("tm_token");
        const res = await axios.get(`${API_BASE_URL}/bookings/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data.data || []);
      } catch (e) {
        setError("Failed to load bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredBookings = useMemo(() => {
    let filtered = bookings;
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          (b.tutor?.name && b.tutor.name.toLowerCase().includes(lower)) ||
          (b.course?.title && b.course.title.toLowerCase().includes(lower))
      );
    }
    filtered.sort((a, b) => {
      const timeA = new Date(a.sessionDate).getTime();
      const timeB = new Date(b.sessionDate).getTime();
      return timeB - timeA;
    });
    return filtered;
  }, [bookings, searchTerm]);

  if (loading)
    return (
      <div className="max-w-4xl mx-auto p-10 space-y-6 animate-pulse">
        <div className="h-12 rounded bg-gradient-to-r from-yellow-300 to-yellow-500 w-72 mx-auto shadow-lg"></div>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 rounded-3xl h-44 shadow-lg"
          ></div>
        ))}
      </div>
    );
  if (error)
    return (
      <div
        role="alert"
        className="max-w-4xl mx-auto p-10 text-center text-red-700 font-bold text-lg"
      >
        {error}
      </div>
    );

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-8 font-sans">
      <h1 className="text-3xl font-extrabold text-center mb-8 text-green-700 tracking-wide">
        My Bookings
      </h1>
      <input
        type="search"
        placeholder="Search by tutor or course..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-8 p-3 w-full rounded-lg border border-green-300 shadow focus:ring-4 focus:ring-green-200 font-medium"
        aria-label="Search bookings"
      />
      {filteredBookings.length === 0 ? (
        <p className="text-center text-green-700 font-semibold text-lg">
          😞 You have no bookings yet. Book a session!
        </p>
      ) : (
        <ul className="space-y-8">
          {filteredBookings.map((b) => {
            const meta = STATUS_META[b.status] || STATUS_META.pending;
            const pmeta = PAYMENT_META[b.paymentStatus] || PAYMENT_META.pending;
            return (
              <li
                key={b._id}
                tabIndex={0}
                aria-label={`Booking with ${b.tutor?.name} on ${formatDate(b.sessionDate)}, status ${meta.label}`}
                className={`p-6 rounded-2xl border-2 ${meta.color} shadow-lg flex flex-col md:flex-row justify-between items-center gap-6 transition duration-300 hover:scale-[1.02]`}
              >
                <div className="flex flex-col items-center gap-3 md:flex-row md:items-center">
                  <img
                    src={
                      b.tutor.profileImage
                        ? b.tutor.profileImage.startsWith("http")
                          ? b.tutor.profileImage
                          : API_BASE_URL +
                            (b.tutor.profileImage.startsWith("/") ? "" : "/uploads/") +
                            b.tutor.profileImage
                        : "https://ui-avatars.com/api/?name=" +
                          (b.tutor.name ? b.tutor.name.replace(/\s/, "+") : "TM") +
                          "&background=0080ff&color=fff&size=80&bold=true&rounded=true"
                    }
                    className="w-16 h-16 rounded-full object-cover shadow border-2 border-green-300"
                    alt={b.tutor.name}
                  />
                  <div>
                    <div className="font-bold text-green-800 text-lg">{b.tutor.name}</div>
                    <div className="text-gray-500 text-sm">{b.tutor.city || ""}</div>
                  </div>
                </div>
                <div className="flex-1 w-full md:w-auto text-gray-700 mt-4 md:mt-0 space-y-1">
                  <div>
                    <span className="font-semibold">Date:</span> {formatDate(b.sessionDate)}
                  </div>
                  <div>
                    <span className="font-semibold">Time:</span> {formatTime(b.sessionTime)}
                  </div>
                  <div>
                    <span className="font-semibold">Amount:</span>{" "}
                    <span className="text-green-800 font-bold">₹{b.amount}</span>
                  </div>
                  {b.paymentStatus !== "success" && (
                    <div className="mt-2 text-xs text-red-700 font-medium">
                      <ShieldCheck className="inline-block w-4 h-4 mr-1 text-yellow-600" />
                      Booking is <b>not secured</b> until payment is completed.
                    </div>
                  )}
                  {b.canChat && b.privateDetailsUnlocked ? (
                    <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded flex flex-col items-start border border-green-200">
                      <span>
                        <strong>Phone:</strong> {b.tutor.phone || "N/A"}
                      </span>
                      <span>
                        <strong>WhatsApp:</strong> {b.tutor.whatsapp || "N/A"}
                      </span>
                      <button
                        className="mt-2 underline text-green-700 font-semibold"
                        onClick={() => navigate(`/chat?bookingId=${b._id}`)}
                        aria-label="Start chat for booking"
                      >
                        Start Chat
                      </button>
                    </div>
                  ) : (
                    <div className="rounded bg-gray-100 p-2 text-gray-500">
                      Phone: Hidden<br />WhatsApp: Hidden
                      <div className="mt-1 text-xs font-medium text-gray-500">
                        Pay & confirm booking to unlock chat/contact info.
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`flex items-center px-4 py-1.5 rounded-full border font-semibold ${meta.color}`}>
                    {meta.icon}
                    {meta.label}
                  </span>
                  <span className={`flex items-center px-4 py-1.5 rounded-full border font-semibold ${pmeta.color}`}>
                    {pmeta.icon}
                    {pmeta.action && b.paymentStatus !== "success" ? (
                      <button
                        onClick={() => handlePayNow(b)}
                        className="ml-1 underline text-yellow-800"
                      >
                        {pmeta.action}
                      </button>
                    ) : (
                      pmeta.label
                    )}
                  </span>
                  <button
                    className="mt-2 underline text-green-700 font-semibold"
                    onClick={() => navigate(`/tutors/${b.tutor._id}`)}
                  >
                    View Tutor Profile
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
