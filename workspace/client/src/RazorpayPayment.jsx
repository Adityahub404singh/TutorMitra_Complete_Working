import React, { useState, useEffect } from "react";
import axios from "axios";

function RazorpayPayment() {
  const [amount, setAmount] = useState("");
  const [razorpayReady, setRazorpayReady] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setRazorpayReady(true);
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handlePayment = async () => {
    if (!amount) return alert("Enter amount!");

    try {
      const { data } = await axios.post("http://localhost:3000/create-order", { amount, currency: "INR" });
      if (!data.success) return alert("Order creation failed");

      const options = {
        key: "rzp_test_R8cCWPRutoU76Y",
        amount: amount * 100,
        currency: "INR",
        name: "TutorMitra",
        description: "Course Payment",
        order_id: data.orderId,
        handler: async (response) => {
          const verify = await axios.post("http://localhost:3000/verify-payment", {
            orderId: data.orderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          if (verify.data.success) alert("Payment successful!");
          else alert("Payment verification failed!");
        },
        prefill: { name: "Test User", email: "test@example.com", contact: "9000000000" },
        theme: { color: "#528FF0" },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert("Razorpay SDK not loaded");
      }
    } catch (err) {
      alert("Payment Error: " + err.message);
    }
  };

  return (
    <div>
      <input type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} />
      <button onClick={handlePayment} disabled={!razorpayReady}>Pay with Razorpay</button>
    </div>
  );
}

export default RazorpayPayment;
