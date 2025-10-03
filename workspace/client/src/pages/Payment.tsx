import React, { useState } from "react";
import axios from "axios";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color: string };
}

interface PaymentPageProps {
  bookingId: string;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ bookingId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create order on backend with bookingId
      const { data } = await axios.post("/payments/create-order", {
        bookingId,
        amount: 500,
        currency: "INR",
      });

      if (!data.razorpayKey || !data.orderId) {
        setError("Payment service unavailable or backend error.");
        setLoading(false);
        return;
      }

      const options: RazorpayOptions = {
        key: data.razorpayKey,
        amount: data.amount,
        currency: data.currency,
        name: "TutorMitra",
        description: "Booking Payment",
        order_id: data.orderId,
        handler: async function (response) {
          // ✅ FIELD NAMES SAHI RAKHO YAHAN!
          try {
            const verifyRes = await axios.post("/payments/verify", {
              bookingId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              alert("Payment Successful!");
            } else {
              alert("Payment verification failed");
            }
          } catch {
            alert("Payment verification error");
          }
        },
        prefill: {
          name: "Student Name",
          email: "student@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#F59E0B",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", function (response: any) {
        alert("Payment failed: " + response.error.description);
      });

    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Could not initiate payment. Failed to create payment order"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!bookingId) {
    return (
      <div className="text-center py-12 text-lg text-red-600 font-bold">
        Booking ID missing. Cannot process payment.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl mb-6 text-center font-bold text-yellow-600">Book Session - Payment</h2>
      {error && (
        <div className="text-center text-red-700 bg-red-100 border border-red-400 rounded p-4 mb-4">
          {error}
        </div>
      )}
      <button
        onClick={startPayment}
        disabled={loading}
        className={`w-full py-3 rounded font-bold text-white ${
          loading ? "bg-yellow-300" : "bg-yellow-500 hover:bg-yellow-600"
        }`}
      >
        {loading ? "Processing..." : "Pay ₹500 Now"}
      </button>
    </div>
  );
};

export default PaymentPage;
